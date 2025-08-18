import { supabase } from './supabase'
import type { UserProfile, UserPreferences, UserStatistics, MeditationSession } from '@/types'
import type { Database, Json } from '@/types/database'
import { 
  getMeditationData, 
  saveMeditationData, 
  getUserPreferences, 
  saveUserPreferences,
  calculateStatistics,
  DEFAULT_USER_PREFERENCES 
} from '@/utils/localStorage'

type UserProfileRow = Database['public']['Tables']['user_profiles']['Row']
type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']

export class UserProfileService {
  /**
   * Get user profile from Supabase
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist
          return null
        }
        throw error
      }

      return this.mapRowToProfile(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
      throw new Error('Failed to fetch user profile')
    }
  }

  /**
   * Create user profile in Supabase
   */
  static async createUserProfile(
    userId: string, 
    displayName?: string,
    preferences?: UserPreferences
  ): Promise<UserProfile> {
    try {
      const defaultPreferences = preferences || DEFAULT_USER_PREFERENCES
      const defaultStatistics: UserStatistics = {
        totalSessions: 0,
        totalDuration: 0,
        currentStreak: 0,
        longestStreak: 0,
        favoriteScripts: []
      }

      const profileData: UserProfileInsert = {
        id: userId,
        display_name: displayName || null,
        preferences: defaultPreferences as unknown as Json,
        statistics: defaultStatistics as unknown as Json
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single()

      if (error) {
        throw error
      }

      return this.mapRowToProfile(data)
    } catch (error) {
      console.error('Error creating user profile:', error)
      throw new Error('Failed to create user profile')
    }
  }

  /**
   * Update user profile in Supabase
   */
  static async updateUserProfile(
    userId: string, 
    updates: Partial<Pick<UserProfile, 'displayName' | 'preferences' | 'statistics'>>
  ): Promise<UserProfile> {
    try {
      const updateData: UserProfileUpdate = {}

      if (updates.displayName !== undefined) {
        updateData.display_name = updates.displayName
      }
      if (updates.preferences) {
        updateData.preferences = updates.preferences as unknown as Json
      }
      if (updates.statistics) {
        updateData.statistics = updates.statistics as unknown as Json
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return this.mapRowToProfile(data)
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw new Error('Failed to update user profile')
    }
  }

  /**
   * Get or create user profile
   */
  static async getOrCreateUserProfile(
    userId: string, 
    displayName?: string
  ): Promise<UserProfile> {
    let profile = await this.getUserProfile(userId)
    
    if (!profile) {
      // Merge local preferences if they exist
      const localPreferences = getUserPreferences()
      profile = await this.createUserProfile(userId, displayName, localPreferences)
    }

    return profile
  }

  /**
   * Update user preferences
   */
  static async updateUserPreferences(
    userId: string, 
    preferences: UserPreferences
  ): Promise<void> {
    try {
      // Update in Supabase
      await this.updateUserProfile(userId, { preferences })
      
      // Update local storage as well for immediate UI updates
      saveUserPreferences(preferences)
    } catch (error) {
      console.error('Error updating user preferences:', error)
      throw new Error('Failed to update user preferences')
    }
  }

  /**
   * Update user statistics
   */
  static async updateUserStatistics(
    userId: string, 
    statistics: UserStatistics
  ): Promise<void> {
    try {
      await this.updateUserProfile(userId, { statistics })
    } catch (error) {
      console.error('Error updating user statistics:', error)
      throw new Error('Failed to update user statistics')
    }
  }

  /**
   * Sync local data to cloud for authenticated user
   */
  static async syncLocalDataToCloud(userId: string): Promise<void> {
    try {
      // Get local data
      const localData = getMeditationData()
      const localStats = calculateStatistics()

      // Get current profile
      const profile = await this.getOrCreateUserProfile(userId)

      // Update statistics with local data
      const updatedStats: UserStatistics = {
        totalSessions: Math.max(profile.statistics.totalSessions, localStats.totalSessions),
        totalDuration: Math.max(profile.statistics.totalDuration, localStats.totalDuration),
        currentStreak: Math.max(profile.statistics.currentStreak, localStats.currentStreak),
        longestStreak: Math.max(profile.statistics.longestStreak, localStats.longestStreak),
        favoriteScripts: [...new Set([...profile.statistics.favoriteScripts, ...localStats.favoriteScripts])]
      }

      // Update profile with merged data
      await this.updateUserProfile(userId, {
        preferences: localData.preferences,
        statistics: updatedStats
      })

      // Sync meditation sessions
      await this.syncMeditationSessions(userId, localData.sessions)

      // Mark as synced
      localData.lastSyncAt = new Date()
      saveMeditationData(localData)

    } catch (error) {
      console.error('Error syncing local data to cloud:', error)
      throw new Error('Failed to sync local data to cloud')
    }
  }

  /**
   * Sync meditation sessions to cloud
   */
  private static async syncMeditationSessions(userId: string, localSessions: MeditationSession[]): Promise<void> {
    try {
      // Get existing sessions from cloud
      const { data: existingSessions, error } = await supabase
        .from('meditation_sessions')
        .select('id')
        .eq('user_id', userId)

      if (error) {
        throw error
      }

      const existingIds = new Set(existingSessions?.map(s => s.id) || [])

      // Filter out sessions that already exist in cloud
      const sessionsToSync = localSessions.filter(session => !existingIds.has(session.id))

      if (sessionsToSync.length === 0) {
        return
      }

      // Prepare sessions for insertion
      const sessionsData = sessionsToSync.map(session => ({
        id: session.id,
        user_id: userId,
        script_id: session.scriptId,
        start_time: session.startTime.toISOString(),
        end_time: session.endTime?.toISOString() || null,
        completed: session.completed,
        duration: session.duration,
        rating: session.rating || null,
        notes: session.notes || null,
        device_info: session.deviceInfo || null
      }))

      // Insert sessions in batches
      const batchSize = 100
      for (let i = 0; i < sessionsData.length; i += batchSize) {
        const batch = sessionsData.slice(i, i + batchSize)
        const { error: insertError } = await supabase
          .from('meditation_sessions')
          .insert(batch)

        if (insertError) {
          throw insertError
        }
      }

    } catch (error) {
      console.error('Error syncing meditation sessions:', error)
      throw error
    }
  }

  /**
   * Load user data from cloud to local storage
   */
  static async loadCloudDataToLocal(userId: string): Promise<void> {
    try {
      // Get user profile
      const profile = await this.getUserProfile(userId)
      if (profile) {
        // Update local preferences
        saveUserPreferences(profile.preferences)
      }

      // Get meditation sessions from cloud
      const { data: sessions, error } = await supabase
        .from('meditation_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: false })

      if (error) {
        throw error
      }

      if (sessions && sessions.length > 0) {
        // Convert to local format
        const localSessions: MeditationSession[] = sessions.map(session => ({
          id: session.id,
          userId: session.user_id || undefined,
          scriptId: session.script_id,
          startTime: new Date(session.start_time),
          endTime: session.end_time ? new Date(session.end_time) : undefined,
          completed: session.completed,
          duration: session.duration || 0,
          rating: session.rating || undefined,
          notes: session.notes || undefined,
          deviceInfo: (session.device_info as { userAgent: string; screenSize: string }) || { userAgent: '', screenSize: '' }
        }))

        // Merge with local data
        const localData = getMeditationData()
        const existingIds = new Set(localData.sessions.map(s => s.id))
        const newSessions = localSessions.filter(s => !existingIds.has(s.id))

        localData.sessions = [...localData.sessions, ...newSessions]
        localData.lastSyncAt = new Date()
        saveMeditationData(localData)
      }

    } catch (error) {
      console.error('Error loading cloud data to local:', error)
      throw new Error('Failed to load cloud data')
    }
  }

  /**
   * Convert database row to UserProfile type
   */
  private static mapRowToProfile(row: UserProfileRow): UserProfile {
    return {
      id: row.id,
      email: '', // Email comes from auth.users, not user_profiles
      displayName: row.display_name || undefined,
      preferences: row.preferences as unknown as UserPreferences,
      statistics: row.statistics as unknown as UserStatistics,
      createdAt: new Date(row.created_at),
      lastActiveAt: new Date(row.updated_at)
    }
  }

  /**
   * Delete user profile and all associated data
   */
  static async deleteUserProfile(userId: string): Promise<void> {
    try {
      // Delete meditation sessions first (due to foreign key constraint)
      const { error: sessionsError } = await supabase
        .from('meditation_sessions')
        .delete()
        .eq('user_id', userId)

      if (sessionsError) {
        throw sessionsError
      }

      // Delete user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId)

      if (profileError) {
        throw profileError
      }

    } catch (error) {
      console.error('Error deleting user profile:', error)
      throw new Error('Failed to delete user profile')
    }
  }
}
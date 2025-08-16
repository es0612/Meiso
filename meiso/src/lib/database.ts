import { supabase } from './supabase'
import type { Database } from '@/types/database'
import type { MeditationSession, UserProfile } from '@/types'

type Tables = Database['public']['Tables']
type UserProfileRow = Tables['user_profiles']['Row']
type UserProfileInsert = Tables['user_profiles']['Insert']
type UserProfileUpdate = Tables['user_profiles']['Update']
type MeditationSessionRow = Tables['meditation_sessions']['Row']
type MeditationSessionInsert = Tables['meditation_sessions']['Insert']
type MeditationSessionUpdate = Tables['meditation_sessions']['Update']

export class DatabaseService {
  /**
   * User Profile Operations
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null
      }
      throw new Error(error.message)
    }

    return this.mapUserProfileRow(data)
  }

  static async createUserProfile(profile: UserProfileInsert): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(profile)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return this.mapUserProfileRow(data)
  }

  static async updateUserProfile(userId: string, updates: UserProfileUpdate): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return this.mapUserProfileRow(data)
  }

  /**
   * Meditation Session Operations
   */
  static async createMeditationSession(session: MeditationSessionInsert): Promise<MeditationSession> {
    const { data, error } = await supabase
      .from('meditation_sessions')
      .insert(session)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return this.mapMeditationSessionRow(data)
  }

  static async updateMeditationSession(
    sessionId: string, 
    updates: MeditationSessionUpdate
  ): Promise<MeditationSession> {
    const { data, error } = await supabase
      .from('meditation_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return this.mapMeditationSessionRow(data)
  }

  static async getMeditationSessions(
    userId?: string,
    limit = 50,
    offset = 0
  ): Promise<MeditationSession[]> {
    let query = supabase
      .from('meditation_sessions')
      .select('*')
      .order('start_time', { ascending: false })
      .range(offset, offset + limit - 1)

    if (userId) {
      query = query.eq('user_id', userId)
    } else {
      // For anonymous users, only get sessions without user_id
      query = query.is('user_id', null)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    return data.map(this.mapMeditationSessionRow)
  }

  static async getMeditationSessionById(sessionId: string): Promise<MeditationSession | null> {
    const { data, error } = await supabase
      .from('meditation_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(error.message)
    }

    return this.mapMeditationSessionRow(data)
  }

  static async deleteMeditationSession(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from('meditation_sessions')
      .delete()
      .eq('id', sessionId)

    if (error) {
      throw new Error(error.message)
    }
  }

  /**
   * Statistics and Analytics
   */
  static async getUserStatistics(userId?: string) {
    let query = supabase
      .from('meditation_sessions')
      .select('completed, duration, start_time')

    if (userId) {
      query = query.eq('user_id', userId)
    } else {
      query = query.is('user_id', null)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    const totalSessions = data.length
    const completedSessions = data.filter(s => s.completed).length
    const totalDuration = data.reduce((sum, s) => sum + (s.duration || 0), 0)

    // Calculate streak
    const sortedSessions = data
      .filter(s => s.completed)
      .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    let lastDate: Date | null = null

    for (const session of sortedSessions) {
      const sessionDate = new Date(session.start_time)
      sessionDate.setHours(0, 0, 0, 0)

      if (!lastDate) {
        tempStreak = 1
        currentStreak = 1
      } else {
        const dayDiff = Math.floor((lastDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (dayDiff === 1) {
          tempStreak++
          if (currentStreak === tempStreak - 1) {
            currentStreak = tempStreak
          }
        } else if (dayDiff > 1) {
          if (currentStreak === tempStreak) {
            currentStreak = 0
          }
          tempStreak = 1
        }
      }

      longestStreak = Math.max(longestStreak, tempStreak)
      lastDate = sessionDate
    }

    return {
      totalSessions,
      completedSessions,
      totalDuration,
      currentStreak,
      longestStreak,
      completionRate: totalSessions > 0 ? completedSessions / totalSessions : 0
    }
  }

  /**
   * Data mapping utilities
   */
  private static mapUserProfileRow(row: UserProfileRow): UserProfile {
    const defaultPreferences: UserProfile['preferences'] = {
      defaultScript: 'basic-breathing',
      audioEnabled: true,
      volume: 0.8,
      notifications: false,
      theme: 'auto'
    }

    const defaultStatistics: UserProfile['statistics'] = {
      totalSessions: 0,
      totalDuration: 0,
      currentStreak: 0,
      longestStreak: 0,
      favoriteScripts: []
    }

    return {
      id: row.id,
      email: '', // This would come from auth.users
      displayName: row.display_name || undefined,
      preferences: (row.preferences as unknown as UserProfile['preferences']) || defaultPreferences,
      statistics: (row.statistics as unknown as UserProfile['statistics']) || defaultStatistics,
      createdAt: new Date(row.created_at),
      lastActiveAt: new Date(row.updated_at)
    }
  }

  private static mapMeditationSessionRow(row: MeditationSessionRow): MeditationSession {
    return {
      id: row.id,
      userId: row.user_id || undefined,
      scriptId: row.script_id,
      startTime: new Date(row.start_time),
      endTime: row.end_time ? new Date(row.end_time) : undefined,
      completed: row.completed,
      duration: row.duration || 0,
      rating: row.rating || undefined,
      notes: row.notes || undefined,
      deviceInfo: row.device_info as MeditationSession['deviceInfo'] || {
        userAgent: '',
        screenSize: ''
      }
    }
  }
}
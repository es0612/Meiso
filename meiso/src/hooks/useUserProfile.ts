'use client'

import { useState, useEffect, useCallback } from 'react'
import { UserProfileService } from '@/lib/userProfile'
import { useAuthContext } from '@/contexts/AuthContext'
import type { UserProfile, UserPreferences, UserStatistics } from '@/types'
import { getUserPreferences, calculateStatistics } from '@/utils/localStorage'

interface UseUserProfileReturn {
  profile: UserProfile | null
  loading: boolean
  error: string | null
  updateProfile: (updates: Partial<Pick<UserProfile, 'displayName'>>) => Promise<void>
  updatePreferences: (preferences: UserPreferences) => Promise<void>
  updateStatistics: (statistics: UserStatistics) => Promise<void>
  syncLocalToCloud: () => Promise<void>
  loadCloudToLocal: () => Promise<void>
  refreshProfile: () => Promise<void>
}

export function useUserProfile(): UseUserProfileReturn {
  const { user, loading: authLoading } = useAuthContext()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load profile when user changes
  useEffect(() => {
    if (authLoading) return

    if (user && !user.is_anonymous) {
      loadProfile()
    } else {
      // For anonymous users, create a local profile
      setProfile(createLocalProfile())
    }
  }, [user, authLoading])

  const createLocalProfile = useCallback((): UserProfile => {
    const preferences = getUserPreferences()
    const statistics = calculateStatistics()
    
    return {
      id: 'anonymous',
      email: '',
      displayName: undefined,
      preferences,
      statistics,
      createdAt: new Date(),
      lastActiveAt: new Date()
    }
  }, [])

  const loadProfile = useCallback(async () => {
    if (!user || user.is_anonymous) return

    setLoading(true)
    setError(null)

    try {
      const userProfile = await UserProfileService.getOrCreateUserProfile(
        user.id,
        user.user_metadata?.display_name
      )
      setProfile(userProfile)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile'
      setError(errorMessage)
      console.error('Error loading user profile:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  const updateProfile = useCallback(async (updates: Partial<Pick<UserProfile, 'displayName'>>) => {
    if (!user || user.is_anonymous) {
      throw new Error('Cannot update profile for anonymous user')
    }

    setLoading(true)
    setError(null)

    try {
      const updatedProfile = await UserProfileService.updateUserProfile(user.id, updates)
      setProfile(updatedProfile)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [user])

  const updatePreferences = useCallback(async (preferences: UserPreferences) => {
    if (!user || user.is_anonymous) {
      // For anonymous users, just update local storage
      const localProfile = createLocalProfile()
      localProfile.preferences = preferences
      setProfile(localProfile)
      return
    }

    setLoading(true)
    setError(null)

    try {
      await UserProfileService.updateUserPreferences(user.id, preferences)
      
      // Update local profile state
      if (profile) {
        setProfile({
          ...profile,
          preferences
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update preferences'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [user, profile, createLocalProfile])

  const updateStatistics = useCallback(async (statistics: UserStatistics) => {
    if (!user || user.is_anonymous) {
      // For anonymous users, just update local profile
      if (profile) {
        setProfile({
          ...profile,
          statistics
        })
      }
      return
    }

    setLoading(true)
    setError(null)

    try {
      await UserProfileService.updateUserStatistics(user.id, statistics)
      
      // Update local profile state
      if (profile) {
        setProfile({
          ...profile,
          statistics
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update statistics'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [user, profile])

  const syncLocalToCloud = useCallback(async () => {
    if (!user || user.is_anonymous) {
      throw new Error('Cannot sync data for anonymous user')
    }

    setLoading(true)
    setError(null)

    try {
      await UserProfileService.syncLocalDataToCloud(user.id)
      // Refresh profile after sync
      await loadProfile()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync data to cloud'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [user, loadProfile])

  const loadCloudToLocal = useCallback(async () => {
    if (!user || user.is_anonymous) {
      throw new Error('Cannot load cloud data for anonymous user')
    }

    setLoading(true)
    setError(null)

    try {
      await UserProfileService.loadCloudDataToLocal(user.id)
      // Refresh profile after loading
      await loadProfile()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load cloud data'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [user, loadProfile])

  const refreshProfile = useCallback(async () => {
    await loadProfile()
  }, [loadProfile])

  return {
    profile,
    loading,
    error,
    updateProfile,
    updatePreferences,
    updateStatistics,
    syncLocalToCloud,
    loadCloudToLocal,
    refreshProfile
  }
}
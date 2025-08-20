// Set up environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

// Mock Supabase
const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn()
      }))
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn()
      }))
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn()
        }))
      }))
    })),
    delete: jest.fn(() => ({
      eq: jest.fn()
    }))
  }))
}

jest.mock('../supabase', () => ({
  supabase: mockSupabaseClient
}))

// Mock localStorage utilities
jest.mock('@/utils/localStorage', () => ({
  getUserPreferences: jest.fn(() => DEFAULT_USER_PREFERENCES),
  saveUserPreferences: jest.fn(() => true),
  getMeditationData: jest.fn(() => ({
    sessions: [],
    statistics: {
      totalSessions: 0,
      totalTime: 0,
      currentStreak: 0,
      bestStreak: 0,
      averageSessionTime: 0,
      favoriteScript: '',
      completionRate: 0,
      lastSessionDate: null,
    }
  })),
  saveMeditationData: jest.fn(() => true),
}))

import { UserProfileService } from '../userProfile'
import { DEFAULT_USER_PREFERENCES } from '@/utils/localStorage'
import type { UserProfile, UserPreferences, UserStatistics, MeditationSession } from '@/types'

const DEFAULT_USER_PREFERENCES = {
  audioEnabled: true,
  volume: 0.8,
  theme: 'light' as const,
  language: 'ja' as const,
  notifications: {
    dailyReminder: false,
    reminderTime: '09:00',
    weeklyReport: false,
    achievements: true,
  },
  privacy: {
    analyticsEnabled: true,
    shareProgress: false,
  },
}

describe('UserProfileService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getProfile', () => {
    it('should return user profile from database', async () => {
      const mockProfile: UserProfile = {
        id: 'user-1',
        email: 'test@example.com',
        displayName: 'Test User',
        preferences: DEFAULT_USER_PREFERENCES,
        statistics: {
          totalSessions: 10,
          totalTime: 600,
          currentStreak: 3,
          bestStreak: 5,
          averageSessionTime: 60,
          favoriteScript: 'basic-breathing',
          completionRate: 0.8,
          lastSessionDate: new Date('2024-01-01'),
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      const mockSelect = jest.fn().mockResolvedValue({ data: mockProfile, error: null })
      mockSupabaseClient.from().select().eq().single = mockSelect

      const result = await UserProfileService.getProfile('user-1')

      expect(result).toEqual(mockProfile)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_profiles')
    })

    it('should return null when profile not found', async () => {
      const mockSelect = jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
      mockSupabaseClient.from().select().eq().single = mockSelect

      const result = await UserProfileService.getProfile('user-1')

      expect(result).toBeNull()
    })

    it('should throw error when database error occurs', async () => {
      const mockSelect = jest.fn().mockResolvedValue({ 
        data: null, 
        error: { code: 'OTHER_ERROR', message: 'Database error' } 
      })
      mockSupabaseClient.from().select().eq().single = mockSelect

      await expect(UserProfileService.getProfile('user-1')).rejects.toThrow('Database error')
    })
  })

  describe('createProfile', () => {
    it('should create new user profile', async () => {
      const profileData = {
        email: 'new@example.com',
        displayName: 'New User',
      }

      const mockProfile: UserProfile = {
        id: 'user-2',
        ...profileData,
        preferences: DEFAULT_USER_PREFERENCES,
        statistics: {
          totalSessions: 0,
          totalTime: 0,
          currentStreak: 0,
          bestStreak: 0,
          averageSessionTime: 0,
          favoriteScript: '',
          completionRate: 0,
          lastSessionDate: null,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockInsert = jest.fn().mockResolvedValue({ data: mockProfile, error: null })
      mockSupabaseClient.from().insert().select().single = mockInsert

      const result = await UserProfileService.createProfile('user-2', profileData)

      expect(result).toEqual(mockProfile)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_profiles')
    })
  })

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updates = {
        displayName: 'Updated Name',
        preferences: {
          ...DEFAULT_USER_PREFERENCES,
          volume: 0.5,
        },
      }

      const mockUpdatedProfile: UserProfile = {
        id: 'user-1',
        email: 'test@example.com',
        ...updates,
        statistics: {
          totalSessions: 10,
          totalTime: 600,
          currentStreak: 3,
          bestStreak: 5,
          averageSessionTime: 60,
          favoriteScript: 'basic-breathing',
          completionRate: 0.8,
          lastSessionDate: new Date('2024-01-01'),
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      }

      const mockUpdate = jest.fn().mockResolvedValue({ data: mockUpdatedProfile, error: null })
      mockSupabaseClient.from().update().eq().select().single = mockUpdate

      const result = await UserProfileService.updateProfile('user-1', updates)

      expect(result).toEqual(mockUpdatedProfile)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_profiles')
    })
  })

  describe('updateStatistics', () => {
    it('should update user statistics', async () => {
      const newStatistics: UserStatistics = {
        totalSessions: 11,
        totalTime: 660,
        currentStreak: 4,
        bestStreak: 5,
        averageSessionTime: 60,
        favoriteScript: 'basic-breathing',
        completionRate: 0.85,
        lastSessionDate: new Date(),
      }

      const mockUpdatedProfile: UserProfile = {
        id: 'user-1',
        email: 'test@example.com',
        displayName: 'Test User',
        preferences: DEFAULT_USER_PREFERENCES,
        statistics: newStatistics,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      }

      const mockUpdate = jest.fn().mockResolvedValue({ data: mockUpdatedProfile, error: null })
      mockSupabaseClient.from().update().eq().select().single = mockUpdate

      const result = await UserProfileService.updateStatistics('user-1', newStatistics)

      expect(result).toEqual(mockUpdatedProfile)
    })
  })

  describe('deleteProfile', () => {
    it('should delete user profile', async () => {
      const mockDelete = jest.fn().mockResolvedValue({ error: null })
      mockSupabaseClient.from().delete().eq = mockDelete

      await UserProfileService.deleteProfile('user-1')

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_profiles')
      expect(mockDelete).toHaveBeenCalled()
    })

    it('should throw error when deletion fails', async () => {
      const mockDelete = jest.fn().mockResolvedValue({ 
        error: { message: 'Deletion failed' } 
      })
      mockSupabaseClient.from().delete().eq = mockDelete

      await expect(UserProfileService.deleteProfile('user-1')).rejects.toThrow('Deletion failed')
    })
  })
});
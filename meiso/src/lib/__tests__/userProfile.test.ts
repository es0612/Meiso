// Set up environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

import { UserProfileService } from '../userProfile'
import { DEFAULT_USER_PREFERENCES } from '@/utils/localStorage'
import type { UserProfile, UserPreferences, UserStatistics, MeditationSession } from '@/types'

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
    preferences: DEFAULT_USER_PREFERENCES,
    lastSyncAt: undefined
  })),
  saveMeditationData: jest.fn(() => true),
  calculateStatistics: jest.fn(() => ({
    totalSessions: 0,
    totalDuration: 0,
    currentStreak: 0,
    longestStreak: 0,
    favoriteScripts: []
  })),
  DEFAULT_USER_PREFERENCES: {
    defaultScript: 'basic-breathing',
    audioEnabled: true,
    volume: 0.7,
    notifications: false,
    theme: 'auto' as const
  }
}))

const mockSupabase = mockSupabaseClient

describe('UserProfileService', () => {
  const mockUserId = 'test-user-id'
  const mockProfile: UserProfile = {
    id: mockUserId,
    email: 'test@example.com',
    displayName: 'Test User',
    preferences: DEFAULT_USER_PREFERENCES,
    statistics: {
      totalSessions: 5,
      totalDuration: 300,
      currentStreak: 2,
      longestStreak: 3,
      favoriteScripts: ['basic-breathing']
    },
    createdAt: new Date('2024-01-01'),
    lastActiveAt: new Date('2024-01-02')
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getUserProfile', () => {
    it('should return user profile when found', async () => {
      const mockRow = {
        id: mockUserId,
        display_name: 'Test User',
        preferences: DEFAULT_USER_PREFERENCES,
        statistics: mockProfile.statistics,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z'
      }

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockRow,
        error: null
      })

      const result = await UserProfileService.getUserProfile(mockUserId)

      expect(result).toEqual({
        id: mockUserId,
        email: '',
        displayName: 'Test User',
        preferences: DEFAULT_USER_PREFERENCES,
        statistics: mockProfile.statistics,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        lastActiveAt: new Date('2024-01-02T00:00:00Z')
      })
    })

    it('should return null when profile not found', async () => {
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' }
      })

      const result = await UserProfileService.getUserProfile(mockUserId)

      expect(result).toBeNull()
    })

    it('should throw error for other database errors', async () => {
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { code: 'OTHER_ERROR', message: 'Database error' }
      })

      await expect(UserProfileService.getUserProfile(mockUserId))
        .rejects.toThrow('Failed to fetch user profile')
    })
  })

  describe('createUserProfile', () => {
    it('should create user profile with default values', async () => {
      const mockRow = {
        id: mockUserId,
        display_name: 'Test User',
        preferences: DEFAULT_USER_PREFERENCES,
        statistics: {
          totalSessions: 0,
          totalDuration: 0,
          currentStreak: 0,
          longestStreak: 0,
          favoriteScripts: []
        },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockRow,
        error: null
      })

      const result = await UserProfileService.createUserProfile(mockUserId, 'Test User')

      expect(mockSupabase.from).toHaveBeenCalledWith('user_profiles')
      expect(result.displayName).toBe('Test User')
      expect(result.preferences).toEqual(DEFAULT_USER_PREFERENCES)
    })

    it('should throw error when creation fails', async () => {
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: null,
        error: { message: 'Creation failed' }
      })

      await expect(UserProfileService.createUserProfile(mockUserId, 'Test User'))
        .rejects.toThrow('Failed to create user profile')
    })
  })

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      const updates = { displayName: 'Updated Name' }
      const mockRow = {
        id: mockUserId,
        display_name: 'Updated Name',
        preferences: DEFAULT_USER_PREFERENCES,
        statistics: mockProfile.statistics,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z'
      }

      mockSupabase.from().update().eq().select().single.mockResolvedValue({
        data: mockRow,
        error: null
      })

      const result = await UserProfileService.updateUserProfile(mockUserId, updates)

      expect(result.displayName).toBe('Updated Name')
    })

    it('should throw error when update fails', async () => {
      mockSupabase.from().update().eq().select().single.mockResolvedValue({
        data: null,
        error: { message: 'Update failed' }
      })

      await expect(UserProfileService.updateUserProfile(mockUserId, { displayName: 'Test' }))
        .rejects.toThrow('Failed to update user profile')
    })
  })

  describe('updateUserPreferences', () => {
    it('should update preferences in both database and local storage', async () => {
      const newPreferences: UserPreferences = {
        ...DEFAULT_USER_PREFERENCES,
        volume: 0.8,
        audioEnabled: false
      }

      const mockRow = {
        id: mockUserId,
        display_name: 'Test User',
        preferences: newPreferences,
        statistics: mockProfile.statistics,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z'
      }

      mockSupabase.from().update().eq().select().single.mockResolvedValue({
        data: mockRow,
        error: null
      })

      await UserProfileService.updateUserPreferences(mockUserId, newPreferences)

      expect(mockSupabase.from).toHaveBeenCalledWith('user_profiles')
    })
  })

  describe('getOrCreateUserProfile', () => {
    it('should return existing profile if found', async () => {
      const mockRow = {
        id: mockUserId,
        display_name: 'Test User',
        preferences: DEFAULT_USER_PREFERENCES,
        statistics: mockProfile.statistics,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z'
      }

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockRow,
        error: null
      })

      const result = await UserProfileService.getOrCreateUserProfile(mockUserId, 'Test User')

      expect(result.displayName).toBe('Test User')
    })

    it('should create new profile if not found', async () => {
      // First call returns null (profile not found)
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' }
      })

      // Second call returns created profile
      const mockRow = {
        id: mockUserId,
        display_name: 'New User',
        preferences: DEFAULT_USER_PREFERENCES,
        statistics: {
          totalSessions: 0,
          totalDuration: 0,
          currentStreak: 0,
          longestStreak: 0,
          favoriteScripts: []
        },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockRow,
        error: null
      })

      const result = await UserProfileService.getOrCreateUserProfile(mockUserId, 'New User')

      expect(result.displayName).toBe('New User')
    })
  })

  describe('deleteUserProfile', () => {
    it('should delete user profile and sessions', async () => {
      mockSupabase.from().delete().eq.mockResolvedValue({
        data: null,
        error: null
      })

      await UserProfileService.deleteUserProfile(mockUserId)

      expect(mockSupabase.from).toHaveBeenCalledWith('meditation_sessions')
      expect(mockSupabase.from).toHaveBeenCalledWith('user_profiles')
    })

    it('should throw error when deletion fails', async () => {
      mockSupabase.from().delete().eq.mockResolvedValue({
        data: null,
        error: { message: 'Deletion failed' }
      })

      await expect(UserProfileService.deleteUserProfile(mockUserId))
        .rejects.toThrow('Failed to delete user profile')
    })
  })
})
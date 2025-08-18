import { renderHook, act, waitFor } from '@testing-library/react'
import { useUserProfile } from '../useUserProfile'
import { UserProfileService } from '@/lib/userProfile'
import { useAuthContext } from '@/contexts/AuthContext'
import { DEFAULT_USER_PREFERENCES } from '@/utils/localStorage'
import type { User } from '@supabase/supabase-js'

// Set up environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

// Mock dependencies
jest.mock('@/lib/userProfile')
jest.mock('@/contexts/AuthContext')
jest.mock('@/utils/localStorage', () => ({
  getUserPreferences: jest.fn(() => DEFAULT_USER_PREFERENCES),
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

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn(),
      onAuthStateChange: jest.fn()
    }
  }
}))

const mockUserProfileService = UserProfileService as jest.Mocked<typeof UserProfileService>
const mockUseAuthContext = useAuthContext as jest.MockedFunction<typeof useAuthContext>

describe('useUserProfile', () => {
  const mockUser: User = {
    id: 'test-user-id',
    email: 'test@example.com',
    is_anonymous: false,
    user_metadata: { display_name: 'Test User' },
    app_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00Z'
  }

  const mockProfile = {
    id: 'test-user-id',
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

  it('should load profile for authenticated user', async () => {
    mockUseAuthContext.mockReturnValue({
      user: mockUser,
      loading: false,
      isAnonymous: false,
      session: null,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signInAnonymously: jest.fn(),
      signOut: jest.fn(),
      convertAnonymousUser: jest.fn()
    })

    mockUserProfileService.getOrCreateUserProfile.mockResolvedValue(mockProfile)

    const { result } = renderHook(() => useUserProfile())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.profile).toEqual(mockProfile)
    expect(mockUserProfileService.getOrCreateUserProfile).toHaveBeenCalledWith(
      'test-user-id',
      'Test User'
    )
  })

  it('should create local profile for anonymous user', async () => {
    const anonymousUser: User = {
      ...mockUser,
      is_anonymous: true
    }

    mockUseAuthContext.mockReturnValue({
      user: anonymousUser,
      loading: false,
      isAnonymous: true,
      session: null,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signInAnonymously: jest.fn(),
      signOut: jest.fn(),
      convertAnonymousUser: jest.fn()
    })

    const { result } = renderHook(() => useUserProfile())

    await waitFor(() => {
      expect(result.current.profile).toBeTruthy()
    })

    expect(result.current.profile?.id).toBe('anonymous')
    expect(result.current.profile?.preferences).toEqual(DEFAULT_USER_PREFERENCES)
    expect(mockUserProfileService.getOrCreateUserProfile).not.toHaveBeenCalled()
  })

  it('should update profile for authenticated user', async () => {
    mockUseAuthContext.mockReturnValue({
      user: mockUser,
      loading: false,
      isAnonymous: false,
      session: null,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signInAnonymously: jest.fn(),
      signOut: jest.fn(),
      convertAnonymousUser: jest.fn()
    })

    const updatedProfile = { ...mockProfile, displayName: 'Updated Name' }
    mockUserProfileService.getOrCreateUserProfile.mockResolvedValue(mockProfile)
    mockUserProfileService.updateUserProfile.mockResolvedValue(updatedProfile)

    const { result } = renderHook(() => useUserProfile())

    await waitFor(() => {
      expect(result.current.profile).toEqual(mockProfile)
    })

    await act(async () => {
      await result.current.updateProfile({ displayName: 'Updated Name' })
    })

    expect(result.current.profile?.displayName).toBe('Updated Name')
    expect(mockUserProfileService.updateUserProfile).toHaveBeenCalledWith(
      'test-user-id',
      { displayName: 'Updated Name' }
    )
  })

  it('should update preferences for authenticated user', async () => {
    mockUseAuthContext.mockReturnValue({
      user: mockUser,
      loading: false,
      isAnonymous: false,
      session: null,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signInAnonymously: jest.fn(),
      signOut: jest.fn(),
      convertAnonymousUser: jest.fn()
    })

    mockUserProfileService.getOrCreateUserProfile.mockResolvedValue(mockProfile)
    mockUserProfileService.updateUserPreferences.mockResolvedValue()

    const { result } = renderHook(() => useUserProfile())

    await waitFor(() => {
      expect(result.current.profile).toEqual(mockProfile)
    })

    const newPreferences = { ...DEFAULT_USER_PREFERENCES, volume: 0.8 }

    await act(async () => {
      await result.current.updatePreferences(newPreferences)
    })

    expect(result.current.profile?.preferences.volume).toBe(0.8)
    expect(mockUserProfileService.updateUserPreferences).toHaveBeenCalledWith(
      'test-user-id',
      newPreferences
    )
  })

  it('should update preferences locally for anonymous user', async () => {
    const anonymousUser: User = {
      ...mockUser,
      is_anonymous: true
    }

    mockUseAuthContext.mockReturnValue({
      user: anonymousUser,
      loading: false,
      isAnonymous: true,
      session: null,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signInAnonymously: jest.fn(),
      signOut: jest.fn(),
      convertAnonymousUser: jest.fn()
    })

    const { result } = renderHook(() => useUserProfile())

    await waitFor(() => {
      expect(result.current.profile).toBeTruthy()
    })

    const newPreferences = { ...DEFAULT_USER_PREFERENCES, volume: 0.8 }

    await act(async () => {
      await result.current.updatePreferences(newPreferences)
    })

    expect(result.current.profile?.preferences.volume).toBe(0.8)
    expect(mockUserProfileService.updateUserPreferences).not.toHaveBeenCalled()
  })

  it('should sync local data to cloud', async () => {
    mockUseAuthContext.mockReturnValue({
      user: mockUser,
      loading: false,
      isAnonymous: false,
      session: null,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signInAnonymously: jest.fn(),
      signOut: jest.fn(),
      convertAnonymousUser: jest.fn()
    })

    mockUserProfileService.getOrCreateUserProfile.mockResolvedValue(mockProfile)
    mockUserProfileService.syncLocalDataToCloud.mockResolvedValue()

    const { result } = renderHook(() => useUserProfile())

    await waitFor(() => {
      expect(result.current.profile).toEqual(mockProfile)
    })

    await act(async () => {
      await result.current.syncLocalToCloud()
    })

    expect(mockUserProfileService.syncLocalDataToCloud).toHaveBeenCalledWith('test-user-id')
  })

  it('should handle errors gracefully', async () => {
    mockUseAuthContext.mockReturnValue({
      user: mockUser,
      loading: false,
      isAnonymous: false,
      session: null,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signInAnonymously: jest.fn(),
      signOut: jest.fn(),
      convertAnonymousUser: jest.fn()
    })

    mockUserProfileService.getOrCreateUserProfile.mockRejectedValue(
      new Error('Database error')
    )

    const { result } = renderHook(() => useUserProfile())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Database error')
    expect(result.current.profile).toBeNull()
  })

  it('should throw error when updating profile for anonymous user', async () => {
    const anonymousUser: User = {
      ...mockUser,
      is_anonymous: true
    }

    mockUseAuthContext.mockReturnValue({
      user: anonymousUser,
      loading: false,
      isAnonymous: true,
      session: null,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signInAnonymously: jest.fn(),
      signOut: jest.fn(),
      convertAnonymousUser: jest.fn()
    })

    const { result } = renderHook(() => useUserProfile())

    await waitFor(() => {
      expect(result.current.profile).toBeTruthy()
    })

    await expect(
      result.current.updateProfile({ displayName: 'Test' })
    ).rejects.toThrow('Cannot update profile for anonymous user')
  })
})
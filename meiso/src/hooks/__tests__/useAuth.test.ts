import { renderHook, waitFor } from '@testing-library/react'
import { useAuth } from '../useAuth'
import { AuthService } from '@/lib/auth'
import type { User, Session } from '@supabase/supabase-js'

// Environment variables for Supabase
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

// Mock AuthService
jest.mock('@/lib/auth', () => ({
  AuthService: {
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(),
    signIn: jest.fn(),
    signUp: jest.fn(),
    signInAnonymously: jest.fn(),
    signOut: jest.fn(),
    convertAnonymousUser: jest.fn(),
  },
}))

const mockAuthService = AuthService as jest.Mocked<typeof AuthService>

describe('useAuth', () => {
  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    user_metadata: {},
    app_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00Z',
  }

  const mockSession: Session = {
    access_token: 'access-token',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Date.now() + 3600000,
    refresh_token: 'refresh-token',
    user: mockUser,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock subscription object
    const mockSubscription = {
      unsubscribe: jest.fn(),
    }
    
    mockAuthService.onAuthStateChange.mockReturnValue({
      data: { subscription: mockSubscription },
    })
  })

  describe('初期状態', () => {
    it('should initialize with loading state', () => {
      mockAuthService.getSession.mockResolvedValue(null)
      
      const { result } = renderHook(() => useAuth())
      
      expect(result.current.loading).toBe(true)
      expect(result.current.user).toBe(null)
      expect(result.current.session).toBe(null)
    })

    it('should load initial session', async () => {
      mockAuthService.getSession.mockResolvedValue(mockSession)
      
      const { result } = renderHook(() => useAuth())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
      
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.session).toEqual(mockSession)
    })
  })

  describe('認証状態の変更', () => {
    it('should handle auth state changes', async () => {
      mockAuthService.getSession.mockResolvedValue(null)
      
      let authChangeCallback: (event: string, session: Session | null) => void = () => {}
      mockAuthService.onAuthStateChange.mockImplementation((callback) => {
        authChangeCallback = callback
        return { data: { subscription: { unsubscribe: jest.fn() } } }
      })
      
      const { result } = renderHook(() => useAuth())
      
      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
      
      // Simulate sign in
      authChangeCallback('SIGNED_IN', mockSession)
      
      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
        expect(result.current.session).toEqual(mockSession)
      })
    })
  })

  describe('サインイン', () => {
    it('should handle successful sign in', async () => {
      mockAuthService.getSession.mockResolvedValue(null)
      mockAuthService.signIn.mockResolvedValue()
      
      const { result } = renderHook(() => useAuth())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
      
      await result.current.signIn('test@example.com', 'password')
      
      expect(mockAuthService.signIn).toHaveBeenCalledWith('test@example.com', 'password')
      expect(result.current.loading).toBe(false)
    })

    it('should handle sign in error', async () => {
      mockAuthService.getSession.mockResolvedValue(null)
      mockAuthService.signIn.mockRejectedValue(new Error('Sign in failed'))
      
      const { result } = renderHook(() => useAuth())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
      
      await expect(result.current.signIn('test@example.com', 'wrong-password')).rejects.toThrow('Sign in failed')
      expect(result.current.loading).toBe(false)
    })
  })

  describe('サインアップ', () => {
    it('should handle successful sign up', async () => {
      mockAuthService.getSession.mockResolvedValue(null)
      mockAuthService.signUp.mockResolvedValue()
      
      const { result } = renderHook(() => useAuth())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
      
      await result.current.signUp('test@example.com', 'password', 'Test User')
      
      expect(mockAuthService.signUp).toHaveBeenCalledWith('test@example.com', 'password', 'Test User')
      expect(result.current.loading).toBe(false)
    })
  })

  describe('匿名サインイン', () => {
    it('should handle anonymous sign in', async () => {
      mockAuthService.getSession.mockResolvedValue(null)
      mockAuthService.signInAnonymously.mockResolvedValue()
      
      const { result } = renderHook(() => useAuth())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
      
      await result.current.signInAnonymously()
      
      expect(mockAuthService.signInAnonymously).toHaveBeenCalled()
      expect(result.current.loading).toBe(false)
    })
  })

  describe('サインアウト', () => {
    it('should handle sign out', async () => {
      mockAuthService.getSession.mockResolvedValue(mockSession)
      mockAuthService.signOut.mockResolvedValue()
      
      const { result } = renderHook(() => useAuth())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
      
      await result.current.signOut()
      
      expect(mockAuthService.signOut).toHaveBeenCalled()
      expect(result.current.loading).toBe(false)
    })
  })

  describe('匿名ユーザー変換', () => {
    it('should handle anonymous user conversion', async () => {
      mockAuthService.getSession.mockResolvedValue(null)
      mockAuthService.convertAnonymousUser.mockResolvedValue()
      
      const { result } = renderHook(() => useAuth())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
      
      await result.current.convertAnonymousUser('test@example.com', 'password', 'Test User')
      
      expect(mockAuthService.convertAnonymousUser).toHaveBeenCalledWith('test@example.com', 'password', 'Test User')
      expect(result.current.loading).toBe(false)
    })
  })

  describe('クリーンアップ', () => {
    it('should unsubscribe on unmount', () => {
      const mockUnsubscribe = jest.fn()
      mockAuthService.getSession.mockResolvedValue(null)
      mockAuthService.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      })
      
      const { unmount } = renderHook(() => useAuth())
      
      unmount()
      
      expect(mockUnsubscribe).toHaveBeenCalled()
    })
  })
})
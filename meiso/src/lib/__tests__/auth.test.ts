import { AuthService } from '../auth'
import { supabase } from '../supabase'
import type { User, Session } from '@supabase/supabase-js'

// Environment variables for Supabase
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

// Mock window.location for resetPassword test
const mockLocation = { origin: 'http://localhost:3000' }
;(global as any).window = { location: mockLocation }

// Mock supabase
jest.mock('../supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signInAnonymously: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
    },
  },
}))

const mockSupabase = supabase as any

describe('AuthService', () => {
  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    user_metadata: { display_name: 'Test User' },
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
  })

  describe('signUp', () => {
    it('should sign up new user successfully', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      })

      const result = await AuthService.signUp('test@example.com', 'password', 'Test User')

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
        options: {
          data: {
            display_name: 'Test User',
          },
        },
      })
      expect(result.user).toEqual(mockUser)
    })

    it('should sign up without display name', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      })

      await AuthService.signUp('test@example.com', 'password')

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
        options: {
          data: {
            display_name: undefined,
          },
        },
      })
    })

    it('should throw error on sign up failure', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'Email already exists' },
      })

      await expect(
        AuthService.signUp('test@example.com', 'password', 'Test User')
      ).rejects.toThrow('Email already exists')
    })
  })

  describe('signIn', () => {
    it('should sign in user successfully', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      })

      const result = await AuthService.signIn('test@example.com', 'password')

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      })
      expect(result.user).toEqual(mockUser)
    })

    it('should throw error on invalid credentials', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' },
      })

      await expect(AuthService.signIn('test@example.com', 'wrongpassword')).rejects.toThrow(
        'Invalid credentials'
      )
    })
  })

  describe('signInAnonymously', () => {
    it('should sign in anonymously', async () => {
      const anonymousUser = { ...mockUser, id: 'anonymous-123' }
      mockSupabase.auth.signInAnonymously.mockResolvedValue({
        data: { user: anonymousUser, session: { ...mockSession, user: anonymousUser } },
        error: null,
      })

      const result = await AuthService.signInAnonymously()

      expect(mockSupabase.auth.signInAnonymously).toHaveBeenCalled()
      expect(result.user?.id).toBe('anonymous-123')
    })

    it('should throw error on anonymous sign in failure', async () => {
      mockSupabase.auth.signInAnonymously.mockResolvedValue({
        data: null,
        error: { message: 'Anonymous sign in disabled' },
      })

      await expect(AuthService.signInAnonymously()).rejects.toThrow('Anonymous sign in disabled')
    })
  })

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })

      await AuthService.signOut()

      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    })

    it('should throw error on sign out failure', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: { message: 'Sign out failed' },
      })

      await expect(AuthService.signOut()).rejects.toThrow('Sign out failed')
    })
  })

  describe('getSession', () => {
    it('should get current session', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })

      const result = await AuthService.getSession()

      expect(mockSupabase.auth.getSession).toHaveBeenCalled()
      expect(result).toEqual(mockSession)
    })

    it('should return null when no session', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      const result = await AuthService.getSession()

      expect(result).toBeNull()
    })

    it('should throw error on session retrieval failure', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: null,
        error: { message: 'Session retrieval failed' },
      })

      await expect(AuthService.getSession()).rejects.toThrow('Session retrieval failed')
    })
  })

  describe('getUser', () => {
    it('should get current user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const result = await AuthService.getUser()

      expect(mockSupabase.auth.getUser).toHaveBeenCalled()
      expect(result).toEqual(mockUser)
    })

    it('should throw error on user retrieval failure', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: null,
        error: { message: 'User retrieval failed' },
      })

      await expect(AuthService.getUser()).rejects.toThrow('User retrieval failed')
    })
  })

  describe('onAuthStateChange', () => {
    it('should set up auth state change listener', () => {
      const mockCallback = jest.fn()
      const mockSubscription = { unsubscribe: jest.fn() }
      
      mockSupabase.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: mockSubscription },
      })

      const result = AuthService.onAuthStateChange(mockCallback)

      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalledWith(mockCallback)
      expect(result.data.subscription).toEqual(mockSubscription)
    })
  })

  describe('resetPassword', () => {
    it('should send password reset email', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null })

      await AuthService.resetPassword('test@example.com')

      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        { redirectTo: 'http://localhost/auth/reset-password' }
      )
    })

    it('should throw error on password reset failure', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        error: { message: 'Password reset failed' },
      })

      await expect(AuthService.resetPassword('test@example.com')).rejects.toThrow(
        'Password reset failed'
      )
    })
  })

  describe('updatePassword', () => {
    it('should update user password', async () => {
      mockSupabase.auth.updateUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      await AuthService.updatePassword('newpassword')

      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'newpassword',
      })
    })

    it('should throw error on password update failure', async () => {
      mockSupabase.auth.updateUser.mockResolvedValue({
        data: null,
        error: { message: 'Password update failed' },
      })

      await expect(AuthService.updatePassword('newpassword')).rejects.toThrow(
        'Password update failed'
      )
    })
  })

  describe('convertAnonymousUser', () => {
    it('should convert anonymous user to permanent account', async () => {
      mockSupabase.auth.updateUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      await AuthService.convertAnonymousUser('test@example.com', 'password', 'Test User')

      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
        data: {
          display_name: 'Test User',
        },
      })
    })

    it('should convert without display name', async () => {
      mockSupabase.auth.updateUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      await AuthService.convertAnonymousUser('test@example.com', 'password')

      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
        data: {
          display_name: undefined,
        },
      })
    })

    it('should throw error on conversion failure', async () => {
      mockSupabase.auth.updateUser.mockResolvedValue({
        data: null,
        error: { message: 'User conversion failed' },
      })

      await expect(
        AuthService.convertAnonymousUser('test@example.com', 'password', 'Test User')
      ).rejects.toThrow('User conversion failed')
    })
  })
})
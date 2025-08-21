import { DatabaseService } from '../database'
import { supabase } from '../supabase'
import type { MeditationSession, UserProfile } from '@/types'

// Environment variables for Supabase
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

// Mock supabase
jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

const mockSupabase = supabase as any

describe('DatabaseService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('User Profile Operations', () => {
    const mockUserProfile: UserProfile = {
      id: 'user-123',
      email: '',
      displayName: 'Test User',
      preferences: {
        defaultScript: 'basic-breathing',
        audioEnabled: true,
        volume: 0.8,
        notifications: false,
        theme: 'auto',
      },
      statistics: {
        totalSessions: 0,
        totalDuration: 0,
        currentStreak: 0,
        longestStreak: 0,
        favoriteScripts: [],
      },
      createdAt: new Date('2024-01-01T00:00:00Z'),
      lastActiveAt: new Date('2024-01-01T00:00:00Z'),
    }

    describe('getUserProfile', () => {
      it('should return user profile when found', async () => {
        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'user-123',
              display_name: 'Test User',
              email: '',
              preferences: {
                default_script: 'basic-breathing',
                audio_enabled: true,
                volume: 0.8,
                notifications: false,
                theme: 'auto',
              },
              statistics: {
                total_sessions: 0,
                total_duration: 0,
                current_streak: 0,
                longest_streak: 0,
                favorite_scripts: [],
              },
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
            },
            error: null,
          }),
        }
        mockSupabase.from.mockReturnValue(mockQuery)

        const result = await DatabaseService.getUserProfile('user-123')

        expect(mockSupabase.from).toHaveBeenCalledWith('user_profiles')
        expect(mockQuery.select).toHaveBeenCalledWith('*')
        expect(mockQuery.eq).toHaveBeenCalledWith('id', 'user-123')
        expect(result).toBeDefined()
        expect(result?.id).toBe('user-123')
        expect(result?.displayName).toBe('Test User')
      })

      it('should return null when user not found', async () => {
        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116', message: 'No rows returned' },
          }),
        }
        mockSupabase.from.mockReturnValue(mockQuery)

        const result = await DatabaseService.getUserProfile('user-404')

        expect(result).toBeNull()
      })

      it('should throw error on database failure', async () => {
        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database connection failed' },
          }),
        }
        mockSupabase.from.mockReturnValue(mockQuery)

        await expect(DatabaseService.getUserProfile('user-123')).rejects.toThrow(
          'Database connection failed'
        )
      })
    })

    describe('createUserProfile', () => {
      it('should create new user profile', async () => {
        const profileInsert = {
          id: 'user-123',
          display_name: 'Test User',
          email: '',
          preferences: {
            default_script: 'basic-breathing',
            audio_enabled: true,
            volume: 0.8,
            notifications: false,
            theme: 'auto',
          },
          statistics: {
            total_sessions: 0,
            total_duration: 0,
            current_streak: 0,
            longest_streak: 0,
            favorite_scripts: [],
          },
        }

        const mockQuery = {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              ...profileInsert,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
            },
            error: null,
          }),
        }
        mockSupabase.from.mockReturnValue(mockQuery)

        const result = await DatabaseService.createUserProfile(profileInsert)

        expect(mockSupabase.from).toHaveBeenCalledWith('user_profiles')
        expect(mockQuery.insert).toHaveBeenCalledWith(profileInsert)
        expect(result).toBeDefined()
        expect(result.id).toBe('user-123')
        expect(result.displayName).toBe('Test User')
      })

      it('should throw error on creation failure', async () => {
        const mockQuery = {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Duplicate key violation' },
          }),
        }
        mockSupabase.from.mockReturnValue(mockQuery)

        await expect(
          DatabaseService.createUserProfile({
            id: 'user-123',
            display_name: 'Test User',
            email: '',
          })
        ).rejects.toThrow('Duplicate key violation')
      })
    })
  })

  describe('Meditation Session Operations', () => {
    const mockSession: MeditationSession = {
      id: 'session-123',
      scriptId: 'basic-breathing',
      startTime: new Date('2024-01-01T12:00:00Z'),
      endTime: new Date('2024-01-01T12:01:00Z'),
      duration: 60000,
      completed: true,
      userId: 'user-123',
    }

    describe('createMeditationSession', () => {
      it('should create new meditation session', async () => {
        const sessionInsert = {
          script_id: 'basic-breathing',
          user_id: 'user-123',
          start_time: '2024-01-01T12:00:00Z',
          duration: 60000,
          completed: true,
        }

        const mockQuery = {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'session-123',
              script_id: 'basic-breathing',
              user_id: 'user-123',
              start_time: '2024-01-01T12:00:00Z',
              end_time: '2024-01-01T12:01:00Z',
              duration: 60000,
              completed: true,
            },
            error: null,
          }),
        }
        mockSupabase.from.mockReturnValue(mockQuery)

        const result = await DatabaseService.createMeditationSession(sessionInsert)

        expect(mockSupabase.from).toHaveBeenCalledWith('meditation_sessions')
        expect(mockQuery.insert).toHaveBeenCalledWith(sessionInsert)
        expect(result.id).toBe('session-123')
        expect(result.scriptId).toBe('basic-breathing')
        expect(result.completed).toBe(true)
      })
    })

    describe('getMeditationSessions', () => {
      it('should get sessions for authenticated user', async () => {
        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          range: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            data: [
              {
                id: 'session-123',
                script_id: 'basic-breathing',
                user_id: 'user-123',
                start_time: '2024-01-01T12:00:00Z',
                end_time: '2024-01-01T12:01:00Z',
                duration: 60000,
                completed: true,
              },
            ],
            error: null,
          }),
        }
        mockSupabase.from.mockReturnValue(mockQuery)

        const result = await DatabaseService.getMeditationSessions('user-123', 10, 0)

        expect(mockSupabase.from).toHaveBeenCalledWith('meditation_sessions')
        expect(mockQuery.eq).toHaveBeenCalledWith('user_id', 'user-123')
        expect(result).toHaveLength(1)
        expect(result[0].scriptId).toBe('basic-breathing')
      })

      it('should get anonymous sessions when no userId provided', async () => {
        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          range: jest.fn().mockReturnThis(),
          is: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }
        mockSupabase.from.mockReturnValue(mockQuery)

        const result = await DatabaseService.getMeditationSessions()

        expect(mockQuery.is).toHaveBeenCalledWith('user_id', null)
        expect(result).toEqual([])
      })

      it('should throw error on query failure', async () => {
        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          range: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Query timeout' },
          }),
        }
        mockSupabase.from.mockReturnValue(mockQuery)

        await expect(DatabaseService.getMeditationSessions('user-123')).rejects.toThrow(
          'Query timeout'
        )
      })
    })

    describe('deleteMeditationSession', () => {
      it('should delete session successfully', async () => {
        const mockQuery = {
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            error: null,
          }),
        }
        mockSupabase.from.mockReturnValue(mockQuery)

        await DatabaseService.deleteMeditationSession('session-123')

        expect(mockSupabase.from).toHaveBeenCalledWith('meditation_sessions')
        expect(mockQuery.delete).toHaveBeenCalled()
        expect(mockQuery.eq).toHaveBeenCalledWith('id', 'session-123')
      })

      it('should throw error on deletion failure', async () => {
        const mockQuery = {
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            error: { message: 'Session not found' },
          }),
        }
        mockSupabase.from.mockReturnValue(mockQuery)

        await expect(DatabaseService.deleteMeditationSession('session-404')).rejects.toThrow(
          'Session not found'
        )
      })
    })
  })

  describe('Statistics Operations', () => {
    const mockSessionData = [
      {
        completed: true,
        duration: 60000,
        start_time: '2024-01-03T12:00:00Z',
      },
      {
        completed: true,
        duration: 60000,
        start_time: '2024-01-02T12:00:00Z',
      },
      {
        completed: false,
        duration: 30000,
        start_time: '2024-01-01T12:00:00Z',
      },
    ]

    describe('getUserStatistics', () => {
      it('should calculate user statistics correctly', async () => {
        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            data: mockSessionData,
            error: null,
          }),
        }
        mockSupabase.from.mockReturnValue(mockQuery)

        const result = await DatabaseService.getUserStatistics('user-123')

        expect(mockSupabase.from).toHaveBeenCalledWith('meditation_sessions')
        expect(mockQuery.select).toHaveBeenCalledWith('completed, duration, start_time')
        expect(mockQuery.eq).toHaveBeenCalledWith('user_id', 'user-123')

        expect(result.totalSessions).toBe(3)
        expect(result.completedSessions).toBe(2)
        expect(result.totalDuration).toBe(150000) // 60000 + 60000 + 30000
      })

      it('should handle anonymous user statistics', async () => {
        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          is: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }
        mockSupabase.from.mockReturnValue(mockQuery)

        const result = await DatabaseService.getUserStatistics()

        expect(mockQuery.is).toHaveBeenCalledWith('user_id', null)
        expect(result.totalSessions).toBe(0)
        expect(result.completedSessions).toBe(0)
        expect(result.totalDuration).toBe(0)
      })

      it('should throw error on statistics query failure', async () => {
        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Statistics calculation failed' },
          }),
        }
        mockSupabase.from.mockReturnValue(mockQuery)

        await expect(DatabaseService.getUserStatistics('user-123')).rejects.toThrow(
          'Statistics calculation failed'
        )
      })
    })
  })
})
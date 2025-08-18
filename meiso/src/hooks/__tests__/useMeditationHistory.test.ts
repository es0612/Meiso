import { renderHook, act, waitFor } from '@testing-library/react';
import { useMeditationHistory } from '../useMeditationHistory';
import { DatabaseService } from '@/lib/database';
import * as localStorage from '@/utils/localStorage';
import { useAuth } from '../useAuth';

// Mock dependencies
jest.mock('@/lib/database');
jest.mock('@/utils/localStorage');
jest.mock('../useAuth');
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn()
    }
  }
}));

const mockDatabaseService = DatabaseService as jest.Mocked<typeof DatabaseService>;
const mockLocalStorage = localStorage as jest.Mocked<typeof localStorage>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('useMeditationHistory', () => {
  const mockSession = {
    id: 'session-1',
    scriptId: 'basic-breathing',
    startTime: new Date('2024-01-01T10:00:00Z'),
    endTime: new Date('2024-01-01T10:01:00Z'),
    completed: true,
    duration: 60,
    deviceInfo: {
      userAgent: 'test-agent',
      screenSize: '1920x1080'
    }
  };

  const mockStats = {
    totalSessions: 5,
    completedSessions: 4,
    totalDuration: 300,
    currentStreak: 3,
    longestStreak: 5,
    completionRate: 0.8
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when user is logged in', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user-1', email: 'test@example.com' },
        loading: false,
        signIn: jest.fn(),
        signOut: jest.fn(),
        signUp: jest.fn()
      });
    });

    it('should fetch sessions from database', async () => {
      mockDatabaseService.getMeditationSessions.mockResolvedValue([mockSession]);
      mockDatabaseService.getUserStatistics.mockResolvedValue(mockStats);

      const { result } = renderHook(() => useMeditationHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockDatabaseService.getMeditationSessions).toHaveBeenCalledWith('user-1', 50, 0);
      expect(result.current.sessions).toEqual([mockSession]);
    });

    it('should fetch statistics from database', async () => {
      mockDatabaseService.getMeditationSessions.mockResolvedValue([]);
      mockDatabaseService.getUserStatistics.mockResolvedValue(mockStats);

      const { result } = renderHook(() => useMeditationHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockDatabaseService.getUserStatistics).toHaveBeenCalledWith('user-1');
      expect(result.current.stats.totalSessions).toBe(5);
      expect(result.current.stats.currentStreak).toBe(3);
    });

    it('should save session to database', async () => {
      mockDatabaseService.getMeditationSessions.mockResolvedValue([]);
      mockDatabaseService.getUserStatistics.mockResolvedValue(mockStats);
      mockDatabaseService.createMeditationSession.mockResolvedValue(mockSession);

      const { result } = renderHook(() => useMeditationHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.saveSession(mockSession);
      });

      expect(mockDatabaseService.createMeditationSession).toHaveBeenCalledWith({
        user_id: 'user-1',
        script_id: mockSession.scriptId,
        start_time: mockSession.startTime.toISOString(),
        end_time: mockSession.endTime?.toISOString(),
        completed: mockSession.completed,
        duration: mockSession.duration,
        rating: mockSession.rating,
        notes: mockSession.notes,
        device_info: mockSession.deviceInfo
      });
    });

    it('should update session in database', async () => {
      mockDatabaseService.getMeditationSessions.mockResolvedValue([]);
      mockDatabaseService.getUserStatistics.mockResolvedValue(mockStats);
      mockDatabaseService.updateMeditationSession.mockResolvedValue(mockSession);

      const { result } = renderHook(() => useMeditationHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const updates = { rating: 5, notes: 'Great session!' };

      await act(async () => {
        await result.current.updateSession('session-1', updates);
      });

      expect(mockDatabaseService.updateMeditationSession).toHaveBeenCalledWith('session-1', {
        end_time: undefined,
        completed: undefined,
        duration: undefined,
        rating: 5,
        notes: 'Great session!'
      });
    });

    it('should delete session from database', async () => {
      mockDatabaseService.getMeditationSessions.mockResolvedValue([]);
      mockDatabaseService.getUserStatistics.mockResolvedValue(mockStats);
      mockDatabaseService.deleteMeditationSession.mockResolvedValue();

      const { result } = renderHook(() => useMeditationHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteSession('session-1');
      });

      expect(mockDatabaseService.deleteMeditationSession).toHaveBeenCalledWith('session-1');
    });
  });

  describe('when user is anonymous', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        signIn: jest.fn(),
        signOut: jest.fn(),
        signUp: jest.fn()
      });
    });

    it('should fetch sessions from localStorage', async () => {
      mockLocalStorage.getMeditationSessions.mockReturnValue([mockSession]);
      mockLocalStorage.calculateStatistics.mockReturnValue({
        totalSessions: 1,
        totalDuration: 60,
        currentStreak: 1,
        longestStreak: 1,
        favoriteScripts: ['basic-breathing']
      });
      mockLocalStorage.calculateStreak.mockReturnValue(1);

      const { result } = renderHook(() => useMeditationHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockLocalStorage.getMeditationSessions).toHaveBeenCalled();
      expect(result.current.sessions).toEqual([mockSession]);
    });

    it('should save session to localStorage', async () => {
      mockLocalStorage.getMeditationSessions.mockReturnValue([]);
      mockLocalStorage.calculateStatistics.mockReturnValue({
        totalSessions: 0,
        totalDuration: 0,
        currentStreak: 0,
        longestStreak: 0,
        favoriteScripts: []
      });
      mockLocalStorage.calculateStreak.mockReturnValue(0);
      mockLocalStorage.addMeditationSession.mockReturnValue(true);

      const { result } = renderHook(() => useMeditationHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.saveSession(mockSession);
      });

      expect(mockLocalStorage.addMeditationSession).toHaveBeenCalledWith(mockSession);
    });

    it('should update session in localStorage', async () => {
      mockLocalStorage.getMeditationSessions.mockReturnValue([]);
      mockLocalStorage.calculateStatistics.mockReturnValue({
        totalSessions: 0,
        totalDuration: 0,
        currentStreak: 0,
        longestStreak: 0,
        favoriteScripts: []
      });
      mockLocalStorage.calculateStreak.mockReturnValue(0);
      mockLocalStorage.updateMeditationSession.mockReturnValue(true);

      const { result } = renderHook(() => useMeditationHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const updates = { rating: 4 };

      await act(async () => {
        await result.current.updateSession('session-1', updates);
      });

      expect(mockLocalStorage.updateMeditationSession).toHaveBeenCalledWith('session-1', updates);
    });

    it('should delete session from localStorage', async () => {
      mockLocalStorage.getMeditationSessions.mockReturnValue([]);
      mockLocalStorage.calculateStatistics.mockReturnValue({
        totalSessions: 0,
        totalDuration: 0,
        currentStreak: 0,
        longestStreak: 0,
        favoriteScripts: []
      });
      mockLocalStorage.calculateStreak.mockReturnValue(0);
      mockLocalStorage.deleteMeditationSession.mockReturnValue(true);

      const { result } = renderHook(() => useMeditationHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteSession('session-1');
      });

      expect(mockLocalStorage.deleteMeditationSession).toHaveBeenCalledWith('session-1');
    });
  });

  describe('filtering', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        signIn: jest.fn(),
        signOut: jest.fn(),
        signUp: jest.fn()
      });
    });

    it('should filter sessions by date range', async () => {
      const sessions = [
        { ...mockSession, id: '1', startTime: new Date('2024-01-01') },
        { ...mockSession, id: '2', startTime: new Date('2024-01-15') },
        { ...mockSession, id: '3', startTime: new Date('2024-02-01') }
      ];

      mockLocalStorage.getMeditationSessionsByDateRange.mockReturnValue([sessions[0], sessions[1]]);
      mockLocalStorage.calculateStatistics.mockReturnValue({
        totalSessions: 0,
        totalDuration: 0,
        currentStreak: 0,
        longestStreak: 0,
        favoriteScripts: []
      });
      mockLocalStorage.calculateStreak.mockReturnValue(0);

      const { result } = renderHook(() => useMeditationHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      await act(async () => {
        await result.current.fetchSessions({
          dateRange: { start: startDate, end: endDate }
        });
      });

      expect(mockLocalStorage.getMeditationSessionsByDateRange).toHaveBeenCalledWith(startDate, endDate);
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user-1', email: 'test@example.com' },
        loading: false,
        signIn: jest.fn(),
        signOut: jest.fn(),
        signUp: jest.fn()
      });
    });

    it('should handle fetch sessions error', async () => {
      mockDatabaseService.getMeditationSessions.mockRejectedValue(new Error('Database error'));
      mockDatabaseService.getUserStatistics.mockResolvedValue(mockStats);

      const { result } = renderHook(() => useMeditationHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Database error');
      expect(result.current.sessions).toEqual([]);
    });

    it('should handle save session error', async () => {
      mockDatabaseService.getMeditationSessions.mockResolvedValue([]);
      mockDatabaseService.getUserStatistics.mockResolvedValue(mockStats);
      mockDatabaseService.createMeditationSession.mockRejectedValue(new Error('Save failed'));

      const { result } = renderHook(() => useMeditationHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.saveSession(mockSession);
        })
      ).rejects.toThrow('Save failed');

      // The error should be thrown, which is the main behavior we're testing
      expect(mockDatabaseService.createMeditationSession).toHaveBeenCalled();
    });
  });
});
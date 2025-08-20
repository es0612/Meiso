import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MeditationHistory } from '../MeditationHistory';
import { SessionDetailModal } from '../SessionDetailModal';
import { useMeditationHistory } from '@/hooks/useMeditationHistory';
import { MeditationSession } from '@/types';

// Mock the hook
jest.mock('@/hooks/useMeditationHistory');
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn()
    }
  }
}));
const mockUseMeditationHistory = useMeditationHistory as jest.MockedFunction<typeof useMeditationHistory>;

// Mock constants
jest.mock('@/constants/meditation', () => ({
  INITIAL_MEDITATION_SCRIPTS: [
    {
      id: 'basic-breathing',
      title: '基本の呼吸瞑想',
      description: 'シンプルな呼吸に集中する瞑想',
      category: 'breathing',
      duration: 60,
      instructions: [],
      tags: ['初心者向け'],
      difficulty: 'beginner',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
}));

describe('MeditationHistory Integration', () => {
  const mockSession: MeditationSession = {
    id: 'session-1',
    scriptId: 'basic-breathing',
    startTime: new Date('2024-01-01T10:00:00Z'),
    endTime: new Date('2024-01-01T10:01:00Z'),
    completed: true,
    duration: 60,
    rating: 4,
    notes: 'Great session!',
    deviceInfo: {
      userAgent: 'test-agent',
      screenSize: '1920x1080'
    }
  };

  const mockStats = {
    totalSessions: 1,
    totalDuration: 60,
    currentStreak: 1,
    longestStreak: 1,
    favoriteScripts: ['basic-breathing'],
    completionRate: 1.0
  };

  const mockUpdateSession = jest.fn();
  const mockDeleteSession = jest.fn();

  const defaultHookReturn = {
    sessions: [mockSession],
    stats: mockStats,
    loading: false,
    error: null,
    fetchSessions: jest.fn(),
    fetchStats: jest.fn(),
    saveSession: jest.fn(),
    updateSession: mockUpdateSession,
    deleteSession: mockDeleteSession,
    refetch: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMeditationHistory.mockReturnValue(defaultHookReturn);
  });

  it('should open session detail modal when session is clicked', async () => {
    const handleSessionClick = jest.fn();

    render(<MeditationHistory onSessionClick={handleSessionClick} />);

    // Click on the session (get the clickable session item)
    const sessionElements = screen.getAllByText('基本の呼吸瞑想');
    const sessionTitle = sessionElements.find(el => 
      el.tagName === 'H3' && el.classList.contains('font-medium')
    );
    const sessionElement = sessionTitle?.closest('.cursor-pointer');
    
    fireEvent.click(sessionElement!);

    // Check that the session click handler was called
    expect(handleSessionClick).toHaveBeenCalledWith(mockSession);
  });

  it('should update session rating and notes through modal', async () => {
    mockUpdateSession.mockResolvedValue(undefined);

    const TestComponent = () => {
      const [selectedSession, setSelectedSession] = React.useState<MeditationSession | null>(mockSession);
      const [isModalOpen, setIsModalOpen] = React.useState(true);

      const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedSession(null);
      };

      return (
        <SessionDetailModal
          session={selectedSession}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onUpdate={mockUpdateSession}
          onDelete={mockDeleteSession}
        />
      );
    };

    render(<TestComponent />);

    // Click edit button
    const editButton = screen.getByText('編集');
    fireEvent.click(editButton);

    // Update rating
    const fifthStar = screen.getAllByRole('button')[5]; // 5th star
    fireEvent.click(fifthStar);

    // Update notes
    const notesTextarea = screen.getByPlaceholderText('セッションについてのメモを入力...');
    fireEvent.change(notesTextarea, { target: { value: 'Updated notes!' } });

    // Save changes
    const saveButton = screen.getByText('保存');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateSession).toHaveBeenCalledWith('session-1', {
        rating: 5,
        notes: 'Updated notes!'
      });
    });
  });

  it('should delete session through modal', async () => {
    mockDeleteSession.mockResolvedValue(undefined);
    
    // Mock window.confirm
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => true);

    const TestComponent = () => {
      const [selectedSession, setSelectedSession] = React.useState<MeditationSession | null>(mockSession);
      const [isModalOpen, setIsModalOpen] = React.useState(true);

      const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedSession(null);
      };

      return (
        <SessionDetailModal
          session={selectedSession}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onUpdate={mockUpdateSession}
          onDelete={mockDeleteSession}
        />
      );
    };

    render(<TestComponent />);

    // Click delete button
    const deleteButton = screen.getByText('削除');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteSession).toHaveBeenCalledWith('session-1');
    });

    // Restore original confirm
    window.confirm = originalConfirm;
  });

  it('should filter sessions and update display', async () => {
    const sessions = [
      { ...mockSession, id: '1', scriptId: 'basic-breathing', completed: true },
      { ...mockSession, id: '2', scriptId: 'mindfulness', completed: false },
      { ...mockSession, id: '3', scriptId: 'basic-breathing', completed: true }
    ];

    mockUseMeditationHistory.mockReturnValue({
      ...defaultHookReturn,
      sessions
    });

    render(<MeditationHistory />);

    // Initially should show all sessions
    expect(screen.getByText('瞑想セッション履歴 (3件)')).toBeInTheDocument();

    // Filter by completion status
    const statusSelect = screen.getByDisplayValue('全ての状態');
    fireEvent.change(statusSelect, { target: { value: 'true' } });

    // Should show only completed sessions
    await waitFor(() => {
      expect(screen.getByText('瞑想セッション履歴 (2件)')).toBeInTheDocument();
    });

    // Filter by script
    const scriptSelect = screen.getByDisplayValue('全てのスクリプト');
    fireEvent.change(scriptSelect, { target: { value: 'basic-breathing' } });

    // Should show only basic-breathing sessions that are completed
    await waitFor(() => {
      expect(screen.getByText('瞑想セッション履歴 (2件)')).toBeInTheDocument();
    });
  });

  it('should handle date range filtering', async () => {
    const fetchSessions = jest.fn();
    mockUseMeditationHistory.mockReturnValue({
      ...defaultHookReturn,
      fetchSessions
    });

    render(<MeditationHistory />);

    // Click past 7 days filter
    const past7DaysButton = screen.getByText('過去7日');
    fireEvent.click(past7DaysButton);

    // The component should call fetchSessions with date range
    expect(fetchSessions).toHaveBeenCalledWith(
      expect.objectContaining({
        dateRange: expect.objectContaining({
          start: expect.any(Date),
          end: expect.any(Date)
        })
      })
    );

    // Verify the date range is approximately correct (within 1 day tolerance)
    const call = fetchSessions.mock.calls[0][0];
    const expectedStart = new Date();
    expectedStart.setDate(expectedStart.getDate() - 7);
    expectedStart.setHours(0, 0, 0, 0);

    const actualStart = call.dateRange.start;
    const actualEnd = call.dateRange.end;

    expect(Math.abs(actualStart.getTime() - expectedStart.getTime())).toBeLessThan(24 * 60 * 60 * 1000);
    expect(actualEnd.getHours()).toBe(23);
    expect(actualEnd.getMinutes()).toBe(59);
  });

  it('should clear all filters when clear button is clicked', () => {
    render(<MeditationHistory />);

    // Set multiple filters
    const past7DaysButton = screen.getByText('過去7日');
    fireEvent.click(past7DaysButton);

    const statusSelect = screen.getByDisplayValue('全ての状態');
    fireEvent.change(statusSelect, { target: { value: 'true' } });

    // Clear filters button should appear
    expect(screen.getByText('フィルタークリア')).toBeInTheDocument();

    // Click clear filters
    const clearButton = screen.getByText('フィルタークリア');
    fireEvent.click(clearButton);

    // Filters should be reset
    expect(screen.queryByText('フィルタークリア')).not.toBeInTheDocument();
    expect(statusSelect).toHaveValue('');
  });

  it('should handle empty filtered results', () => {
    const sessions = [
      { ...mockSession, scriptId: 'basic-breathing', completed: true }
    ];

    mockUseMeditationHistory.mockReturnValue({
      ...defaultHookReturn,
      sessions
    });

    render(<MeditationHistory />);

    // Filter by completion status that doesn't match
    const statusSelect = screen.getByDisplayValue('全ての状態');
    fireEvent.change(statusSelect, { target: { value: 'false' } });

    // Should show no results message
    expect(screen.getByText('フィルター条件に一致するセッションがありません。')).toBeInTheDocument();
    expect(screen.getByText('瞑想セッション履歴 (0件)')).toBeInTheDocument();
  });
});
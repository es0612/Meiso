import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MeditationHistory } from '../MeditationHistory';
import { useMeditationHistory } from '@/hooks/useMeditationHistory';
import { MEDITATION_SCRIPTS } from '@/constants/meditation';

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
  MEDITATION_SCRIPTS: [
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

describe('MeditationHistory', () => {
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
    totalDuration: 300,
    currentStreak: 3,
    longestStreak: 5,
    favoriteScripts: ['basic-breathing'],
    completionRate: 0.8
  };

  const defaultHookReturn = {
    sessions: [mockSession],
    stats: mockStats,
    loading: false,
    error: null,
    fetchSessions: jest.fn(),
    fetchStats: jest.fn(),
    saveSession: jest.fn(),
    updateSession: jest.fn(),
    deleteSession: jest.fn(),
    refetch: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMeditationHistory.mockReturnValue(defaultHookReturn);
  });

  it('should render statistics cards', () => {
    render(<MeditationHistory />);

    expect(screen.getByText('総セッション数')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    
    expect(screen.getByText('連続日数')).toBeInTheDocument();
    expect(screen.getByText('3日')).toBeInTheDocument();
    
    expect(screen.getByText('総時間')).toBeInTheDocument();
    expect(screen.getByText('5分')).toBeInTheDocument();
    
    expect(screen.getByText('完了率')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
  });

  it('should render session list', () => {
    render(<MeditationHistory />);

    expect(screen.getByText('瞑想セッション履歴 (1件)')).toBeInTheDocument();
    
    // Get the session title from the session list (not the select option)
    const sessionTitles = screen.getAllByText('基本の呼吸瞑想');
    const sessionTitle = sessionTitles.find(el => el.tagName === 'H3');
    expect(sessionTitle).toBeInTheDocument();
    
    expect(screen.getByText('完了')).toBeInTheDocument();
    expect(screen.getByText('1分')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    mockUseMeditationHistory.mockReturnValue({
      ...defaultHookReturn,
      loading: true
    });

    render(<MeditationHistory />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should show error state', () => {
    mockUseMeditationHistory.mockReturnValue({
      ...defaultHookReturn,
      error: 'Failed to load sessions'
    });

    render(<MeditationHistory />);

    expect(screen.getByText('Failed to load sessions')).toBeInTheDocument();
  });

  it('should show empty state when no sessions', () => {
    mockUseMeditationHistory.mockReturnValue({
      ...defaultHookReturn,
      sessions: []
    });

    render(<MeditationHistory />);

    expect(screen.getByText('まだ瞑想セッションがありません。最初の瞑想を始めてみましょう！')).toBeInTheDocument();
  });

  it('should call onSessionClick when session is clicked', () => {
    const onSessionClick = jest.fn();
    render(<MeditationHistory onSessionClick={onSessionClick} />);

    // Get the session element from the session list (not the select option)
    const sessionTitles = screen.getAllByText('基本の呼吸瞑想');
    const sessionTitle = sessionTitles.find(el => el.tagName === 'H3');
    const sessionElement = sessionTitle?.closest('.cursor-pointer');
    
    fireEvent.click(sessionElement!);

    expect(onSessionClick).toHaveBeenCalledWith(mockSession);
  });

  it('should filter sessions by date range', async () => {
    const fetchSessions = jest.fn();
    mockUseMeditationHistory.mockReturnValue({
      ...defaultHookReturn,
      fetchSessions
    });

    render(<MeditationHistory />);

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
  });

  it('should filter sessions by script', () => {
    render(<MeditationHistory />);

    const scriptSelect = screen.getByDisplayValue('全てのスクリプト');
    fireEvent.change(scriptSelect, { target: { value: 'basic-breathing' } });

    // The filtering is done in the component, so we check if the UI updates
    expect(screen.getByDisplayValue('基本の呼吸瞑想')).toBeInTheDocument();
  });

  it('should filter sessions by completion status', () => {
    const incompleteSessions = [
      {
        ...mockSession,
        id: 'session-2',
        completed: false
      }
    ];

    mockUseMeditationHistory.mockReturnValue({
      ...defaultHookReturn,
      sessions: [...defaultHookReturn.sessions, ...incompleteSessions]
    });

    render(<MeditationHistory />);

    const statusSelect = screen.getByDisplayValue('全ての状態');
    fireEvent.change(statusSelect, { target: { value: 'false' } });

    // Should show only incomplete sessions
    expect(screen.getByText('瞑想セッション履歴 (1件)')).toBeInTheDocument();
  });

  it('should clear filters', () => {
    render(<MeditationHistory />);

    // Set a filter first
    const past7DaysButton = screen.getByText('過去7日');
    fireEvent.click(past7DaysButton);

    // Clear filters
    const clearButton = screen.getByText('フィルタークリア');
    fireEvent.click(clearButton);

    // Check that filters are cleared (button should disappear)
    expect(screen.queryByText('フィルタークリア')).not.toBeInTheDocument();
  });

  it('should switch between list and calendar view', () => {
    render(<MeditationHistory />);

    const calendarButton = screen.getByText('カレンダー');
    fireEvent.click(calendarButton);

    // Check that calendar button is now active
    expect(calendarButton).toHaveClass('bg-blue-600');
    
    const listButton = screen.getByText('リスト');
    expect(listButton).not.toHaveClass('bg-blue-600');
  });

  it('should handle sessions with missing script data', () => {
    const sessionWithUnknownScript = {
      ...mockSession,
      scriptId: 'unknown-script'
    };

    mockUseMeditationHistory.mockReturnValue({
      ...defaultHookReturn,
      sessions: [sessionWithUnknownScript]
    });

    render(<MeditationHistory />);

    expect(screen.getByText('unknown-script')).toBeInTheDocument();
  });

  it('should format session duration correctly', () => {
    const longSession = {
      ...mockSession,
      duration: 3661 // 1 hour, 1 minute, 1 second
    };

    mockUseMeditationHistory.mockReturnValue({
      ...defaultHookReturn,
      sessions: [longSession]
    });

    render(<MeditationHistory />);

    expect(screen.getByText('61分1秒')).toBeInTheDocument();
  });

  it('should show correct completion status indicators', () => {
    const sessions = [
      { ...mockSession, id: '1', completed: true },
      { ...mockSession, id: '2', completed: false }
    ];

    mockUseMeditationHistory.mockReturnValue({
      ...defaultHookReturn,
      sessions
    });

    render(<MeditationHistory />);

    // Get completion status from session items only (not from select options)
    const sessionItems = screen.getAllByRole('generic').filter(el => 
      el.classList.contains('cursor-pointer') && el.classList.contains('transition-colors')
    );
    
    expect(sessionItems).toHaveLength(2);
    
    // Check that we have one completed and one incomplete session
    const completedText = screen.getByText((content, element) => 
      content === '完了' && element?.closest('.cursor-pointer') !== null
    );
    const incompleteText = screen.getByText((content, element) => 
      content === '未完了' && element?.closest('.cursor-pointer') !== null
    );
    
    expect(completedText).toBeInTheDocument();
    expect(incompleteText).toBeInTheDocument();
  });
});
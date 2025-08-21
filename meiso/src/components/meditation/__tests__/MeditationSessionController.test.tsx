import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MeditationSessionController } from '../MeditationSessionController';
import { MeditationScript } from '@/types';

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: React.ComponentProps<'button'>) => <button {...props}>{children}</button>,
    circle: ({ children, ...props }: React.ComponentProps<'circle'>) => <circle {...props}>{children}</circle>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock MeditationLayout
jest.mock('@/components/layout/MeditationLayout', () => ({
  MeditationLayout: ({ children, onExit }: { children: React.ReactNode; onExit: () => void }) => (
    <div data-testid="meditation-layout">
      <button onClick={onExit} data-testid="exit-button">Exit</button>
      {children}
    </div>
  ),
}));

// Mock useMeditationSession hook
const mockUseMeditationSession = {
  sessionState: {
    isActive: false,
    isPaused: false,
    isCompleted: false,
    startTime: null,
    endTime: null,
    currentInstruction: null,
    currentInstructionType: null,
  },
  timeElapsed: 0,
  timeRemaining: 60,
  progress: 0,
  audioController: {
    play: jest.fn(),
    stop: jest.fn(),
    changeVolume: jest.fn(),
    toggleMute: jest.fn(),
    isSupported: true,
    state: {
      isLoading: false,
      isPlaying: false,
      isMuted: false,
      error: null,
      currentTime: 0,
      duration: 60,
    },
  },
  startSession: jest.fn(),
  pauseSession: jest.fn(),
  resumeSession: jest.fn(),
  stopSession: jest.fn(),
};

jest.mock('@/hooks/useMeditationSession', () => ({
  useMeditationSession: () => mockUseMeditationSession,
}));

const mockScript: MeditationScript = {
  id: 'test-script',
  title: 'テスト瞑想',
  description: 'テスト用の瞑想スクリプト',
  category: 'breathing',
  duration: 60,
  audioUrl: 'https://example.com/audio.mp3',
  instructions: [
    {
      timestamp: 0,
      text: '開始のガイダンス',
      type: 'guidance',
    },
  ],
  tags: ['テスト'],
  difficulty: 'beginner',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const defaultProps = {
  script: mockScript,
  volume: 0.7,
  audioEnabled: true,
  onSessionComplete: jest.fn(),
  onExit: jest.fn(),
  onVolumeChange: jest.fn(),
  onToggleMute: jest.fn(),
};

describe('MeditationSessionController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('スクリプト情報が正しく表示される', () => {
    render(<MeditationSessionController {...defaultProps} />);

    expect(screen.getByText('テスト瞑想')).toBeInTheDocument();
    expect(screen.getByText('テスト用の瞑想スクリプト')).toBeInTheDocument();
  });

  it('初期状態で開始ボタンが表示される', () => {
    render(<MeditationSessionController {...defaultProps} />);

    expect(screen.getByText('瞑想を開始')).toBeInTheDocument();
  });

  it('開始ボタンをクリックするとセッションが開始される', () => {
    render(<MeditationSessionController {...defaultProps} />);

    const startButton = screen.getByText('瞑想を開始');
    fireEvent.click(startButton);

    expect(mockUseMeditationSession.startSession).toHaveBeenCalled();
  });

  it('セッション中は一時停止ボタンが表示される', () => {
    mockUseMeditationSession.sessionState.isActive = true;
    mockUseMeditationSession.sessionState.isPaused = false;

    render(<MeditationSessionController {...defaultProps} />);

    expect(screen.getByText('一時停止')).toBeInTheDocument();
  });

  it('一時停止中は再開ボタンが表示される', () => {
    mockUseMeditationSession.sessionState.isActive = true;
    mockUseMeditationSession.sessionState.isPaused = true;

    render(<MeditationSessionController {...defaultProps} />);

    expect(screen.getByText('再開')).toBeInTheDocument();
  });

  it('完了時は完了ボタンが表示される', () => {
    mockUseMeditationSession.sessionState.isCompleted = true;

    render(<MeditationSessionController {...defaultProps} />);

    expect(screen.getByRole('button', { name: '瞑想セッションを完了して終了' })).toBeInTheDocument();
  });

  it('時間が正しくフォーマットされて表示される', () => {
    mockUseMeditationSession.timeRemaining = 90; // 1分30秒

    render(<MeditationSessionController {...defaultProps} />);

    expect(screen.getByText('01:30')).toBeInTheDocument();
  });

  it('進捗率が正しく表示される', () => {
    mockUseMeditationSession.progress = 0.5; // 50%

    render(<MeditationSessionController {...defaultProps} />);

    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('現在のインストラクションが表示される', () => {
    mockUseMeditationSession.sessionState.currentInstruction = 'テストインストラクション';
    mockUseMeditationSession.sessionState.currentInstructionType = 'guidance';

    render(<MeditationSessionController {...defaultProps} />);

    expect(screen.getByText('テストインストラクション')).toBeInTheDocument();
    expect(screen.getByText('ガイダンス')).toBeInTheDocument();
  });

  it('音声制御が表示される（音声URLがある場合）', () => {
    render(<MeditationSessionController {...defaultProps} />);

    expect(screen.getByText('音量')).toBeInTheDocument();
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('音声制御が表示されない（音声URLがない場合）', () => {
    const propsWithoutAudio = {
      ...defaultProps,
      script: { ...mockScript, audioUrl: undefined },
    };

    render(<MeditationSessionController {...propsWithoutAudio} />);

    expect(screen.queryByText('音量')).not.toBeInTheDocument();
  });

  it('音量スライダーの変更が処理される', () => {
    render(<MeditationSessionController {...defaultProps} />);

    const volumeSlider = screen.getByRole('slider');
    fireEvent.change(volumeSlider, { target: { value: '0.5' } });

    expect(mockUseMeditationSession.audioController.changeVolume).toHaveBeenCalledWith(0.5);
  });

  it('ミュートボタンが機能する', () => {
    render(<MeditationSessionController {...defaultProps} />);

    const muteButton = screen.getByLabelText('音声をオフにする');
    fireEvent.click(muteButton);

    expect(mockUseMeditationSession.audioController.toggleMute).toHaveBeenCalled();
  });

  it('終了ボタンで終了処理が呼ばれる', () => {
    render(<MeditationSessionController {...defaultProps} />);

    const exitButton = screen.getByTestId('exit-button');
    fireEvent.click(exitButton);

    expect(defaultProps.onExit).toHaveBeenCalled();
  });

  it('セッション中の終了ボタンでセッション停止が呼ばれる', () => {
    mockUseMeditationSession.sessionState.isActive = true;

    render(<MeditationSessionController {...defaultProps} />);

    const stopButton = screen.getByText('終了');
    fireEvent.click(stopButton);

    expect(mockUseMeditationSession.stopSession).toHaveBeenCalled();
    expect(defaultProps.onExit).toHaveBeenCalled();
  });

  it('エラーが表示される', () => {
    mockUseMeditationSession.audioController.state.error = 'テストエラー';

    render(<MeditationSessionController {...defaultProps} />);

    expect(screen.getByText('テストエラー')).toBeInTheDocument();
  });

  afterEach(() => {
    // Reset mock state
    mockUseMeditationSession.sessionState = {
      isActive: false,
      isPaused: false,
      isCompleted: false,
      startTime: null,
      endTime: null,
      currentInstruction: null,
      currentInstructionType: null,
    };
    mockUseMeditationSession.timeElapsed = 0;
    mockUseMeditationSession.timeRemaining = 60;
    mockUseMeditationSession.progress = 0;
    mockUseMeditationSession.audioController.state.error = null;
  });
});
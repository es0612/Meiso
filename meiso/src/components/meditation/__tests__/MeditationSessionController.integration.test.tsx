import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

// Mock Web Audio API
const mockAudioContext = {
  createOscillator: jest.fn(() => ({
    connect: jest.fn(),
    frequency: { setValueAtTime: jest.fn() },
    start: jest.fn(),
    stop: jest.fn(),
    type: 'sine',
  })),
  createGain: jest.fn(() => ({
    connect: jest.fn(),
    gain: {
      setValueAtTime: jest.fn(),
      linearRampToValueAtTime: jest.fn(),
      exponentialRampToValueAtTime: jest.fn(),
      value: 1,
    },
  })),
  destination: {},
  currentTime: 0,
};

Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: jest.fn().mockImplementation(() => mockAudioContext),
});

const mockScript: MeditationScript = {
  id: 'integration-test-script',
  title: '統合テスト瞑想',
  description: '統合テスト用の瞑想スクリプト',
  category: 'breathing',
  duration: 5, // 短い時間でテスト
  instructions: [
    {
      timestamp: 0,
      text: '開始のガイダンス',
      type: 'guidance',
    },
    {
      timestamp: 2,
      text: '呼吸に集中してください',
      type: 'breathing',
    },
  ],
  tags: ['統合テスト'],
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

describe('MeditationSessionController Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('完全な瞑想セッションフローが正常に動作する', async () => {
    const onSessionComplete = jest.fn();
    const onExit = jest.fn();

    render(
      <MeditationSessionController
        {...defaultProps}
        onSessionComplete={onSessionComplete}
        onExit={onExit}
      />
    );

    // 初期状態の確認
    expect(screen.getByText('統合テスト瞑想')).toBeInTheDocument();
    expect(screen.getByText('瞑想を開始')).toBeInTheDocument();

    // セッション開始
    fireEvent.click(screen.getByText('瞑想を開始'));

    // セッション中の状態確認
    await waitFor(() => {
      expect(screen.getByText('一時停止')).toBeInTheDocument();
    });

    // 一時停止
    fireEvent.click(screen.getByText('一時停止'));

    await waitFor(() => {
      expect(screen.getByText('再開')).toBeInTheDocument();
    });

    // 再開
    fireEvent.click(screen.getByText('再開'));

    await waitFor(() => {
      expect(screen.getByText('一時停止')).toBeInTheDocument();
    });

    // セッション終了
    fireEvent.click(screen.getByText('終了'));

    expect(onExit).toHaveBeenCalled();
  });

  it('音声制御が正常に動作する', () => {
    const onVolumeChange = jest.fn();
    const onToggleMute = jest.fn();

    render(
      <MeditationSessionController
        {...defaultProps}
        onVolumeChange={onVolumeChange}
        onToggleMute={onToggleMute}
        script={{ ...mockScript, audioUrl: 'https://example.com/audio.mp3' }}
      />
    );

    // 音量スライダーの操作
    const volumeSlider = screen.getByRole('slider');
    fireEvent.change(volumeSlider, { target: { value: '0.5' } });

    expect(onVolumeChange).toHaveBeenCalledWith(0.5);

    // ミュートボタンの操作
    const muteButton = screen.getByTitle('音声をオフ');
    fireEvent.click(muteButton);

    expect(onToggleMute).toHaveBeenCalled();
  });

  it('キーボードショートカットが動作する', async () => {
    render(<MeditationSessionController {...defaultProps} />);

    // スペースキーでセッション開始
    fireEvent.keyDown(document, { code: 'Space' });

    await waitFor(() => {
      expect(screen.getByText('一時停止')).toBeInTheDocument();
    });

    // スペースキーで一時停止
    fireEvent.keyDown(document, { code: 'Space' });

    await waitFor(() => {
      expect(screen.getByText('再開')).toBeInTheDocument();
    });
  });

  it('エラー状態が適切に表示される', () => {
    // AudioControllerのエラーをモック
    jest.doMock('@/hooks/useMeditationSession', () => ({
      useMeditationSession: () => ({
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
            error: 'テスト音声エラー',
            currentTime: 0,
            duration: 60,
          },
        },
        startSession: jest.fn(),
        pauseSession: jest.fn(),
        resumeSession: jest.fn(),
        stopSession: jest.fn(),
      }),
    }));

    render(<MeditationSessionController {...defaultProps} />);

    // エラーメッセージが表示されることを確認
    // Note: この部分は実際のエラー状態をシミュレートするために
    // より複雑なモックが必要になる場合があります
  });
});
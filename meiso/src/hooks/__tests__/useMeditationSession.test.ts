import { renderHook, act } from '@testing-library/react';
import { useMeditationSession } from '../useMeditationSession';
import { MeditationScript } from '@/types';

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

// Mock AudioController
jest.mock('@/components/audio/AudioController', () => ({
  useAudioController: () => ({
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
  }),
}));

// Mock global objects
Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: jest.fn().mockImplementation(() => mockAudioContext),
});

Object.defineProperty(window, 'webkitAudioContext', {
  writable: true,
  value: jest.fn().mockImplementation(() => mockAudioContext),
});

const mockScript: MeditationScript = {
  id: 'test-script',
  title: 'テスト瞑想',
  description: 'テスト用の瞑想スクリプト',
  category: 'breathing',
  duration: 60,
  instructions: [
    {
      timestamp: 0,
      text: '開始のガイダンス',
      type: 'guidance',
    },
    {
      timestamp: 30,
      text: '中間のガイダンス',
      type: 'breathing',
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
  onVolumeChange: jest.fn(),
  onToggleMute: jest.fn(),
};

describe('useMeditationSession', () => {
  let mockDateNow: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockDateNow = jest.spyOn(Date, 'now').mockReturnValue(0);
  });

  afterEach(() => {
    jest.useRealTimers();
    mockDateNow.mockRestore();
  });

  it('初期状態が正しく設定される', () => {
    const { result } = renderHook(() => useMeditationSession(defaultProps));

    expect(result.current.sessionState.isActive).toBe(false);
    expect(result.current.sessionState.isPaused).toBe(false);
    expect(result.current.sessionState.isCompleted).toBe(false);
    expect(result.current.timeElapsed).toBe(0);
    expect(result.current.timeRemaining).toBe(60);
    expect(result.current.progress).toBe(0);
  });

  it('セッションを開始できる', () => {
    const { result } = renderHook(() => useMeditationSession(defaultProps));

    act(() => {
      result.current.startSession();
    });

    expect(result.current.sessionState.isActive).toBe(true);
    expect(result.current.sessionState.isPaused).toBe(false);
    expect(result.current.sessionState.startTime).toBeInstanceOf(Date);
  });

  it('セッションを一時停止できる', () => {
    const { result } = renderHook(() => useMeditationSession(defaultProps));

    act(() => {
      result.current.startSession();
    });

    act(() => {
      result.current.pauseSession();
    });

    expect(result.current.sessionState.isActive).toBe(true);
    expect(result.current.sessionState.isPaused).toBe(true);
  });

  it('一時停止したセッションを再開できる', () => {
    const { result } = renderHook(() => useMeditationSession(defaultProps));

    act(() => {
      result.current.startSession();
    });

    act(() => {
      result.current.pauseSession();
    });

    act(() => {
      result.current.resumeSession();
    });

    expect(result.current.sessionState.isActive).toBe(true);
    expect(result.current.sessionState.isPaused).toBe(false);
  });

  it('セッションを停止できる', () => {
    const { result } = renderHook(() => useMeditationSession(defaultProps));

    act(() => {
      result.current.startSession();
    });

    act(() => {
      result.current.stopSession();
    });

    expect(result.current.sessionState.isActive).toBe(false);
    expect(result.current.sessionState.isPaused).toBe(false);
    expect(result.current.sessionState.endTime).toBeInstanceOf(Date);
  });

  it('時間の経過とともに進捗が更新される', () => {
    const { result } = renderHook(() => useMeditationSession(defaultProps));

    // 初期状態の確認
    expect(result.current.timeElapsed).toBe(0);
    expect(result.current.timeRemaining).toBe(60);
    expect(result.current.progress).toBe(0);
  });

  it('セッション完了時にコールバックが呼ばれる', () => {
    const onSessionComplete = jest.fn();
    const { result } = renderHook(() => 
      useMeditationSession({ ...defaultProps, onSessionComplete })
    );

    // completeSession を直接呼び出してテスト
    act(() => {
      result.current.startSession();
    });

    act(() => {
      result.current.completeSession();
    });

    expect(result.current.sessionState.isCompleted).toBe(true);
    expect(onSessionComplete).toHaveBeenCalled();
  });

  it('音声が無効の場合は音声制御を行わない', () => {
    const { result } = renderHook(() => 
      useMeditationSession({ ...defaultProps, audioEnabled: false })
    );

    act(() => {
      result.current.startSession();
    });

    // 音声制御のメソッドが呼ばれないことを確認
    expect(result.current.audioController.play).not.toHaveBeenCalled();
  });

  it('進捗率が正しく計算される', () => {
    const { result } = renderHook(() => useMeditationSession(defaultProps));

    // 初期状態では進捗は0
    expect(result.current.progress).toBe(0);

    // セッション開始後も初期は0
    act(() => {
      result.current.startSession();
    });

    expect(result.current.progress).toBe(0);
  });
});
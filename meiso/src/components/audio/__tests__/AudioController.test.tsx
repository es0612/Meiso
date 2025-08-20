import { renderHook, act } from '@testing-library/react';
import { useAudioController } from '../AudioController';

// Web Audio API のモック
const mockAudioContext = {
  createGain: jest.fn(),
  createBufferSource: jest.fn(),
  decodeAudioData: jest.fn(),
  resume: jest.fn(),
  close: jest.fn(),
  currentTime: 0,
  state: 'running',
  destination: {},
};

const mockGainNode = {
  connect: jest.fn(),
  gain: {
    value: 1,
    setValueAtTime: jest.fn(),
    linearRampToValueAtTime: jest.fn(),
  },
};

const mockSourceNode = {
  connect: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
  buffer: null,
  onended: null,
};

const mockAudioBuffer = {
  duration: 60, // 60秒
};

// グローバルモック
(global as any).AudioContext = jest.fn(() => mockAudioContext);
(global as any).fetch = jest.fn();
(global as any).requestAnimationFrame = jest.fn((cb) => {
  setTimeout(cb, 16);
  return 1;
});
(global as any).cancelAnimationFrame = jest.fn();

describe('useAudioController', () => {
  const defaultProps = {
    audioUrl: 'https://example.com/audio.mp3',
    volume: 0.8,
    onVolumeChange: jest.fn(),
    onToggleMute: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAudioContext.createGain.mockReturnValue(mockGainNode);
    mockAudioContext.createBufferSource.mockReturnValue(mockSourceNode);
    mockAudioContext.decodeAudioData.mockResolvedValue(mockAudioBuffer);
    
    (global as any).fetch.mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
    });
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useAudioController(defaultProps));

    expect(result.current.state.isLoading).toBe(false);
    expect(result.current.state.isPlaying).toBe(false);
    expect(result.current.state.isMuted).toBe(false);
    expect(result.current.state.error).toBe(null);
    expect(result.current.state.currentTime).toBe(0);
    expect(result.current.state.duration).toBe(0);
    expect(result.current.isSupported).toBe(true);
  });

  it('should detect Web Audio API support', () => {
    const { result } = renderHook(() => useAudioController(defaultProps));
    expect(result.current.isSupported).toBe(true);
  });

  it('should handle unsupported browser', () => {
    // AudioContext を削除してサポートされていない状態をシミュレート
    const originalAudioContext = (global as any).AudioContext;
    delete (global as any).AudioContext;
    delete (global as any).webkitAudioContext;

    const { result } = renderHook(() => useAudioController(defaultProps));
    expect(result.current.isSupported).toBe(false);

    // 元に戻す
    (global as any).AudioContext = originalAudioContext;
  });
});
import { renderHook, act } from '@testing-library/react';
import { useAudioController } from '../AudioController';
import { expect } from '@jest/globals';
import { it } from 'zod/locales';
import { expect } from '@jest/globals';
import { it } from 'zod/locales';
import { jest } from '@jest/globals';
import { expect } from '@jest/globals';
import { jest } from '@jest/globals';
import { jest } from '@jest/globals';
import { jest } from '@jest/globals';
import { it } from 'zod/locales';
import { expect } from '@jest/globals';
import { it } from 'zod/locales';
import { expect } from '@jest/globals';
import { expect } from '@jest/globals';
import { expect } from '@jest/globals';
import { it } from 'zod/locales';
import { expect } from '@jest/globals';
import { it } from 'zod/locales';
import { expect } from '@jest/globals';
import { expect } from '@jest/globals';
import { it } from 'zod/locales';
import { expect } from '@jest/globals';
import { expect } from '@jest/globals';
import { expect } from '@jest/globals';
import { expect } from '@jest/globals';
import { expect } from '@jest/globals';
import { expect } from '@jest/globals';
import { expect } from '@jest/globals';
import { it } from 'zod/locales';
import { jest } from '@jest/globals';
import { it } from 'zod/locales';
import { expect } from '@jest/globals';
import { expect } from '@jest/globals';
import { it } from 'zod/locales';
import { expect } from '@jest/globals';
import { expect } from '@jest/globals';
import { expect } from '@jest/globals';
import { expect } from '@jest/globals';
import { expect } from '@jest/globals';
import { expect } from '@jest/globals';
import { expect } from '@jest/globals';
import { it } from 'zod/locales';
import { jest } from '@jest/globals';
import { jest } from '@jest/globals';
import { beforeEach } from '@jest/globals';
import { jest } from '@jest/globals';
import { jest } from '@jest/globals';
import { describe } from '@jest/globals';
import { jest } from '@jest/globals';
import { jest } from '@jest/globals';
import { jest } from '@jest/globals';
import { jest } from '@jest/globals';
import { jest } from '@jest/globals';
import { jest } from '@jest/globals';
import { jest } from '@jest/globals';
import { jest } from '@jest/globals';
import { jest } from '@jest/globals';
import { jest } from '@jest/globals';
import { jest } from '@jest/globals';
import { jest } from '@jest/globals';
import { jest } from '@jest/globals';
import { jest } from '@jest/globals';
import { jest } from '@jest/globals';
import { jest } from '@jest/globals';
import { jest } from '@jest/globals';
import { jest } from '@jest/globals';
import { jest } from '@jest/globals';

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
(global as unknown as { AudioContext: jest.Mock }).AudioContext = jest.fn(() => mockAudioContext);
(global as unknown as { fetch: jest.Mock }).fetch = jest.fn();
(global as unknown as { requestAnimationFrame: jest.Mock }).requestAnimationFrame = jest.fn((cb) => {
  setTimeout(cb, 16);
  return 1;
});
(global as unknown as { cancelAnimationFrame: jest.Mock }).cancelAnimationFrame = jest.fn();

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
    
    (global as unknown as { fetch: jest.Mock }).fetch.mockResolvedValue({
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

  it('should load audio file when audioUrl is provided', async () => {
    const { result } = renderHook(() => useAudioController(defaultProps));

    // 音声ファイルの読み込みが開始されることを確認
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(global.fetch).toHaveBeenCalledWith(defaultProps.audioUrl);
    expect(mockAudioContext.decodeAudioData).toHaveBeenCalled();
  });

  it('should handle audio loading error', async () => {
    (global as unknown as { fetch: jest.Mock }).fetch.mockRejectedValue(new Error('Network error'));

    renderHook(() => useAudioController(defaultProps));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
  });

  it('should play audio with fade in', async () => {
    const { result } = renderHook(() => useAudioController(defaultProps));

    // 音声ファイルが読み込まれるまで待機
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    await act(async () => {
      await result.current.play(1.0);
    });

    expect(mockAudioContext.createBufferSource).toHaveBeenCalled();
    expect(mockSourceNode.connect).toHaveBeenCalledWith(mockGainNode);
    expect(mockSourceNode.start).toHaveBeenCalled();
    expect(mockGainNode.gain.setValueAtTime).toHaveBeenCalledWith(0, expect.any(Number));
    expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.8, expect.any(Number));
  });

  it('should stop audio with fade out', async () => {
    const { result } = renderHook(() => useAudioController(defaultProps));

    // 音声ファイルが読み込まれるまで待機
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // 再生開始
    await act(async () => {
      await result.current.play();
    });

    // 停止
    await act(async () => {
      result.current.stop(1.0);
    });

    expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0, expect.any(Number));
  });

  it('should change volume', async () => {
    const { result } = renderHook(() => useAudioController(defaultProps));

    await act(async () => {
      result.current.changeVolume(0.5);
    });

    expect(defaultProps.onVolumeChange).toHaveBeenCalledWith(0.5);
  });

  it('should toggle mute', async () => {
    const { result } = renderHook(() => useAudioController(defaultProps));

    // 音声ファイルが読み込まれるまで待機
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    await act(async () => {
      result.current.toggleMute();
    });

    expect(result.current.state.isMuted).toBe(true);
    expect(mockGainNode.gain.value).toBe(0);
    expect(defaultProps.onToggleMute).toHaveBeenCalled();
  });

  it('should detect Web Audio API support', () => {
    const { result } = renderHook(() => useAudioController(defaultProps));
    expect(result.current.isSupported).toBe(true);
  });

  it('should handle unsupported browser', () => {
    // AudioContext を削除してサポートされていない状態をシミュレート
    const originalAudioContext = (global as unknown as { AudioContext: jest.Mock }).AudioContext;
    delete (global as unknown as { AudioContext?: jest.Mock }).AudioContext;
    delete (global as unknown as { webkitAudioContext?: jest.Mock }).webkitAudioContext;

    const { result } = renderHook(() => useAudioController(defaultProps));
    expect(result.current.isSupported).toBe(false);

    // 元に戻す
    (global as unknown as { AudioContext: jest.Mock }).AudioContext = originalAudioContext;
  });

  it('should update volume when props change', async () => {
    const { result, rerender } = renderHook(
      (props) => useAudioController(props),
      { initialProps: defaultProps }
    );

    // 音声ファイルが読み込まれるまで待機
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // volume を変更
    const newProps = { ...defaultProps, volume: 0.3 };
    
    await act(async () => {
      rerender(newProps);
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(mockGainNode.gain.value).toBe(0.3);
  });

  it('should cleanup resources on unmount', async () => {
    const { unmount } = renderHook(() => useAudioController(defaultProps));

    // 音声ファイルが読み込まれるまで待機
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    act(() => {
      unmount();
    });

    expect(mockAudioContext.close).toHaveBeenCalled();
  });
});
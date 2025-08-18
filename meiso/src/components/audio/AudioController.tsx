'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface AudioState {
  isLoading: boolean;
  isPlaying: boolean;
  isMuted: boolean;
  error: string | null;
  currentTime: number;
  duration: number;
}

export interface UseAudioControllerProps {
  audioUrl: string;
  volume: number;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
}

export const useAudioController = ({
  audioUrl,
  volume,
  onVolumeChange,
  onToggleMute,
}: UseAudioControllerProps) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [audioState, setAudioState] = useState<AudioState>({
    isLoading: false,
    isPlaying: false,
    isMuted: false,
    error: null,
    currentTime: 0,
    duration: 0,
  });

  // Web Audio API サポートチェック
  const isWebAudioSupported = useCallback(() => {
    return !!(window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
  }, []);

  // AudioContext の初期化
  const initializeAudioContext = useCallback(async () => {
    if (!isWebAudioSupported()) {
      throw new Error('Web Audio API is not supported in this browser');
    }

    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
      
      // ゲインノードの作成（音量制御用）
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
      gainNodeRef.current.gain.value = volume;
    }

    // AudioContext が suspended 状態の場合は resume
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
  }, [volume, isWebAudioSupported]);

  // 音声ファイルの読み込み
  const loadAudioFile = useCallback(async (url: string) => {
    if (!audioContextRef.current) {
      await initializeAudioContext();
    }

    setAudioState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio file: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
      
      audioBufferRef.current = audioBuffer;
      setAudioState(prev => ({
        ...prev,
        isLoading: false,
        duration: audioBuffer.duration,
        error: null,
      }));
    } catch (error) {
      console.error('Error loading audio file:', error);
      setAudioState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load audio file',
      }));
    }
  }, [initializeAudioContext]);

  // フェードイン効果
  const fadeIn = useCallback((gainNode: GainNode, duration: number = 1.0) => {
    const currentTime = audioContextRef.current!.currentTime;
    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, currentTime + duration);
  }, [volume]);

  // フェードアウト効果
  const fadeOut = useCallback((gainNode: GainNode, duration: number = 1.0) => {
    const currentTime = audioContextRef.current!.currentTime;
    gainNode.gain.setValueAtTime(gainNode.gain.value, currentTime);
    gainNode.gain.linearRampToValueAtTime(0, currentTime + duration);
  }, []);

  // 再生時間の追跡を開始
  const startTimeTracking = useCallback(() => {
    if (!audioContextRef.current) return;
    
    const startTime = audioContextRef.current.currentTime;
    
    const updateTime = () => {
      if (audioContextRef.current && audioState.isPlaying) {
        const currentTime = audioContextRef.current.currentTime - startTime;
        setAudioState(prev => ({ ...prev, currentTime }));
        animationFrameRef.current = requestAnimationFrame(updateTime);
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(updateTime);
  }, [audioState.isPlaying]);

  // 音声再生
  const play = useCallback(async (fadeInDuration?: number) => {
    if (!audioBufferRef.current || !audioContextRef.current || !gainNodeRef.current) {
      return;
    }

    try {
      // 既存のソースノードがあれば停止
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
      }

      // 新しいソースノードを作成
      sourceNodeRef.current = audioContextRef.current.createBufferSource();
      sourceNodeRef.current.buffer = audioBufferRef.current;
      sourceNodeRef.current.connect(gainNodeRef.current);

      // フェードイン効果を適用
      if (fadeInDuration && fadeInDuration > 0) {
        fadeIn(gainNodeRef.current, fadeInDuration);
      }

      // 再生終了時のハンドラー
      sourceNodeRef.current.onended = () => {
        setAudioState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };

      sourceNodeRef.current.start();
      setAudioState(prev => ({ ...prev, isPlaying: true }));

      // 再生時間の更新を開始
      startTimeTracking();
    } catch (error) {
      console.error('Error playing audio:', error);
      setAudioState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to play audio',
      }));
    }
  }, [fadeIn, startTimeTracking]);

  // 音声停止
  const stop = useCallback((fadeOutDuration?: number) => {
    if (!sourceNodeRef.current || !gainNodeRef.current) {
      return;
    }

    if (fadeOutDuration && fadeOutDuration > 0) {
      fadeOut(gainNodeRef.current, fadeOutDuration);
      // フェードアウト完了後に停止
      setTimeout(() => {
        if (sourceNodeRef.current) {
          sourceNodeRef.current.stop();
          sourceNodeRef.current = null;
        }
        setAudioState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
      }, fadeOutDuration * 1000);
    } else {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
      setAudioState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, [fadeOut]);

  // 音量変更
  const changeVolume = useCallback((newVolume: number) => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = audioState.isMuted ? 0 : newVolume;
    }
    onVolumeChange(newVolume);
  }, [audioState.isMuted, onVolumeChange]);

  // ミュート切り替え
  const toggleMute = useCallback(() => {
    if (gainNodeRef.current) {
      const newMutedState = !audioState.isMuted;
      gainNodeRef.current.gain.value = newMutedState ? 0 : volume;
      setAudioState(prev => ({ ...prev, isMuted: newMutedState }));
      onToggleMute();
    }
  }, [audioState.isMuted, volume, onToggleMute]);

  // audioUrl が変更されたときに音声ファイルを読み込み
  useEffect(() => {
    if (audioUrl) {
      loadAudioFile(audioUrl);
    }
  }, [audioUrl, loadAudioFile]);

  // volume が変更されたときにゲインを更新
  useEffect(() => {
    if (gainNodeRef.current && !audioState.isMuted) {
      gainNodeRef.current.gain.value = volume;
    }
  }, [volume, audioState.isMuted]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // 公開メソッド
  return {
    play: (fadeInDuration?: number) => play(fadeInDuration),
    stop: (fadeOutDuration?: number) => stop(fadeOutDuration),
    changeVolume,
    toggleMute,
    isSupported: isWebAudioSupported(),
    state: audioState,
  };
};
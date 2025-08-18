'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { MeditationScript, MeditationSession } from '@/types';
import { useAudioController } from '@/components/audio/AudioController';

interface SessionState {
  isActive: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  startTime: Date | null;
  endTime: Date | null;
  currentInstruction: string | null;
  currentInstructionType: 'guidance' | 'breathing' | 'visualization' | null;
}

interface UseMeditationSessionProps {
  script: MeditationScript;
  volume: number;
  audioEnabled: boolean;
  onSessionComplete: (session: MeditationSession) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
}

export const useMeditationSession = ({
  script,
  volume,
  audioEnabled,
  onSessionComplete,
  onVolumeChange,
  onToggleMute,
}: UseMeditationSessionProps) => {
  const [sessionState, setSessionState] = useState<SessionState>({
    isActive: false,
    isPaused: false,
    isCompleted: false,
    startTime: null,
    endTime: null,
    currentInstruction: null,
    currentInstructionType: null,
  });

  const [timeElapsed, setTimeElapsed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const instructionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const pausedTimeRef = useRef<number>(0);
  const actualStartTimeRef = useRef<number | null>(null);

  // 音声制御フック
  const audioController = useAudioController({
    audioUrl: script.audioUrl || '',
    volume,
    onVolumeChange,
    onToggleMute,
  });

  // 完了音再生
  const playCompletionSound = useCallback(() => {
    if (!audioEnabled) return;

    // Web Audio APIで完了音を生成
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // 優しいベル音（C5 - E5 - G5のアルペジオ）
      const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
      
      frequencies.forEach((freq, index) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.frequency.setValueAtTime(freq, audioContext.currentTime);
        osc.type = 'sine';
        
        // 音量エンベロープ
        gain.gain.setValueAtTime(0, audioContext.currentTime + index * 0.3);
        gain.gain.linearRampToValueAtTime(volume * 0.3, audioContext.currentTime + index * 0.3 + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + index * 0.3 + 1.5);
        
        osc.start(audioContext.currentTime + index * 0.3);
        osc.stop(audioContext.currentTime + index * 0.3 + 1.5);
      });
    } catch (error) {
      console.warn('完了音の再生に失敗しました:', error);
    }
  }, [audioEnabled, volume]);

  // セッション完了
  const completeSession = useCallback(() => {
    const endTime = new Date();
    
    setSessionState(prev => ({
      ...prev,
      isActive: false,
      isPaused: false,
      isCompleted: true,
      endTime,
    }));

    // タイマー停止
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // インストラクションタイムアウトクリア
    if (instructionTimeoutRef.current) {
      clearTimeout(instructionTimeoutRef.current);
      instructionTimeoutRef.current = null;
    }

    // 音声停止
    if (audioController.state.isPlaying) {
      audioController.stop(1.0); // 1秒のフェードアウト
    }

    // 完了音再生
    playCompletionSound();

    // セッションデータ作成
    if (sessionState.startTime && sessionIdRef.current) {
      const session: MeditationSession = {
        id: sessionIdRef.current,
        scriptId: script.id,
        startTime: sessionState.startTime,
        endTime,
        completed: true,
        duration: timeElapsed,
        deviceInfo: {
          userAgent: navigator.userAgent,
          screenSize: `${window.screen.width}x${window.screen.height}`,
        },
      };

      onSessionComplete(session);
    }
  }, [sessionState.startTime, script.id, timeElapsed, audioController, onSessionComplete, playCompletionSound]);

  // タイマー開始
  const startTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      if (actualStartTimeRef.current) {
        const elapsed = Math.floor((Date.now() - actualStartTimeRef.current - pausedTimeRef.current) / 1000);
        setTimeElapsed(elapsed);

        // セッション完了チェック
        if (elapsed >= script.duration) {
          completeSession();
        }
      }
    }, 1000);
  }, [script.duration, completeSession]);

  // セッション開始
  const startSession = useCallback(() => {
    const now = new Date();
    const sessionId = `session_${now.getTime()}_${Math.random().toString(36).substr(2, 9)}`;
    
    sessionIdRef.current = sessionId;
    actualStartTimeRef.current = Date.now();
    pausedTimeRef.current = 0;

    setSessionState({
      isActive: true,
      isPaused: false,
      isCompleted: false,
      startTime: now,
      endTime: null,
      currentInstruction: null,
      currentInstructionType: null,
    });

    setTimeElapsed(0);

    // 音声ガイダンス開始（音声が有効で利用可能な場合）
    if (audioEnabled && script.audioUrl && audioController.isSupported) {
      audioController.play(1.0); // 1秒のフェードイン
    }

    // 最初のインストラクションを設定
    if (script.instructions.length > 0) {
      const firstInstruction = script.instructions[0];
      if (firstInstruction.timestamp === 0) {
        setSessionState(prev => ({
          ...prev,
          currentInstruction: firstInstruction.text,
          currentInstructionType: firstInstruction.type,
        }));
      }
    }
  }, [script, audioEnabled, audioController]);

  // インストラクションスケジューラー
  const scheduleInstructions = useCallback(() => {
    script.instructions.forEach((instruction) => {
      if (instruction.timestamp > 0) {
        const timeout = setTimeout(() => {
          if (sessionState.isActive && !sessionState.isPaused) {
            setSessionState(prev => ({
              ...prev,
              currentInstruction: instruction.text,
              currentInstructionType: instruction.type,
            }));

            // インストラクション表示時間（5秒後にクリア）
            setTimeout(() => {
              setSessionState(prev => ({
                ...prev,
                currentInstruction: null,
                currentInstructionType: null,
              }));
            }, 5000);
          }
        }, instruction.timestamp * 1000);

        // タイムアウトを記録（クリーンアップ用）
        instructionTimeoutRef.current = timeout;
      }
    });
  }, [script.instructions, sessionState.isActive, sessionState.isPaused]);

  // セッション開始時の副作用（タイマーとインストラクション）
  useEffect(() => {
    if (sessionState.isActive && !sessionState.isPaused && sessionState.startTime) {
      startTimer();
      scheduleInstructions();
    }
  }, [sessionState.isActive, sessionState.isPaused, sessionState.startTime, startTimer, scheduleInstructions]);

  // セッション一時停止
  const pauseSession = useCallback(() => {
    if (!sessionState.isActive || sessionState.isPaused) return;

    setSessionState(prev => ({ ...prev, isPaused: true }));
    
    // タイマー停止
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // 一時停止時間を記録
    if (actualStartTimeRef.current) {
      pausedTimeRef.current += Date.now() - actualStartTimeRef.current - pausedTimeRef.current;
    }

    // 音声一時停止
    if (audioEnabled && audioController.state.isPlaying) {
      audioController.stop(0.5); // 0.5秒のフェードアウト
    }
  }, [sessionState, audioEnabled, audioController]);

  // セッション再開
  const resumeSession = useCallback(() => {
    if (!sessionState.isPaused) return;

    setSessionState(prev => ({ ...prev, isPaused: false }));
    
    // 実際の開始時間を再設定
    actualStartTimeRef.current = Date.now();

    // タイマー再開
    startTimer();

    // 音声再開
    if (audioEnabled && script.audioUrl && audioController.isSupported) {
      audioController.play(0.5); // 0.5秒のフェードイン
    }
  }, [sessionState.isPaused, audioEnabled, script.audioUrl, audioController, startTimer]);



  // セッション停止（強制終了）
  const stopSession = useCallback(() => {
    const endTime = new Date();
    
    setSessionState(prev => ({
      ...prev,
      isActive: false,
      isPaused: false,
      isCompleted: false,
      endTime,
    }));

    // タイマー停止
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // インストラクションタイムアウトクリア
    if (instructionTimeoutRef.current) {
      clearTimeout(instructionTimeoutRef.current);
      instructionTimeoutRef.current = null;
    }

    // 音声停止
    if (audioController.state.isPlaying) {
      audioController.stop(0.5);
    }

    // 未完了セッションデータ作成
    if (sessionState.startTime && sessionIdRef.current) {
      const session: MeditationSession = {
        id: sessionIdRef.current,
        scriptId: script.id,
        startTime: sessionState.startTime,
        endTime,
        completed: false,
        duration: timeElapsed,
        deviceInfo: {
          userAgent: navigator.userAgent,
          screenSize: `${window.screen.width}x${window.screen.height}`,
        },
      };

      onSessionComplete(session);
    }

    // 状態リセット
    setTimeElapsed(0);
    sessionIdRef.current = null;
    actualStartTimeRef.current = null;
    pausedTimeRef.current = 0;
  }, [sessionState.startTime, script.id, timeElapsed, audioController, onSessionComplete]);

  // Page Visibility API - バックグラウンド実行対応
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && sessionState.isActive && !sessionState.isPaused) {
        // バックグラウンドに移行時は正確な時間を記録
        if (actualStartTimeRef.current) {
          pausedTimeRef.current = Date.now() - actualStartTimeRef.current - pausedTimeRef.current;
        }
      } else if (!document.hidden && sessionState.isActive && !sessionState.isPaused) {
        // フォアグラウンドに復帰時は時間を再計算
        actualStartTimeRef.current = Date.now();
        
        // 経過時間を再計算して更新
        const elapsed = Math.floor(pausedTimeRef.current / 1000);
        setTimeElapsed(elapsed);
        
        // セッション完了チェック
        if (elapsed >= script.duration) {
          completeSession();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [sessionState.isActive, sessionState.isPaused, script.duration, completeSession]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (instructionTimeoutRef.current) {
        clearTimeout(instructionTimeoutRef.current);
      }
    };
  }, []);

  // 進捗率計算
  const progress = script.duration > 0 ? Math.min(timeElapsed / script.duration, 1) : 0;
  const timeRemaining = Math.max(script.duration - timeElapsed, 0);

  return {
    sessionState,
    timeElapsed,
    timeRemaining,
    progress,
    audioController,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    completeSession,
  };
};
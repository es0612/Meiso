'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MeditationTimerProps } from '@/types';

interface TimerState {
  timeRemaining: number; // 残り時間（秒）
  isRunning: boolean;
  isPaused: boolean;
  isCompleted: boolean;
}

export const MeditationTimer = ({
  duration,
  script,
  onComplete,
  onPause,
  onResume,
}: MeditationTimerProps) => {
  const [timerState, setTimerState] = useState<TimerState>({
    timeRemaining: duration,
    isRunning: false,
    isPaused: false,
    isCompleted: false,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);

  // 進捗率の計算（0-1の範囲）
  const progress = (duration - timerState.timeRemaining) / duration;
  
  // 円形プログレスバーのパス計算
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  // 時間フォーマット（MM:SS）
  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // タイマー開始
  const startTimer = useCallback(() => {
    if (timerState.isCompleted) return;

    setTimerState(prev => ({ ...prev, isRunning: true, isPaused: false }));
    startTimeRef.current = Date.now() - pausedTimeRef.current;

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current!) / 1000);
      const remaining = Math.max(0, duration - elapsed);

      setTimerState(prev => ({
        ...prev,
        timeRemaining: remaining,
      }));

      if (remaining === 0) {
        setTimerState(prev => ({
          ...prev,
          isRunning: false,
          isCompleted: true,
        }));
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        onComplete();
      }
    }, 1000);
  }, [duration, timerState.isCompleted, onComplete]);

  // タイマー一時停止
  const pauseTimer = useCallback(() => {
    if (!timerState.isRunning || timerState.isPaused) return;

    setTimerState(prev => ({ ...prev, isRunning: false, isPaused: true }));
    pausedTimeRef.current = Date.now() - startTimeRef.current!;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    onPause();
  }, [timerState.isRunning, timerState.isPaused, onPause]);

  // タイマー再開
  const resumeTimer = useCallback(() => {
    if (!timerState.isPaused || timerState.isCompleted) return;

    startTimer();
    onResume();
  }, [timerState.isPaused, timerState.isCompleted, startTimer, onResume]);

  // タイマーリセット
  const resetTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setTimerState({
      timeRemaining: duration,
      isRunning: false,
      isPaused: false,
      isCompleted: false,
    });
    
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
  }, [duration]);

  // キーボードショートカット
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // スペースキーで一時停止/再開
      if (event.code === 'Space') {
        event.preventDefault();
        if (timerState.isRunning) {
          pauseTimer();
        } else if (timerState.isPaused) {
          resumeTimer();
        } else if (!timerState.isCompleted) {
          startTimer();
        }
      }
      
      // Escapeキーでリセット
      if (event.code === 'Escape') {
        event.preventDefault();
        resetTimer();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [timerState, startTimer, pauseTimer, resumeTimer, resetTimer]);

  // Page Visibility API - バックグラウンド実行対応
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && timerState.isRunning) {
        // バックグラウンドに移行時は正確な時間を記録
        pausedTimeRef.current = Date.now() - startTimeRef.current!;
      } else if (!document.hidden && timerState.isRunning) {
        // フォアグラウンドに復帰時は時間を再計算
        startTimeRef.current = Date.now() - pausedTimeRef.current;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [timerState.isRunning]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      {/* メインタイマー表示 */}
      <div className="relative mb-8">
        {/* 円形プログレスバー */}
        <svg
          width="280"
          height="280"
          className="transform -rotate-90"
          viewBox="0 0 280 280"
          role="img"
          aria-label={`瞑想タイマー: 残り${formatTime(timerState.timeRemaining)}`}
        >
          {/* 背景の円 */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-slate-200 dark:text-slate-700"
          />
          
          {/* プログレス円 */}
          <motion.circle
            cx="140"
            cy="140"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="text-blue-500 dark:text-blue-400 transition-colors duration-300"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </svg>

        {/* 中央の時間表示 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            className="text-6xl font-light text-slate-800 dark:text-slate-200 mb-2"
            key={timerState.timeRemaining}
            initial={{ scale: 1.1, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            role="timer"
            aria-live="polite"
            aria-atomic="true"
          >
            {formatTime(timerState.timeRemaining)}
          </motion.div>
          
          <div 
            className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider"
            role="status"
            aria-live="polite"
          >
            {timerState.isCompleted ? '完了' : 
             timerState.isPaused ? '一時停止中' : 
             timerState.isRunning ? '瞑想中' : '準備完了'}
          </div>
        </div>
      </div>

      {/* スクリプト情報 */}
      <div className="text-center mb-8 max-w-md">
        <h2 className="text-xl font-medium text-slate-800 dark:text-slate-200 mb-2">
          {script.title}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {script.description}
        </p>
      </div>

      {/* コントロールボタン */}
      <div className="flex items-center gap-4" role="group" aria-label="瞑想タイマーコントロール">
        <AnimatePresence mode="wait">
          {!timerState.isRunning && !timerState.isPaused && !timerState.isCompleted && (
            <motion.button
              key="start"
              onClick={startTimer}
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="瞑想タイマーを開始"
              aria-describedby="timer-controls-help"
              data-testid="start-timer-button"
            >
              開始
            </motion.button>
          )}

          {timerState.isRunning && (
            <motion.button
              key="pause"
              onClick={pauseTimer}
              className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="瞑想タイマーを一時停止"
              aria-describedby="timer-controls-help"
            >
              一時停止
            </motion.button>
          )}

          {timerState.isPaused && (
            <motion.button
              key="resume"
              onClick={resumeTimer}
              className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="瞑想タイマーを再開"
              aria-describedby="timer-controls-help"
            >
              再開
            </motion.button>
          )}

          {timerState.isCompleted && (
            <motion.button
              key="reset"
              onClick={resetTimer}
              className="px-8 py-3 bg-slate-500 hover:bg-slate-600 text-white rounded-full font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="瞑想タイマーをリセットしてもう一度開始"
              aria-describedby="timer-controls-help"
            >
              もう一度
            </motion.button>
          )}
        </AnimatePresence>

        {/* リセットボタン（常に表示） */}
        {(timerState.isRunning || timerState.isPaused) && (
          <motion.button
            onClick={resetTimer}
            className="px-6 py-3 bg-slate-300 hover:bg-slate-400 text-slate-700 rounded-full font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="瞑想タイマーをリセット"
          >
            リセット
          </motion.button>
        )}
      </div>

      {/* キーボードショートカットヒント */}
      <div 
        id="timer-controls-help" 
        className="mt-8 text-xs text-slate-400 dark:text-slate-500 text-center"
        role="region"
        aria-label="キーボードショートカット"
      >
        <p><kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-slate-700 dark:text-slate-300">スペース</kbd>: 開始/一時停止/再開</p>
        <p><kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-slate-700 dark:text-slate-300">Escape</kbd>: リセット</p>
      </div>
    </div>
  );
};
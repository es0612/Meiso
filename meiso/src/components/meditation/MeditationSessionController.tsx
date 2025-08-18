'use client';

import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MeditationScript, MeditationSession } from '@/types';
import { useMeditationSession } from '@/hooks/useMeditationSession';
import { MeditationLayout } from '@/components/layout/MeditationLayout';

interface MeditationSessionControllerProps {
  script: MeditationScript;
  volume: number;
  audioEnabled: boolean;
  onSessionComplete: (session: MeditationSession) => void;
  onExit: () => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
}

export const MeditationSessionController = ({
  script,
  volume,
  audioEnabled,
  onSessionComplete,
  onExit,
  onVolumeChange,
  onToggleMute,
}: MeditationSessionControllerProps) => {
  const {
    sessionState,
    timeRemaining,
    progress,
    audioController,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
  } = useMeditationSession({
    script,
    volume,
    audioEnabled,
    onSessionComplete,
    onVolumeChange,
    onToggleMute,
  });

  // 時間フォーマット（MM:SS）
  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // 円形プログレスバーの計算
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  // セッション終了処理
  const handleExit = useCallback(() => {
    if (sessionState.isActive) {
      stopSession();
    }
    onExit();
  }, [sessionState.isActive, stopSession, onExit]);



  return (
    <MeditationLayout
      isActive={true}
      onExit={handleExit}
      showExitButton={true}
    >
      <div className="flex flex-col items-center justify-center text-center space-y-8">
        {/* スクリプト情報 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-2"
        >
          <h1 className="text-2xl md:text-3xl font-light text-white/90">
            {script.title}
          </h1>
          <p className="text-white/60 text-sm md:text-base max-w-md">
            {script.description}
          </p>
        </motion.div>

        {/* メインタイマー表示 */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          {/* 円形プログレスバー */}
          <svg
            width="320"
            height="320"
            className="transform -rotate-90"
            viewBox="0 0 320 320"
          >
            {/* 背景の円 */}
            <circle
              cx="160"
              cy="160"
              r={radius}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="6"
              fill="none"
            />
            
            {/* プログレス円 */}
            <motion.circle
              cx="160"
              cy="160"
              r={radius}
              stroke="rgba(255, 255, 255, 0.8)"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </svg>

          {/* 中央の時間表示 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              className="text-5xl md:text-6xl font-light text-white mb-2"
              key={timeRemaining}
              initial={{ scale: 1.1, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {formatTime(timeRemaining)}
            </motion.div>
            
            <div className="text-sm text-white/60 uppercase tracking-wider">
              {sessionState.isCompleted ? '完了' : 
               sessionState.isPaused ? '一時停止中' : 
               sessionState.isActive ? '瞑想中' : '準備完了'}
            </div>

            {/* 進捗パーセンテージ */}
            <div className="text-xs text-white/40 mt-2">
              {Math.round(progress * 100)}%
            </div>
          </div>
        </motion.div>

        {/* 現在のインストラクション表示 */}
        <AnimatePresence mode="wait">
          {sessionState.currentInstruction && (
            <motion.div
              key={sessionState.currentInstruction}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="max-w-lg mx-auto"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-3 h-3 rounded-full ${
                    sessionState.currentInstructionType === 'breathing' ? 'bg-blue-400' :
                    sessionState.currentInstructionType === 'visualization' ? 'bg-purple-400' :
                    'bg-green-400'
                  }`} />
                  <span className="text-white/60 text-sm uppercase tracking-wide">
                    {sessionState.currentInstructionType === 'breathing' ? '呼吸ガイド' :
                     sessionState.currentInstructionType === 'visualization' ? 'イメージング' :
                     'ガイダンス'}
                  </span>
                </div>
                <p className="text-white/90 text-lg leading-relaxed">
                  {sessionState.currentInstruction}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* コントロールボタン */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex items-center gap-4"
        >
          <AnimatePresence mode="wait">
            {!sessionState.isActive && !sessionState.isPaused && !sessionState.isCompleted && (
              <motion.button
                key="start"
                onClick={startSession}
                className="px-8 py-4 bg-white/20 hover:bg-white/30 text-white rounded-full font-medium transition-all duration-200 backdrop-blur-sm border border-white/30 hover:border-white/50"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                瞑想を開始
              </motion.button>
            )}

            {sessionState.isActive && !sessionState.isPaused && (
              <motion.button
                key="pause"
                onClick={pauseSession}
                className="px-8 py-4 bg-amber-500/80 hover:bg-amber-500 text-white rounded-full font-medium transition-all duration-200 backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                一時停止
              </motion.button>
            )}

            {sessionState.isPaused && (
              <motion.button
                key="resume"
                onClick={resumeSession}
                className="px-8 py-4 bg-green-500/80 hover:bg-green-500 text-white rounded-full font-medium transition-all duration-200 backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                再開
              </motion.button>
            )}

            {sessionState.isCompleted && (
              <motion.button
                key="completed"
                onClick={handleExit}
                className="px-8 py-4 bg-blue-500/80 hover:bg-blue-500 text-white rounded-full font-medium transition-all duration-200 backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                完了
              </motion.button>
            )}
          </AnimatePresence>

          {/* 停止ボタン（セッション中のみ表示） */}
          {(sessionState.isActive || sessionState.isPaused) && (
            <motion.button
              onClick={handleExit}
              className="px-6 py-4 bg-red-500/20 hover:bg-red-500/40 text-white/80 hover:text-white rounded-full font-medium transition-all duration-200 backdrop-blur-sm border border-red-500/30"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              終了
            </motion.button>
          )}
        </motion.div>

        {/* 音声制御（音声が利用可能な場合） */}
        {script.audioUrl && audioController.isSupported && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex items-center space-x-4"
          >
            <button
              onClick={audioController.toggleMute}
              className="p-3 text-white/60 hover:text-white/90 transition-colors rounded-lg hover:bg-white/10"
              title={audioController.state.isMuted ? '音声をオン' : '音声をオフ'}
            >
              {audioController.state.isMuted ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>

            <div className="flex items-center space-x-2">
              <span className="text-white/60 text-sm">音量</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => audioController.changeVolume(parseFloat(e.target.value))}
                className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </motion.div>
        )}

        {/* エラー表示 */}
        {audioController.state.error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 max-w-md"
          >
            <p className="text-red-200 text-sm">
              音声エラー: {audioController.state.error}
            </p>
          </motion.div>
        )}
      </div>
    </MeditationLayout>
  );
};
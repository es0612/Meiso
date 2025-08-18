'use client';

import { ReactNode, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Wake Lock API types (simplified)
interface WakeLockSentinelLike {
  release(): Promise<void>;
}

interface MeditationLayoutProps {
  children: ReactNode;
  isActive: boolean;
  onExit?: () => void;
  showExitButton?: boolean;
}

export function MeditationLayout({ 
  children, 
  isActive, 
  onExit, 
  showExitButton = true 
}: MeditationLayoutProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // フルスクリーン制御
  const enterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch (error) {
      console.warn('フルスクリーンモードに入れませんでした:', error);
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.warn('フルスクリーンモードを終了できませんでした:', error);
    }
  };

  // フルスクリーン状態の監視
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Escapeキーでの終了
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isActive && onExit) {
        event.preventDefault();
        onExit();
      }
    };

    if (isActive) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isActive, onExit]);

  // 瞑想セッション中のスクリーンセーバー防止
  useEffect(() => {
    let wakeLock: WakeLockSentinelLike | null = null;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && isActive) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch (error) {
        console.warn('Wake Lock APIが利用できません:', error);
      }
    };

    const releaseWakeLock = () => {
      if (wakeLock) {
        wakeLock.release();
        wakeLock = null;
      }
    };

    if (isActive) {
      requestWakeLock();
    }

    return () => {
      releaseWakeLock();
    };
  }, [isActive]);

  if (!isActive) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden"
      >
        {/* 背景アニメーション */}
        <div className="absolute inset-0">
          {/* 呼吸に合わせた背景パルス */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20"
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* 微細な星のような点 */}
          <div className="absolute inset-0">
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/20 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0.2, 0.8, 0.2],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 3 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="relative z-10 h-full flex flex-col">
          {/* ヘッダー（最小限） */}
          <div className="flex justify-between items-center p-4 md:p-6">
            {/* フルスクリーンボタン */}
            <motion.button
              onClick={isFullscreen ? exitFullscreen : enterFullscreen}
              className="p-2 text-white/60 hover:text-white/90 transition-colors rounded-lg hover:bg-white/10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={isFullscreen ? 'フルスクリーン終了' : 'フルスクリーン'}
            >
              {isFullscreen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
            </motion.button>

            {/* 終了ボタン */}
            {showExitButton && onExit && (
              <motion.button
                onClick={onExit}
                className="p-2 text-white/60 hover:text-white/90 transition-colors rounded-lg hover:bg-white/10"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="瞑想を終了 (Esc)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            )}
          </div>

          {/* メインコンテンツエリア */}
          <div className="flex-1 flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-full max-w-4xl"
            >
              {children}
            </motion.div>
          </div>

          {/* フッター（キーボードヒント） */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="p-4 md:p-6 text-center"
          >
            <p className="text-white/40 text-sm">
              Escキー: 終了 | スペースキー: 一時停止/再開
            </p>
          </motion.div>
        </div>

        {/* 環境音効果（視覚的表現） */}
        <div className="absolute inset-0 pointer-events-none">
          {/* 呼吸リズムの視覚化 */}
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-white/10 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-white/5 rounded-full"
            animate={{
              scale: [1.1, 1.3, 1.1],
              opacity: [0.05, 0.2, 0.05],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
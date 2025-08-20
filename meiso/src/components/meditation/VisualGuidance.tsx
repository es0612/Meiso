'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MeditationInstruction, MeditationScript } from '@/types';

interface VisualGuidanceProps {
  script: MeditationScript;
  currentTime: number; // 現在の経過時間（秒）
  isActive: boolean;
  className?: string;
}

interface GuidanceState {
  currentInstruction: MeditationInstruction | null;
  nextInstruction: MeditationInstruction | null;
  progress: number; // 現在の指示の進捗（0-1）
}

export function VisualGuidance({ 
  script, 
  currentTime, 
  isActive, 
  className = '' 
}: VisualGuidanceProps) {
  const [guidanceState, setGuidanceState] = useState<GuidanceState>({
    currentInstruction: null,
    nextInstruction: null,
    progress: 0,
  });

  // 現在時刻に基づいて適切な指示を取得
  useEffect(() => {
    if (!isActive || !script.instructions.length) {
      setGuidanceState({
        currentInstruction: null,
        nextInstruction: null,
        progress: 0,
      });
      return;
    }

    // 時系列順にソートされた指示を取得
    const sortedInstructions = [...script.instructions].sort((a, b) => a.timestamp - b.timestamp);
    
    // 現在時刻に該当する指示を見つける
    let currentInstruction: MeditationInstruction | null = null;
    let nextInstruction: MeditationInstruction | null = null;
    
    for (let i = 0; i < sortedInstructions.length; i++) {
      const instruction = sortedInstructions[i];
      
      if (currentTime >= instruction.timestamp) {
        currentInstruction = instruction;
        nextInstruction = sortedInstructions[i + 1] || null;
      } else {
        if (!currentInstruction) {
          nextInstruction = instruction;
        }
        break;
      }
    }

    // 進捗計算
    let progress = 0;
    if (currentInstruction && nextInstruction) {
      const duration = nextInstruction.timestamp - currentInstruction.timestamp;
      const elapsed = currentTime - currentInstruction.timestamp;
      progress = Math.min(elapsed / duration, 1);
    } else if (currentInstruction && !nextInstruction) {
      // 最後の指示の場合
      const elapsed = currentTime - currentInstruction.timestamp;
      const remainingTime = script.duration - currentInstruction.timestamp;
      progress = Math.min(elapsed / remainingTime, 1);
    }

    setGuidanceState({
      currentInstruction,
      nextInstruction,
      progress,
    });
  }, [currentTime, isActive, script]);

  if (!isActive) return null;

  const getInstructionIcon = (type: MeditationInstruction['type']) => {
    const iconClass = "w-8 h-8 text-blue-500 dark:text-blue-400";
    
    switch (type) {
      case 'breathing':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'visualization':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        );
      default:
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getBreathingAnimation = () => {
    if (!guidanceState.currentInstruction || guidanceState.currentInstruction.type !== 'breathing') {
      return null;
    }

    return (
      <motion.div
        className="w-32 h-32 rounded-full border-4 border-blue-300 dark:border-blue-600 mx-auto mb-6"
        animate={{
          scale: [1, 1.3, 1],
          borderColor: [
            'rgb(147 197 253)', // blue-300
            'rgb(59 130 246)',  // blue-500
            'rgb(147 197 253)'  // blue-300
          ]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        aria-label="呼吸のリズムガイド"
      />
    );
  };

  return (
    <div className={`text-center ${className}`} role="region" aria-label="視覚的瞑想ガイダンス">
      <AnimatePresence mode="wait">
        {guidanceState.currentInstruction && (
          <motion.div
            key={guidanceState.currentInstruction.timestamp}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* 呼吸アニメーション */}
            {getBreathingAnimation()}

            {/* 指示アイコン */}
            <div className="flex justify-center mb-4">
              {getInstructionIcon(guidanceState.currentInstruction.type)}
            </div>

            {/* 現在の指示テキスト */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {guidanceState.currentInstruction.text}
              </h3>

              {/* 進捗バー */}
              <div className="w-full max-w-xs mx-auto">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${guidanceState.progress * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* 次の指示のプレビュー */}
              {guidanceState.nextInstruction && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  className="text-sm text-gray-600 dark:text-gray-400"
                >
                  次: {guidanceState.nextInstruction.text}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* 指示がない場合のデフォルト表示 */}
        {!guidanceState.currentInstruction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 mx-auto flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {script.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                リラックスして、自然な呼吸に意識を向けましょう
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 音声オフの説明 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
      >
        <div className="flex items-center justify-center gap-2 text-sm text-blue-800 dark:text-blue-200">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          音声ガイダンスがオフになっています。視覚的な指示に従って瞑想を行ってください。
        </div>
      </motion.div>
    </div>
  );
}

/**
 * 簡易版の視覚ガイダンス（設定プレビュー用）
 */
interface VisualGuidancePreviewProps {
  enabled: boolean;
  className?: string;
}

export function VisualGuidancePreview({ enabled, className = '' }: VisualGuidancePreviewProps) {
  if (!enabled) return null;

  return (
    <div className={`text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg ${className}`}>
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 mx-auto mb-3 flex items-center justify-center">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        視覚的ガイダンスが表示されます
      </p>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { MeditationTimer } from './MeditationTimer';
import { MeditationScript } from '@/types';

// サンプル瞑想スクリプト
const sampleScript: MeditationScript = {
  id: 'sample-breathing',
  title: '基本の呼吸瞑想',
  description: '深い呼吸に集中して心を落ち着かせる1分間の瞑想です',
  category: 'breathing',
  duration: 60,
  instructions: [
    { timestamp: 0, text: '楽な姿勢で座り、目を閉じてください', type: 'guidance' },
    { timestamp: 10, text: 'ゆっくりと鼻から息を吸い込みます', type: 'breathing' },
    { timestamp: 20, text: '口からゆっくりと息を吐き出します', type: 'breathing' },
    { timestamp: 30, text: '呼吸のリズムに意識を向けてください', type: 'guidance' },
    { timestamp: 45, text: '心が落ち着いていくのを感じてください', type: 'guidance' },
  ],
  tags: ['初心者向け', '呼吸法', 'リラックス'],
  difficulty: 'beginner',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const MeditationTimerExample = () => {
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  const handleComplete = () => {
    console.log('瞑想セッションが完了しました！');
    setSessionCompleted(true);
    setSessionCount(prev => prev + 1);
    
    // ここで実際のアプリでは以下のような処理を行います：
    // - セッション記録をデータベースに保存
    // - ユーザー統計の更新
    // - 完了音の再生
    // - 次のセッションの提案
  };

  const handlePause = () => {
    console.log('瞑想セッションが一時停止されました');
    
    // ここで実際のアプリでは以下のような処理を行います：
    // - 音声ガイダンスの一時停止
    // - セッション状態の保存
  };

  const handleResume = () => {
    console.log('瞑想セッションが再開されました');
    
    // ここで実際のアプリでは以下のような処理を行います：
    // - 音声ガイダンスの再開
    // - セッション状態の復元
  };

  const resetExample = () => {
    setSessionCompleted(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* ヘッダー */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            瞑想タイマー デモ
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            1分間の瞑想セッションを体験してください
          </p>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4">
            セッション統計
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {sessionCount}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                完了セッション数
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {sessionCount > 0 ? Math.floor(sessionCount * 60 / 60) : 0}分
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                総瞑想時間
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {sessionCompleted ? '完了' : '進行中'}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                現在の状態
              </div>
            </div>
          </div>
        </div>

        {/* 完了メッセージ */}
        {sessionCompleted && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                  瞑想セッション完了！
                </h3>
                <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                  <p>お疲れさまでした。1分間の瞑想を完了しました。</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={resetExample}
                    className="bg-green-100 hover:bg-green-200 dark:bg-green-800 dark:hover:bg-green-700 text-green-800 dark:text-green-200 px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    新しいセッションを開始
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* メインタイマー */}
      <MeditationTimer
        duration={60} // 1分間
        script={sampleScript}
        onComplete={handleComplete}
        onPause={handlePause}
        onResume={handleResume}
      />

      {/* 使用方法の説明 */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4">
            使用方法
          </h2>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                1
              </span>
              <p>「開始」ボタンをクリックするか、スペースキーを押して瞑想を開始します</p>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                2
              </span>
              <p>円形プログレスバーで残り時間を確認しながら瞑想に集中します</p>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                3
              </span>
              <p>必要に応じてスペースキーで一時停止・再開ができます</p>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                4
              </span>
              <p>Escapeキーでいつでもタイマーをリセットできます</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
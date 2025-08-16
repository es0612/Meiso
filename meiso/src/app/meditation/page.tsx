'use client';

import { useState } from 'react';
import { ScriptSelector } from '@/components/meditation';
import { useMeditationScripts } from '@/hooks/useMeditationScripts';
import { MeditationScript } from '@/types';

export default function MeditationPage() {
  const {
    scripts,
    selectedScript,
    selectedScriptData,
    setSelectedScript,
    isLoading,
    error,
  } = useMeditationScripts();

  const [showScriptSelector, setShowScriptSelector] = useState(true);

  const handleScriptChange = (scriptId: string) => {
    setSelectedScript(scriptId);
  };

  const handlePreview = (script: MeditationScript) => {
    // プレビュー機能は ScriptSelector コンポーネント内で処理
    console.log('Previewing script:', script.title);
  };

  const handleStartMeditation = () => {
    if (selectedScriptData) {
      setShowScriptSelector(false);
      // TODO: 瞑想タイマーコンポーネントを表示する（次のタスクで実装）
      console.log('Starting meditation with script:', selectedScriptData.title);
    }
  };

  const handleBackToSelection = () => {
    setShowScriptSelector(true);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-300">
            瞑想スクリプトを読み込んでいます...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-md mx-auto text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            エラーが発生しました
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {showScriptSelector ? (
          <div className="space-y-8">
            {/* ヘッダー */}
            <div className="text-center space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                瞑想スクリプトを選択
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                あなたの今の気分や目的に合わせて、最適な瞑想スクリプトを選んでください。
              </p>
            </div>

            {/* 現在選択されているスクリプト */}
            {selectedScriptData && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                      選択中: {selectedScriptData.title}
                    </h3>
                    <p className="text-blue-700 dark:text-blue-300">
                      {selectedScriptData.description}
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      時間: {Math.floor(selectedScriptData.duration / 60)}分
                      {selectedScriptData.duration % 60 > 0 ? `${selectedScriptData.duration % 60}秒` : ''}
                    </p>
                  </div>
                  <button
                    onClick={handleStartMeditation}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-lg hover:shadow-xl"
                  >
                    瞑想を開始
                  </button>
                </div>
              </div>
            )}

            {/* スクリプト選択コンポーネント */}
            <ScriptSelector
              scripts={scripts}
              selectedScript={selectedScript}
              onScriptChange={handleScriptChange}
              onPreview={handlePreview}
              showPreview={true}
            />
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                瞑想セッション
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {selectedScriptData?.title} - {Math.floor((selectedScriptData?.duration || 0) / 60)}分間の瞑想
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700 max-w-2xl mx-auto">
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                瞑想タイマーコンポーネントがここに表示されます
                <br />
                （次のタスクで実装予定）
              </p>
              
              <div className="space-y-4">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors">
                  瞑想を開始
                </button>
                
                <button
                  onClick={handleBackToSelection}
                  className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium py-3 px-8 rounded-lg transition-colors"
                >
                  スクリプトを変更
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
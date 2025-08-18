'use client';

import { useState, useEffect } from 'react';
import { ScriptSelector, MeditationSessionController } from '@/components/meditation';
import { AnonymousUserPrompt } from '@/components/auth';
import { useMeditationScripts } from '@/hooks/useMeditationScripts';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuthContext } from '@/contexts/AuthContext';
import { addMeditationSession, calculateStatistics } from '@/utils/localStorage';
import { MeditationScript, MeditationSession } from '@/types';

export default function MeditationPage() {
  const {
    scripts,
    selectedScript,
    selectedScriptData,
    setSelectedScript,
    isLoading,
    error,
  } = useMeditationScripts();

  const { user, isAnonymous } = useAuthContext();
  const { profile, updateStatistics } = useUserProfile();

  const [showScriptSelector, setShowScriptSelector] = useState(true);
  const [volume, setVolume] = useState(0.7);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [sessionCount, setSessionCount] = useState(0);

  // Load user preferences and session count
  useEffect(() => {
    if (profile) {
      setVolume(profile.preferences.volume);
      setAudioEnabled(profile.preferences.audioEnabled);
      setSessionCount(profile.statistics.totalSessions);
    }
  }, [profile]);

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
    }
  };

  const handleBackToSelection = () => {
    setShowScriptSelector(true);
  };

  const handleSessionComplete = async (session: MeditationSession) => {
    console.log('瞑想セッション完了:', session);
    
    try {
      // Save session to local storage
      addMeditationSession(session);
      
      // Update session count for anonymous user prompt
      setSessionCount(prev => prev + 1);
      
      // Update user statistics if authenticated
      if (user && !isAnonymous && profile) {
        const newStats = calculateStatistics();
        await updateStatistics(newStats);
      }
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
  };

  const handleToggleMute = () => {
    setAudioEnabled(!audioEnabled);
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
    <>
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
          ) : selectedScriptData ? (
            <MeditationSessionController
              script={selectedScriptData}
              volume={volume}
              audioEnabled={audioEnabled}
              onSessionComplete={handleSessionComplete}
              onExit={handleBackToSelection}
              onVolumeChange={handleVolumeChange}
              onToggleMute={handleToggleMute}
            />
          ) : null}
        </div>
      </div>

      {/* Anonymous User Prompt */}
      <AnonymousUserPrompt sessionCount={sessionCount} />
    </>
  );
}
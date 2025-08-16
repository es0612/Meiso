'use client';

import { useState, useEffect, useMemo } from 'react';
import { MeditationScript } from '@/types';
import { INITIAL_MEDITATION_SCRIPTS, DEFAULT_SCRIPT_ID } from '@/constants/meditation';

interface UseMeditationScriptsReturn {
  scripts: MeditationScript[];
  selectedScript: string;
  selectedScriptData: MeditationScript | null;
  setSelectedScript: (scriptId: string) => void;
  getScriptById: (scriptId: string) => MeditationScript | undefined;
  isLoading: boolean;
  error: string | null;
}

export function useMeditationScripts(): UseMeditationScriptsReturn {
  const [scripts, setScripts] = useState<MeditationScript[]>([]);
  const [selectedScript, setSelectedScriptState] = useState<string>(DEFAULT_SCRIPT_ID);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // スクリプトデータの初期化
  useEffect(() => {
    const initializeScripts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 将来的にはAPIから取得する予定だが、現在は定数データを使用
        // TODO: Supabaseからスクリプトデータを取得する実装を追加
        setScripts(INITIAL_MEDITATION_SCRIPTS);

        // ローカルストレージから前回選択したスクリプトを復元
        const savedScriptId = localStorage.getItem('selectedMeditationScript');
        if (savedScriptId && INITIAL_MEDITATION_SCRIPTS.some(script => script.id === savedScriptId)) {
          setSelectedScriptState(savedScriptId);
        } else {
          // デフォルトスクリプトが存在しない場合は最初のスクリプトを選択
          const defaultScript = INITIAL_MEDITATION_SCRIPTS.find(script => script.id === DEFAULT_SCRIPT_ID);
          if (defaultScript) {
            setSelectedScriptState(DEFAULT_SCRIPT_ID);
          } else if (INITIAL_MEDITATION_SCRIPTS.length > 0) {
            setSelectedScriptState(INITIAL_MEDITATION_SCRIPTS[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to initialize meditation scripts:', err);
        setError('瞑想スクリプトの読み込みに失敗しました。');
      } finally {
        setIsLoading(false);
      }
    };

    initializeScripts();
  }, []);

  // 選択されたスクリプトのデータを取得
  const selectedScriptData = useMemo(() => {
    return scripts.find(script => script.id === selectedScript) || null;
  }, [scripts, selectedScript]);

  // スクリプト選択の変更処理
  const setSelectedScript = (scriptId: string) => {
    const script = scripts.find(s => s.id === scriptId);
    if (script) {
      setSelectedScriptState(scriptId);
      // ローカルストレージに保存
      localStorage.setItem('selectedMeditationScript', scriptId);
    } else {
      console.warn(`Script with id "${scriptId}" not found`);
    }
  };

  // IDでスクリプトを取得するヘルパー関数
  const getScriptById = (scriptId: string): MeditationScript | undefined => {
    return scripts.find(script => script.id === scriptId);
  };

  return {
    scripts,
    selectedScript,
    selectedScriptData,
    setSelectedScript,
    getScriptById,
    isLoading,
    error,
  };
}
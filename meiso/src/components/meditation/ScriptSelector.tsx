'use client';

import { useState, useMemo } from 'react';
import { MeditationScript, ScriptSelectorProps } from '@/types';
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from '@/constants/meditation';

interface ScriptSelectorComponentProps extends ScriptSelectorProps {
  onPreview?: (script: MeditationScript) => void;
  showPreview?: boolean;
}

export default function ScriptSelector({
  scripts,
  selectedScript,
  onScriptChange,
  onPreview,
  showPreview = true,
}: ScriptSelectorComponentProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewScript, setPreviewScript] = useState<MeditationScript | null>(null);

  // カテゴリーでフィルタリングされたスクリプト
  const filteredScripts = useMemo(() => {
    if (selectedCategory === 'all') {
      return scripts;
    }
    return scripts.filter((script) => script.category === selectedCategory);
  }, [scripts, selectedCategory]);

  // 利用可能なカテゴリー一覧
  const availableCategories = useMemo(() => {
    const categories = Array.from(new Set(scripts.map((script) => script.category)));
    return categories.sort();
  }, [scripts]);

  const handleScriptSelect = (scriptId: string) => {
    onScriptChange(scriptId);
    setPreviewScript(null);
  };

  const handlePreview = (script: MeditationScript) => {
    setPreviewScript(script);
    onPreview?.(script);
  };

  const closePreview = () => {
    setPreviewScript(null);
  };

  const getDifficultyColor = (difficulty: MeditationScript['difficulty']) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'advanced':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  const getCategoryColor = (category: MeditationScript['category']) => {
    switch (category) {
      case 'breathing':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      case 'mindfulness':
        return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30';
      case 'focus':
        return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30';
      case 'relaxation':
        return 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* カテゴリーフィルター */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          カテゴリー
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            すべて
          </button>
          {availableCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
            </button>
          ))}
        </div>
      </div>

      {/* スクリプト一覧 */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          瞑想スクリプト ({filteredScripts.length}件)
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredScripts.map((script) => (
            <div
              key={script.id}
              className={`relative p-6 rounded-lg border-2 transition-all cursor-pointer hover:shadow-lg ${
                selectedScript === script.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                  : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600'
              }`}
              onClick={() => handleScriptSelect(script.id)}
            >
              {/* 選択インジケーター */}
              {selectedScript === script.id && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {/* タイトルと時間 */}
                <div className="space-y-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {script.title}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {Math.floor(script.duration / 60)}分{script.duration % 60 > 0 ? `${script.duration % 60}秒` : ''}
                  </p>
                </div>

                {/* 説明 */}
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                  {script.description}
                </p>

                {/* タグ */}
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(script.category)}`}>
                    {CATEGORY_LABELS[script.category]}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(script.difficulty)}`}>
                    {DIFFICULTY_LABELS[script.difficulty]}
                  </span>
                </div>

                {/* タグ一覧 */}
                {script.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {script.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded dark:bg-gray-700 dark:text-gray-300"
                      >
                        #{tag}
                      </span>
                    ))}
                    {script.tags.length > 3 && (
                      <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                        +{script.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* アクションボタン */}
                {showPreview && (
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(script);
                      }}
                      className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-900/50"
                    >
                      プレビュー
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 結果が見つからない場合 */}
        {filteredScripts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              スクリプトが見つかりません
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              選択したカテゴリーにはスクリプトがありません。他のカテゴリーをお試しください。
            </p>
          </div>
        )}
      </div>

      {/* プレビューモーダル */}
      {previewScript && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              {/* ヘッダー */}
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {previewScript.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {Math.floor(previewScript.duration / 60)}分{previewScript.duration % 60 > 0 ? `${previewScript.duration % 60}秒` : ''}
                  </p>
                </div>
                <button
                  onClick={closePreview}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 説明 */}
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {previewScript.description}
              </p>

              {/* メタ情報 */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(previewScript.category)}`}>
                  {CATEGORY_LABELS[previewScript.category]}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(previewScript.difficulty)}`}>
                  {DIFFICULTY_LABELS[previewScript.difficulty]}
                </span>
              </div>

              {/* 指示内容 */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  瞑想の流れ
                </h4>
                <div className="space-y-3">
                  {previewScript.instructions.map((instruction, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0 w-12 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-md flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                          {Math.floor(instruction.timestamp / 60)}:{(instruction.timestamp % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {instruction.text}
                        </p>
                        <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${
                          instruction.type === 'guidance' 
                            ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                            : instruction.type === 'breathing'
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                        }`}>
                          {instruction.type === 'guidance' ? 'ガイダンス' : 
                           instruction.type === 'breathing' ? '呼吸法' : 'イメージング'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* アクションボタン */}
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    handleScriptSelect(previewScript.id);
                    closePreview();
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  このスクリプトを選択
                </button>
                <button
                  onClick={closePreview}
                  className="px-6 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
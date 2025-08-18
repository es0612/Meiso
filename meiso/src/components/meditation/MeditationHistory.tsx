'use client';

import { useState, useMemo } from 'react';
import { MeditationSession } from '@/types';
import { useMeditationHistory, MeditationHistoryFilters } from '@/hooks/useMeditationHistory';
import { formatSessionDuration, formatSessionTime } from '@/utils/session';
import { INITIAL_MEDITATION_SCRIPTS } from '@/constants/meditation';

interface MeditationHistoryProps {
  onSessionClick?: (session: MeditationSession) => void;
}

export function MeditationHistory({ onSessionClick }: MeditationHistoryProps) {
  const { sessions, stats, loading, error, fetchSessions } = useMeditationHistory();
  const [filters, setFilters] = useState<MeditationHistoryFilters>({});
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // フィルタリングされたセッション
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      if (filters.scriptId && session.scriptId !== filters.scriptId) {
        return false;
      }
      if (filters.completed !== undefined && session.completed !== filters.completed) {
        return false;
      }
      if (filters.dateRange) {
        const sessionDate = session.startTime;
        if (sessionDate < filters.dateRange.start || sessionDate > filters.dateRange.end) {
          return false;
        }
      }
      return true;
    });
  }, [sessions, filters]);

  // 日付範囲フィルターを設定
  const setDateRangeFilter = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const newFilters = {
      ...filters,
      dateRange: { start, end }
    };
    
    setFilters(newFilters);
    fetchSessions(newFilters);
  };

  // フィルターをクリア
  const clearFilters = () => {
    setFilters({});
  };

  // セッションクリックハンドラー
  const handleSessionClick = (session: MeditationSession) => {
    onSessionClick?.(session);
  };

  // スクリプト名を取得
  const getScriptName = (scriptId: string) => {
    const script = INITIAL_MEDITATION_SCRIPTS.find(s => s.id === scriptId);
    return script?.title || scriptId;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" data-testid="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-700 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            総セッション数
          </h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.totalSessions}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            連続日数
          </h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.currentStreak}日
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            総時間
          </h3>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {formatSessionDuration(stats.totalDuration)}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            完了率
          </h3>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {Math.round(stats.completionRate * 100)}%
          </p>
        </div>
      </div>

      {/* フィルターとビューモード */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setDateRangeFilter(7)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                filters.dateRange ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              過去7日
            </button>
            <button
              onClick={() => setDateRangeFilter(30)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                filters.dateRange ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              過去30日
            </button>
            <select
              value={filters.scriptId || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, scriptId: e.target.value || undefined }))}
              className="px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <option value="">全てのスクリプト</option>
              {INITIAL_MEDITATION_SCRIPTS.map(script => (
                <option key={script.id} value={script.id}>
                  {script.title}
                </option>
              ))}
            </select>
            <select
              value={filters.completed === undefined ? '' : filters.completed.toString()}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                completed: e.target.value === '' ? undefined : e.target.value === 'true'
              }))}
              className="px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <option value="">全ての状態</option>
              <option value="true">完了済み</option>
              <option value="false">未完了</option>
            </select>
            {(filters.dateRange || filters.scriptId || filters.completed !== undefined) && (
              <button
                onClick={clearFilters}
                className="px-3 py-1 text-sm rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                フィルタークリア
              </button>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              リスト
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              カレンダー
            </button>
          </div>
        </div>
      </div>

      {/* セッション一覧 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            瞑想セッション履歴 ({filteredSessions.length}件)
          </h2>
          
          {filteredSessions.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              {sessions.length === 0 
                ? 'まだ瞑想セッションがありません。最初の瞑想を始めてみましょう！'
                : 'フィルター条件に一致するセッションがありません。'
              }
            </p>
          ) : (
            <div className="space-y-3">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleSessionClick(session)}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      session.completed 
                        ? 'bg-green-500' 
                        : 'bg-yellow-500'
                    }`} />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {getScriptName(session.scriptId)}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatSessionTime(session.startTime)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatSessionDuration(session.duration)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {session.completed ? '完了' : '未完了'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
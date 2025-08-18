'use client';

import { useState, useMemo } from 'react';
import { MeditationSession } from '@/types';
import { formatSessionDuration } from '@/utils/session';
import { useMeditationHistory } from '@/hooks/useMeditationHistory';

interface MeditationCalendarProps {
  sessions?: MeditationSession[];
  onDateClick?: (date: Date, sessions: MeditationSession[]) => void;
}

export function MeditationCalendar({ sessions: propSessions, onDateClick }: MeditationCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { sessions: hookSessions, loading } = useMeditationHistory();
  
  // Use prop sessions if provided, otherwise use hook sessions
  const sessions = propSessions || hookSessions;

  // 現在の月の日付を生成
  const monthDates = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // 週の始まりを日曜日に
    
    const dates: Date[] = [];
    const current = new Date(startDate);
    
    // 6週間分の日付を生成（42日）
    for (let i = 0; i < 42; i++) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  }, [currentDate]);

  // 日付ごとのセッションをグループ化
  const sessionsByDate = useMemo(() => {
    const grouped = new Map<string, MeditationSession[]>();
    
    sessions.forEach(session => {
      const dateKey = session.startTime.toDateString();
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(session);
    });
    
    return grouped;
  }, [sessions]);

  // 前の月に移動
  const goToPreviousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  // 次の月に移動
  const goToNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  // 今月に戻る
  const goToCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  // 日付クリックハンドラー
  const handleDateClick = (date: Date) => {
    const dateKey = date.toDateString();
    const dateSessions = sessionsByDate.get(dateKey) || [];
    onDateClick?.(date, dateSessions);
  };

  // 日付のスタイルを取得
  const getDateStyle = (date: Date) => {
    const dateKey = date.toDateString();
    const dateSessions = sessionsByDate.get(dateKey) || [];
    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
    const isToday = date.toDateString() === new Date().toDateString();
    const hasCompletedSession = dateSessions.some(s => s.completed);
    const hasIncompleteSession = dateSessions.some(s => !s.completed);

    let baseClasses = 'w-full h-12 flex flex-col items-center justify-center text-sm cursor-pointer transition-colors rounded-lg';
    
    if (!isCurrentMonth) {
      baseClasses += ' text-gray-300 dark:text-gray-600';
    } else if (isToday) {
      baseClasses += ' bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold';
    } else {
      baseClasses += ' text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700';
    }

    if (hasCompletedSession) {
      baseClasses += ' ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20';
    } else if (hasIncompleteSession) {
      baseClasses += ' ring-2 ring-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
    }

    return baseClasses;
  };

  // セッション数を取得
  const getSessionCount = (date: Date) => {
    const dateKey = date.toDateString();
    const dateSessions = sessionsByDate.get(dateKey) || [];
    return dateSessions.length;
  };

  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];

  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="前の月"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToCurrentMonth}
            className="px-3 py-1 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            今月
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="次の月"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-gray-500 dark:text-gray-400">
            {day}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7 gap-1">
        {monthDates.map((date, index) => {
          const sessionCount = getSessionCount(date);
          return (
            <div
              key={index}
              onClick={() => handleDateClick(date)}
              className={getDateStyle(date)}
            >
              <span>{date.getDate()}</span>
              {sessionCount > 0 && (
                <div className="w-1 h-1 bg-current rounded-full mt-0.5" />
              )}
            </div>
          );
        })}
      </div>

      {/* 凡例 */}
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded border-2 border-green-500 bg-green-50 dark:bg-green-900/20" />
          <span className="text-gray-600 dark:text-gray-400">完了済みセッション</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded border-2 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20" />
          <span className="text-gray-600 dark:text-gray-400">未完了セッション</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded bg-blue-100 dark:bg-blue-900" />
          <span className="text-gray-600 dark:text-gray-400">今日</span>
        </div>
      </div>
    </div>
  );
}
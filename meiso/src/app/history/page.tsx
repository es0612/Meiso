'use client';

import { useState } from 'react';
import { MeditationSession } from '@/types';
import { MeditationHistory, MeditationCalendar, SessionDetailModal } from '@/components/meditation';
import { useMeditationHistory } from '@/hooks/useMeditationHistory';

export default function HistoryPage() {
  const [selectedSession, setSelectedSession] = useState<MeditationSession | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const { updateSession, deleteSession } = useMeditationHistory();

  const handleSessionClick = (session: MeditationSession) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSession(null);
  };

  const handleDateClick = (date: Date, sessions: MeditationSession[]) => {
    if (sessions.length === 1) {
      handleSessionClick(sessions[0]);
    } else if (sessions.length > 1) {
      // 複数セッションがある場合は最新のものを表示
      const latestSession = sessions.sort((a, b) => 
        b.startTime.getTime() - a.startTime.getTime()
      )[0];
      handleSessionClick(latestSession);
    }
  };

  return (
    <div className="flex-1 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            瞑想履歴
          </h1>
          
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              リスト表示
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                viewMode === 'calendar' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              カレンダー表示
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {viewMode === 'list' ? '詳細データ' : 'カレンダービュー'}
          </h2>
          
          {viewMode === 'list' ? (
            <MeditationHistory onSessionClick={handleSessionClick} />
          ) : (
            <MeditationCalendar 
              onDateClick={handleDateClick}
            />
          )}
        </div>

        <SessionDetailModal
          session={selectedSession}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onUpdate={updateSession}
          onDelete={deleteSession}
        />
      </div>
    </div>
  );
}
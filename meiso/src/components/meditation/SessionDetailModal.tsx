'use client';

import { useState } from 'react';
import { MeditationSession } from '@/types';
import { formatSessionDuration, formatSessionTime } from '@/utils/session';
import { INITIAL_MEDITATION_SCRIPTS } from '@/constants/meditation';

interface SessionDetailModalProps {
  session: MeditationSession | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (sessionId: string, updates: Partial<MeditationSession>) => Promise<void>;
  onDelete?: (sessionId: string) => Promise<void>;
}

export function SessionDetailModal({ 
  session, 
  isOpen, 
  onClose, 
  onUpdate, 
  onDelete 
}: SessionDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [rating, setRating] = useState(session?.rating || 0);
  const [notes, setNotes] = useState(session?.notes || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !session) return null;

  const script = INITIAL_MEDITATION_SCRIPTS?.find(s => s.id === session.scriptId);

  const handleUpdate = async () => {
    if (!onUpdate) return;

    try {
      setIsUpdating(true);
      await onUpdate(session.id, {
        rating: rating || undefined,
        notes: notes.trim() || undefined
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update session:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || !confirm('このセッションを削除しますか？')) return;

    try {
      setIsDeleting(true);
      await onDelete(session.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete session:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setRating(session.rating || 0);
    setNotes(session.notes || '');
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            セッション詳細
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="閉じる"
          >
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6 space-y-6">
          {/* 基本情報 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              基本情報
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">スクリプト:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {script?.title || session.scriptId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">開始時刻:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatSessionTime(session.startTime)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">継続時間:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatSessionDuration(session.duration)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">状態:</span>
                <span className={`font-medium ${
                  session.completed 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-yellow-600 dark:text-yellow-400'
                }`}>
                  {session.completed ? '完了' : '未完了'}
                </span>
              </div>
            </div>
          </div>

          {/* 評価 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              評価
            </h3>
            {isEditing ? (
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`w-8 h-8 ${
                      star <= rating 
                        ? 'text-yellow-400' 
                        : 'text-gray-300 dark:text-gray-600'
                    } hover:text-yellow-400 transition-colors`}
                  >
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
                <button
                  onClick={() => setRating(0)}
                  className="ml-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  クリア
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                {session.rating ? (
                  <>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-5 h-5 ${
                          star <= session.rating! 
                            ? 'text-yellow-400' 
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                      ({session.rating}/5)
                    </span>
                  </>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">未評価</span>
                )}
              </div>
            )}
          </div>

          {/* メモ */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              メモ
            </h3>
            {isEditing ? (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="セッションについてのメモを入力..."
                className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            ) : (
              <div className="min-h-[60px] p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {session.notes ? (
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                    {session.notes}
                  </p>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    メモはありません
                  </p>
                )}
              </div>
            )}
          </div>

          {/* デバイス情報 */}
          {session.deviceInfo && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                デバイス情報
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">画面サイズ:</span>
                  <span className="text-gray-900 dark:text-white">
                    {session.deviceInfo.screenSize}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          {isEditing ? (
            <div className="flex space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUpdating ? '保存中...' : '保存'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
            >
              編集
            </button>
          )}

          {onDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isDeleting ? '削除中...' : '削除'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
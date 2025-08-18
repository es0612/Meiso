import { useState, useEffect, useCallback } from 'react';
import { MeditationSession } from '@/types';
import { DatabaseService } from '@/lib/database';
import { 
  getMeditationSessions, 
  addMeditationSession, 
  calculateStatistics,
  calculateStreak,
  getMeditationSessionsByDateRange,
  updateMeditationSession as updateLocalSession,
  deleteMeditationSession as deleteLocalSession
} from '@/utils/localStorage';
import { useAuth } from './useAuth';

export interface MeditationHistoryStats {
  totalSessions: number;
  totalDuration: number;
  currentStreak: number;
  longestStreak: number;
  favoriteScripts: string[];
  completionRate: number;
}

export interface MeditationHistoryFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  scriptId?: string;
  completed?: boolean;
  limit?: number;
  offset?: number;
}

export function useMeditationHistory() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [stats, setStats] = useState<MeditationHistoryStats>({
    totalSessions: 0,
    totalDuration: 0,
    currentStreak: 0,
    longestStreak: 0,
    favoriteScripts: [],
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // セッション一覧を取得
  const fetchSessions = useCallback(async (filters?: MeditationHistoryFilters, clearError = true) => {
    try {
      setLoading(true);
      if (clearError) {
        setError(null);
      }

      let fetchedSessions: MeditationSession[];

      if (user) {
        // ログインユーザーの場合はSupabaseから取得
        fetchedSessions = await DatabaseService.getMeditationSessions(
          user.id,
          filters?.limit || 50,
          filters?.offset || 0
        );
      } else {
        // 匿名ユーザーの場合はローカルストレージから取得
        if (filters?.dateRange) {
          fetchedSessions = getMeditationSessionsByDateRange(
            filters.dateRange.start,
            filters.dateRange.end
          );
        } else {
          fetchedSessions = getMeditationSessions();
        }
      }

      // フィルタリング
      if (filters) {
        if (filters.scriptId) {
          fetchedSessions = fetchedSessions.filter(s => s.scriptId === filters.scriptId);
        }
        if (filters.completed !== undefined) {
          fetchedSessions = fetchedSessions.filter(s => s.completed === filters.completed);
        }
        if (filters.limit && !user) {
          // ローカルストレージの場合のみlimit適用（Supabaseは既に適用済み）
          fetchedSessions = fetchedSessions.slice(0, filters.limit);
        }
      }

      setSessions(fetchedSessions);
    } catch (err) {
      if (clearError) {
        setError(err instanceof Error ? err.message : '履歴の取得に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 統計情報を取得
  const fetchStats = useCallback(async () => {
    try {
      if (user) {
        // ログインユーザーの場合はSupabaseから統計を取得
        const dbStats = await DatabaseService.getUserStatistics(user.id);
        setStats({
          totalSessions: dbStats.totalSessions,
          totalDuration: dbStats.totalDuration,
          currentStreak: dbStats.currentStreak,
          longestStreak: dbStats.longestStreak,
          favoriteScripts: [], // TODO: お気に入りスクリプトの実装
          completionRate: dbStats.completionRate
        });
      } else {
        // 匿名ユーザーの場合はローカルストレージから計算
        const localStats = calculateStatistics();
        const streak = calculateStreak();
        setStats({
          ...localStats,
          currentStreak: streak,
          completionRate: localStats.totalSessions > 0 
            ? localStats.totalSessions / getMeditationSessions().length 
            : 0
        });
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, [user]);

  // セッションを保存
  const saveSession = useCallback(async (session: MeditationSession) => {
    setError(null);
    
    try {
      if (user) {
        // ログインユーザーの場合はSupabaseに保存
        await DatabaseService.createMeditationSession({
          user_id: user.id,
          script_id: session.scriptId,
          start_time: session.startTime.toISOString(),
          end_time: session.endTime?.toISOString(),
          completed: session.completed,
          duration: session.duration,
          rating: session.rating,
          notes: session.notes,
          device_info: session.deviceInfo
        });
      } else {
        // 匿名ユーザーの場合はローカルストレージに保存
        addMeditationSession(session);
      }

      // 保存成功時のみデータを再取得
      try {
        await Promise.all([fetchSessions(undefined, false), fetchStats()]);
      } catch (refreshErr) {
        // データ再取得のエラーは無視（保存は成功している）
        console.warn('Failed to refresh data after save:', refreshErr);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'セッションの保存に失敗しました';
      setError(errorMessage);
      throw err;
    }
  }, [user, fetchSessions, fetchStats]);

  // セッションを更新
  const updateSession = useCallback(async (sessionId: string, updates: Partial<MeditationSession>) => {
    try {
      if (user) {
        // ログインユーザーの場合はSupabaseで更新
        await DatabaseService.updateMeditationSession(sessionId, {
          end_time: updates.endTime?.toISOString(),
          completed: updates.completed,
          duration: updates.duration,
          rating: updates.rating,
          notes: updates.notes
        });
      } else {
        // 匿名ユーザーの場合はローカルストレージで更新
        updateLocalSession(sessionId, updates);
      }

      // 更新後にデータを再取得（エラーをクリアしない）
      await Promise.all([fetchSessions(undefined, false), fetchStats()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'セッションの更新に失敗しました');
      throw err;
    }
  }, [user, fetchSessions, fetchStats]);

  // セッションを削除
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      if (user) {
        // ログインユーザーの場合はSupabaseから削除
        await DatabaseService.deleteMeditationSession(sessionId);
      } else {
        // 匿名ユーザーの場合はローカルストレージから削除
        deleteLocalSession(sessionId);
      }

      // 削除後にデータを再取得（エラーをクリアしない）
      await Promise.all([fetchSessions(undefined, false), fetchStats()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'セッションの削除に失敗しました');
      throw err;
    }
  }, [user, fetchSessions, fetchStats]);

  // 初期データ読み込み
  useEffect(() => {
    Promise.all([fetchSessions(undefined, true), fetchStats()]);
  }, [user]); // Only depend on user, not the functions

  return {
    sessions,
    stats,
    loading,
    error,
    fetchSessions,
    fetchStats,
    saveSession,
    updateSession,
    deleteSession,
    refetch: () => Promise.all([fetchSessions(undefined, true), fetchStats()])
  };
}
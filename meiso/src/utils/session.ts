import { MeditationSession } from '../types';
import { generateSessionId } from './id';
import { getDeviceInfo } from './device';

/**
 * 新しい瞑想セッションを作成
 */
export function createMeditationSession(
  scriptId: string,
  userId?: string
): MeditationSession {
  const now = new Date();

  return {
    id: generateSessionId(),
    userId,
    scriptId,
    startTime: now,
    endTime: undefined, // 開始時は未設定、完了時に設定
    completed: false,
    duration: 0,
    deviceInfo: getDeviceInfo(),
  };
}

/**
 * 瞑想セッションを完了状態に更新
 */
export function completeMeditationSession(
  session: MeditationSession,
  actualDuration: number,
  rating?: number,
  notes?: string
): MeditationSession {
  const endTime = new Date();

  return {
    ...session,
    endTime,
    completed: true,
    duration: actualDuration,
    rating,
    notes,
  };
}

/**
 * セッションの実際の継続時間を計算（秒）
 */
export function calculateSessionDuration(session: MeditationSession): number {
  if (!session.endTime) {
    return 0;
  }
  return Math.floor(
    (session.endTime.getTime() - session.startTime.getTime()) / 1000
  );
}

/**
 * セッションが今日のものかどうかを判定
 */
export function isSessionToday(session: MeditationSession): boolean {
  const today = new Date();
  const sessionDate = session.startTime;

  return (
    today.getFullYear() === sessionDate.getFullYear() &&
    today.getMonth() === sessionDate.getMonth() &&
    today.getDate() === sessionDate.getDate()
  );
}

/**
 * セッションが指定した日付のものかどうかを判定
 */
export function isSessionOnDate(
  session: MeditationSession,
  date: Date
): boolean {
  const sessionDate = session.startTime;

  return (
    date.getFullYear() === sessionDate.getFullYear() &&
    date.getMonth() === sessionDate.getMonth() &&
    date.getDate() === sessionDate.getDate()
  );
}

/**
 * セッション時間を人間が読みやすい形式にフォーマット
 */
export function formatSessionDuration(durationInSeconds: number): string {
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = durationInSeconds % 60;

  if (minutes === 0) {
    return `${seconds}秒`;
  }

  if (seconds === 0) {
    return `${minutes}分`;
  }

  return `${minutes}分${seconds}秒`;
}

/**
 * セッション開始時刻を人間が読みやすい形式にフォーマット
 */
export function formatSessionTime(date: Date): string {
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

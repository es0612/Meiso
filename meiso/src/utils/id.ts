// ユニークIDを生成するユーティリティ関数

/**
 * ランダムなUUID v4形式のIDを生成
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // フォールバック実装
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * セッション用のIDを生成（プレフィックス付き）
 */
export function generateSessionId(): string {
  return `session_${generateId()}`;
}

/**
 * ユーザー用のIDを生成（プレフィックス付き）
 */
export function generateUserId(): string {
  return `user_${generateId()}`;
}

/**
 * タイムスタンプベースのIDを生成
 */
export function generateTimestampId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `${timestamp}_${randomPart}`;
}

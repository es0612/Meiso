// 時間関連のユーティリティ関数

/**
 * 秒を MM:SS 形式にフォーマット
 */
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`;
};

/**
 * 現在の日時を取得
 */
export const getCurrentTimestamp = (): Date => new Date();

/**
 * セッション時間を計算
 */
export const calculateSessionDuration = (
  startTime: Date,
  endTime: Date
): number => {
  return Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
};

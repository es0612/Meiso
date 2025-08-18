import { LocalStorageData, MeditationSession, UserPreferences } from '../types';

// ローカルストレージのキー
const STORAGE_KEYS = {
  MEDITATION_DATA: 'meiso_meditation_data',
  USER_PREFERENCES: 'meiso_user_preferences',
  SESSIONS: 'meiso_sessions',
} as const;

// デフォルトのユーザー設定
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  defaultScript: 'basic-breathing',
  audioEnabled: true,
  volume: 0.7,
  notifications: false,
  theme: 'auto',
};

// ローカルストレージからデータを安全に取得
export function getFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }

  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item);
  } catch (error) {
    console.warn(`Failed to parse localStorage item "${key}":`, error);
    return defaultValue;
  }
}

// ローカルストレージにデータを安全に保存
export function setToLocalStorage<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Failed to save to localStorage "${key}":`, error);
    return false;
  }
}

// ローカルストレージからキーを削除
export function removeFromLocalStorage(key: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Failed to remove from localStorage "${key}":`, error);
    return false;
  }
}

// Raw data type for localStorage (with string dates)
type RawLocalStorageData = {
  sessions: Array<Omit<MeditationSession, 'startTime' | 'endTime'> & {
    startTime: string;
    endTime?: string;
  }>;
  preferences: UserPreferences;
  lastSyncAt?: string;
};

// 瞑想データ全体を取得
export function getMeditationData(): LocalStorageData {
  const defaultData: LocalStorageData = {
    sessions: [],
    preferences: DEFAULT_USER_PREFERENCES,
  };

  const rawData = getFromLocalStorage<RawLocalStorageData>(
    STORAGE_KEYS.MEDITATION_DATA,
    {
      sessions: [],
      preferences: DEFAULT_USER_PREFERENCES,
    }
  );

  try {
    // 日付文字列をDateオブジェクトに変換
    const processedData: LocalStorageData = {
      ...rawData,
      sessions: rawData.sessions.map(session => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: session.endTime ? new Date(session.endTime) : undefined,
      })),
      lastSyncAt: rawData.lastSyncAt ? new Date(rawData.lastSyncAt) : undefined,
    };

    return processedData;
  } catch (error) {
    console.warn(
      'Invalid meditation data in localStorage, using defaults:',
      error
    );
    return defaultData;
  }
}

// 瞑想データ全体を保存
export function saveMeditationData(data: LocalStorageData): boolean {
  // 日付をISO文字列に変換してから保存
  const dataToSave = {
    ...data,
    sessions: data.sessions.map(session => ({
      ...session,
      startTime: session.startTime.toISOString(),
      endTime: session.endTime?.toISOString(),
    })),
    lastSyncAt: data.lastSyncAt?.toISOString(),
  };

  return setToLocalStorage(STORAGE_KEYS.MEDITATION_DATA, dataToSave);
}

// ユーザー設定を取得
export function getUserPreferences(): UserPreferences {
  return getFromLocalStorage(
    STORAGE_KEYS.USER_PREFERENCES,
    DEFAULT_USER_PREFERENCES
  );
}

// ユーザー設定を保存
export function saveUserPreferences(preferences: UserPreferences): boolean {
  const success = setToLocalStorage(STORAGE_KEYS.USER_PREFERENCES, preferences);

  // メイン瞑想データも更新
  const meditationData = getMeditationData();
  meditationData.preferences = preferences;
  saveMeditationData(meditationData);

  return success;
}

// 瞑想セッションを追加
export function addMeditationSession(session: MeditationSession): boolean {
  const data = getMeditationData();
  data.sessions.push(session);
  return saveMeditationData(data);
}

// 瞑想セッション一覧を取得
export function getMeditationSessions(): MeditationSession[] {
  const data = getMeditationData();
  return data.sessions.sort(
    (a, b) => b.startTime.getTime() - a.startTime.getTime()
  );
}

// 特定の期間の瞑想セッションを取得
export function getMeditationSessionsByDateRange(
  startDate: Date,
  endDate: Date
): MeditationSession[] {
  const sessions = getMeditationSessions();
  return sessions.filter(
    session => session.startTime >= startDate && session.startTime <= endDate
  );
}

// 連続瞑想日数を計算
export function calculateStreak(): number {
  const sessions = getMeditationSessions();
  if (sessions.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  const currentDate = new Date(today);

  // 日付ごとにセッションをグループ化
  const sessionsByDate = new Map<string, MeditationSession[]>();
  sessions.forEach(session => {
    const dateKey = session.startTime.toDateString();
    if (!sessionsByDate.has(dateKey)) {
      sessionsByDate.set(dateKey, []);
    }
    sessionsByDate.get(dateKey)!.push(session);
  });

  // 今日から遡って連続日数を計算
  while (true) {
    const dateKey = currentDate.toDateString();
    const sessionsOnDate = sessionsByDate.get(dateKey);

    if (sessionsOnDate && sessionsOnDate.some(s => s.completed)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      // 今日の分がない場合は、昨日から開始
      if (streak === 0 && currentDate.getTime() === today.getTime()) {
        currentDate.setDate(currentDate.getDate() - 1);
        continue;
      }
      break;
    }
  }

  return streak;
}

// 統計情報を計算
export function calculateStatistics() {
  const sessions = getMeditationSessions();
  const completedSessions = sessions.filter(s => s.completed);

  const totalSessions = completedSessions.length;
  const totalDuration = completedSessions.reduce(
    (sum, s) => sum + s.duration,
    0
  );
  const currentStreak = calculateStreak();

  // 最長連続日数を計算（簡略化版）
  const longestStreak = currentStreak;

  // お気に入りスクリプトを計算（使用頻度順）
  const scriptCounts = new Map<string, number>();
  completedSessions.forEach(session => {
    const count = scriptCounts.get(session.scriptId) || 0;
    scriptCounts.set(session.scriptId, count + 1);
  });

  const favoriteScripts = Array.from(scriptCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([scriptId]) => scriptId);

  return {
    totalSessions,
    totalDuration,
    currentStreak,
    longestStreak,
    favoriteScripts,
  };
}

// ローカルストレージをクリア
export function clearMeditationData(): boolean {
  const keys = Object.values(STORAGE_KEYS);
  let success = true;

  keys.forEach(key => {
    if (!removeFromLocalStorage(key)) {
      success = false;
    }
  });

  return success;
}

// データのエクスポート
export function exportMeditationData(): string {
  const data = getMeditationData();
  return JSON.stringify(data, null, 2);
}

// セッションを更新
export function updateMeditationSession(sessionId: string, updates: Partial<MeditationSession>): boolean {
  const data = getMeditationData();
  const sessionIndex = data.sessions.findIndex(s => s.id === sessionId);
  
  if (sessionIndex === -1) {
    return false;
  }

  data.sessions[sessionIndex] = {
    ...data.sessions[sessionIndex],
    ...updates
  };

  return saveMeditationData(data);
}

// セッションを削除
export function deleteMeditationSession(sessionId: string): boolean {
  const data = getMeditationData();
  const originalLength = data.sessions.length;
  data.sessions = data.sessions.filter(s => s.id !== sessionId);
  
  if (data.sessions.length === originalLength) {
    return false; // セッションが見つからなかった
  }

  return saveMeditationData(data);
}

// データのインポート
export function importMeditationData(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData);

    // 基本的な検証
    if (!data.sessions || !Array.isArray(data.sessions)) {
      throw new Error('Invalid data format');
    }

    // 日付文字列をDateオブジェクトに変換
    const processedData: LocalStorageData = {
      sessions: data.sessions.map((session: RawLocalStorageData['sessions'][0]) => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: session.endTime ? new Date(session.endTime) : undefined,
      })),
      preferences: data.preferences || DEFAULT_USER_PREFERENCES,
      lastSyncAt: data.lastSyncAt ? new Date(data.lastSyncAt) : undefined,
    };

    return saveMeditationData(processedData);
  } catch (error) {
    console.error('Failed to import meditation data:', error);
    return false;
  }
}

// 瞑想スクリプト関連の型定義
export interface MeditationInstruction {
  timestamp: number; // 開始からの秒数
  text: string;
  type: 'guidance' | 'breathing' | 'visualization';
}

export interface MeditationScript {
  id: string;
  title: string;
  description: string;
  category: 'breathing' | 'mindfulness' | 'focus' | 'relaxation';
  duration: number; // 秒数
  audioUrl?: string;
  instructions: MeditationInstruction[];
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: Date;
  updatedAt: Date;
}

// 瞑想セッション関連の型定義
export interface MeditationSession {
  id: string;
  userId?: string; // 匿名ユーザーの場合はnull
  scriptId: string;
  startTime: Date;
  endTime: Date;
  completed: boolean;
  duration: number; // 実際の継続時間（秒）
  rating?: number; // 1-5星評価
  notes?: string;
  deviceInfo: {
    userAgent: string;
    screenSize: string;
  };
}

// ユーザープロフィール関連の型定義
export interface UserPreferences {
  defaultScript: string;
  audioEnabled: boolean;
  volume: number;
  notifications: boolean;
  theme: 'light' | 'dark' | 'auto';
}

export interface UserStatistics {
  totalSessions: number;
  totalDuration: number; // 秒数
  currentStreak: number;
  longestStreak: number;
  favoriteScripts: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  preferences: UserPreferences;
  statistics: UserStatistics;
  createdAt: Date;
  lastActiveAt: Date;
}

// ローカルストレージ用の型定義
export interface LocalStorageData {
  sessions: MeditationSession[];
  preferences: UserPreferences;
  lastSyncAt?: Date;
}

// コンポーネントプロパティ用の型定義
export interface MeditationTimerProps {
  duration: number; // 秒数
  script: MeditationScript;
  onComplete: () => void;
  onPause: () => void;
  onResume: () => void;
}

export interface ScriptSelectorProps {
  scripts: MeditationScript[];
  selectedScript: string;
  onScriptChange: (scriptId: string) => void;
}

export interface MeditationHistoryProps {
  sessions: MeditationSession[];
  streakCount: number;
  onSessionClick: (session: MeditationSession) => void;
}

export interface AudioControllerProps {
  audioUrl: string;
  volume: number;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
}

// Zodスキーマをエクスポート
export * from './schemas';

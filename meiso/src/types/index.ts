// 基本的な型定義

export interface MeditationSession {
  id: string;
  duration: number; // 秒
  startTime: Date;
  endTime?: Date;
  completed: boolean;
}

export interface AudioSettings {
  volume: number; // 0-1
  backgroundSound?: string;
  guidanceVoice?: string;
}

export interface UserPreferences {
  defaultDuration: number;
  audioSettings: AudioSettings;
  theme: 'light' | 'dark' | 'auto';
}

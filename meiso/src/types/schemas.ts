import { z } from 'zod';

// 瞑想指示のスキーマ
export const MeditationInstructionSchema = z.object({
  timestamp: z.number().min(0),
  text: z.string().min(1),
  type: z.enum(['guidance', 'breathing', 'visualization']),
});

// 瞑想スクリプトのスキーマ
export const MeditationScriptSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(['breathing', 'mindfulness', 'focus', 'relaxation']),
  duration: z.number().min(1),
  audioUrl: z.string().url().optional(),
  instructions: z.array(MeditationInstructionSchema),
  tags: z.array(z.string()),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// デバイス情報のスキーマ
export const DeviceInfoSchema = z.object({
  userAgent: z.string(),
  screenSize: z.string(),
});

// 瞑想セッションのスキーマ
export const MeditationSessionSchema = z.object({
  id: z.string().min(1),
  userId: z.string().optional(),
  scriptId: z.string().min(1),
  startTime: z.date(),
  endTime: z.date(),
  completed: z.boolean(),
  duration: z.number().min(0),
  rating: z.number().min(1).max(5).optional(),
  notes: z.string().optional(),
  deviceInfo: DeviceInfoSchema,
});

// ユーザー設定のスキーマ
export const UserPreferencesSchema = z.object({
  defaultScript: z.string().min(1),
  audioEnabled: z.boolean(),
  volume: z.number().min(0).max(1),
  notifications: z.boolean(),
  theme: z.enum(['light', 'dark', 'auto']),
});

// ユーザー統計のスキーマ
export const UserStatisticsSchema = z.object({
  totalSessions: z.number().min(0),
  totalDuration: z.number().min(0),
  currentStreak: z.number().min(0),
  longestStreak: z.number().min(0),
  favoriteScripts: z.array(z.string()),
});

// ユーザープロフィールのスキーマ
export const UserProfileSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().optional(),
  preferences: UserPreferencesSchema,
  statistics: UserStatisticsSchema,
  createdAt: z.date(),
  lastActiveAt: z.date(),
});

// ローカルストレージデータのスキーマ
export const LocalStorageDataSchema = z.object({
  sessions: z.array(MeditationSessionSchema),
  preferences: UserPreferencesSchema,
  lastSyncAt: z.date().optional(),
});

// JSON形式のスキーマ（日付を文字列として扱う）
export const MeditationScriptJSONSchema = MeditationScriptSchema.extend({
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const MeditationSessionJSONSchema = MeditationSessionSchema.extend({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
});

export const UserProfileJSONSchema = UserProfileSchema.extend({
  createdAt: z.string().datetime(),
  lastActiveAt: z.string().datetime(),
});

export const LocalStorageDataJSONSchema = LocalStorageDataSchema.extend({
  sessions: z.array(MeditationSessionJSONSchema),
  lastSyncAt: z.string().datetime().optional(),
});

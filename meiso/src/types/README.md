# データモデルとTypeScript型定義

このディレクトリには、1分瞑想ガイドアプリケーションのデータモデルとTypeScript型定義が含まれています。

## ファイル構成

### `index.ts`
- 主要なTypeScript型定義
- `MeditationScript`: 瞑想スクリプトの型定義
- `MeditationSession`: 瞑想セッションの型定義
- `UserProfile`: ユーザープロフィールの型定義
- コンポーネントプロパティの型定義

### `schemas.ts`
- Zodスキーマによるデータ検証
- ランタイムでのデータ検証に使用
- JSON形式とオブジェクト形式の両方に対応

## 主要な型定義

### MeditationScript
瞑想スクリプトの構造を定義します。

```typescript
interface MeditationScript {
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
```

### MeditationSession
瞑想セッションの記録を定義します。

```typescript
interface MeditationSession {
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
```

### UserProfile
ユーザープロフィールと設定を定義します。

```typescript
interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  preferences: UserPreferences;
  statistics: UserStatistics;
  createdAt: Date;
  lastActiveAt: Date;
}
```

## 使用例

```typescript
import { MeditationScript, MeditationSession } from './types';
import { MeditationScriptSchema } from './types/schemas';
import { createMeditationSession } from './utils/session';

// スクリプトの検証
const script: MeditationScript = { /* ... */ };
const validatedScript = MeditationScriptSchema.parse(script);

// セッションの作成
const session = createMeditationSession('basic-breathing', 'user-123');
```

## 関連ファイル

- `src/constants/meditation.ts`: 初期瞑想スクリプトデータ
- `src/utils/localStorage.ts`: ローカルストレージ操作
- `src/utils/session.ts`: セッション管理ユーティリティ
- `src/utils/id.ts`: ID生成ユーティリティ
- `src/utils/device.ts`: デバイス情報取得
# プロジェクト構造とファイル命名規則

## フォルダ構造

```
src/
├── app/                    # Next.js App Router
│   ├── (routes)/          # ルートグループ
│   ├── globals.css        # グローバルスタイル
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx           # ホームページ
├── components/            # Reactコンポーネント
│   ├── ui/               # 再利用可能なUIコンポーネント
│   ├── meditation/       # 瞑想関連コンポーネント
│   └── audio/            # 音声関連コンポーネント
├── lib/                  # ユーティリティライブラリ
├── hooks/                # カスタムReactフック
├── types/                # TypeScript型定義
├── utils/                # ヘルパー関数
└── constants/            # 定数定義
```

## ファイル命名規則

### コンポーネント

- **PascalCase**: `MeditationTimer.tsx`
- **フォルダ**: `meditation-timer/` (kebab-case)

### フック

- **camelCase**: `useMeditationTimer.ts`
- **プレフィックス**: `use` で始める

### ユーティリティ

- **camelCase**: `formatTime.ts`
- **純粋関数**: 副作用のない関数

### 型定義

- **PascalCase**: `MeditationSession.ts`
- **インターフェース**: `I` プレフィックスは使用しない

### 定数

- **UPPER_SNAKE_CASE**: `MEDITATION_DURATIONS.ts`

## コンポーネント構造

```tsx
// MeditationTimer.tsx
import { FC } from 'react';

interface MeditationTimerProps {
  duration: number;
  onComplete: () => void;
}

export const MeditationTimer: FC<MeditationTimerProps> = ({
  duration,
  onComplete,
}) => {
  // コンポーネントロジック
  return <div>{/* JSX */}</div>;
};
```

## インポート順序

1. React関連
2. 外部ライブラリ
3. 内部コンポーネント
4. ユーティリティ
5. 型定義
6. 相対インポート

```tsx
import { FC, useState } from 'react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/Button';
import { formatTime } from '@/utils/formatTime';
import { MeditationSession } from '@/types/MeditationSession';

import './MeditationTimer.css';
```

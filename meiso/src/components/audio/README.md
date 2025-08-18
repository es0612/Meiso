# AudioController コンポーネント

Web Audio API を使用した高品質な音声制御システムです。瞑想アプリケーションでの音声ガイダンス再生に最適化されています。

## 特徴

- **Web Audio API 統合**: ブラウザネイティブの高品質音声処理
- **フェードイン/フェードアウト効果**: 滑らかな音声の開始・終了
- **ブラウザ互換性対応**: Web Audio API サポートの自動検出
- **エラーハンドリング**: 音声読み込み失敗時の適切な処理
- **音量制御**: リアルタイム音量調整とミュート機能
- **レスポンシブデザイン**: モバイル・デスクトップ対応
- **アクセシビリティ**: ARIA属性とキーボードナビゲーション対応

## コンポーネント構成

### 1. useAudioController (カスタムフック)

Web Audio API の低レベル制御を提供するカスタムフックです。

```typescript
const audioController = useAudioController({
  audioUrl: 'https://example.com/audio.mp3',
  volume: 0.8,
  onVolumeChange: (volume) => console.log('Volume:', volume),
  onToggleMute: () => console.log('Mute toggled'),
});

// 使用例
audioController.play(1.0); // 1秒のフェードインで再生
audioController.stop(1.0); // 1秒のフェードアウトで停止
audioController.changeVolume(0.5); // 音量を50%に設定
audioController.toggleMute(); // ミュート切り替え
```

### 2. AudioControllerComponent (UIコンポーネント)

ユーザーインターフェースを提供するReactコンポーネントです。

```typescript
<AudioControllerComponent
  audioUrl="https://example.com/audio.mp3"
  volume={0.8}
  onVolumeChange={(volume) => setVolume(volume)}
  onToggleMute={() => setIsMuted(!isMuted)}
  onPlay={(fadeInDuration) => console.log('Playing with fade in:', fadeInDuration)}
  onStop={(fadeOutDuration) => console.log('Stopping with fade out:', fadeOutDuration)}
  showControls={true}
  className="custom-audio-controller"
/>
```

### 3. AudioExample (使用例コンポーネント)

実際の使用方法を示すサンプルコンポーネントです。

## API リファレンス

### useAudioController Props

| プロパティ | 型 | 必須 | 説明 |
|-----------|---|------|------|
| audioUrl | string | ✓ | 音声ファイルのURL |
| volume | number | ✓ | 音量 (0.0 - 1.0) |
| onVolumeChange | (volume: number) => void | ✓ | 音量変更時のコールバック |
| onToggleMute | () => void | ✓ | ミュート切り替え時のコールバック |

### useAudioController 戻り値

| プロパティ | 型 | 説明 |
|-----------|---|------|
| play | (fadeInDuration?: number) => Promise<void> | 音声再生（オプションでフェードイン時間指定） |
| stop | (fadeOutDuration?: number) => void | 音声停止（オプションでフェードアウト時間指定） |
| changeVolume | (volume: number) => void | 音量変更 |
| toggleMute | () => void | ミュート切り替え |
| isSupported | boolean | Web Audio API サポート状況 |
| state | AudioState | 現在の音声状態 |

### AudioState

| プロパティ | 型 | 説明 |
|-----------|---|------|
| isLoading | boolean | 音声ファイル読み込み中かどうか |
| isPlaying | boolean | 再生中かどうか |
| isMuted | boolean | ミュート状態かどうか |
| error | string \| null | エラーメッセージ（エラーがない場合はnull） |
| currentTime | number | 現在の再生時間（秒） |
| duration | number | 音声ファイルの総時間（秒） |

### AudioControllerComponent Props

useAudioController の Props に加えて以下のプロパティが利用可能です：

| プロパティ | 型 | 必須 | デフォルト | 説明 |
|-----------|---|------|-----------|------|
| onPlay | (fadeInDuration?: number) => void | - | - | 再生開始時のコールバック |
| onStop | (fadeOutDuration?: number) => void | - | - | 停止時のコールバック |
| showControls | boolean | - | true | コントロールUIの表示/非表示 |
| className | string | - | '' | カスタムCSSクラス |

## 使用例

### 基本的な使用方法

```typescript
import React, { useState } from 'react';
import { AudioControllerComponent } from '@/components/audio';

const MeditationPlayer = () => {
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  return (
    <AudioControllerComponent
      audioUrl="/meditation-audio/breathing-guide.mp3"
      volume={volume}
      onVolumeChange={setVolume}
      onToggleMute={() => setIsMuted(!isMuted)}
      onPlay={() => console.log('瞑想開始')}
      onStop={() => console.log('瞑想終了')}
    />
  );
};
```

### カスタムフックの使用

```typescript
import React, { useState } from 'react';
import { useAudioController } from '@/components/audio';

const CustomMeditationPlayer = () => {
  const [volume, setVolume] = useState(0.8);
  
  const audioController = useAudioController({
    audioUrl: '/meditation-audio/mindfulness.mp3',
    volume,
    onVolumeChange: setVolume,
    onToggleMute: () => console.log('ミュート切り替え'),
  });

  const startMeditation = async () => {
    if (audioController.isSupported) {
      await audioController.play(2.0); // 2秒のフェードイン
    }
  };

  const endMeditation = () => {
    audioController.stop(3.0); // 3秒のフェードアウト
  };

  return (
    <div>
      <button onClick={startMeditation}>瞑想開始</button>
      <button onClick={endMeditation}>瞑想終了</button>
      <p>再生時間: {Math.floor(audioController.state.currentTime)}秒</p>
    </div>
  );
};
```

## ブラウザサポート

- **Chrome**: 14+
- **Firefox**: 25+
- **Safari**: 6+
- **Edge**: 12+

Web Audio API がサポートされていないブラウザでは、`isSupported` が `false` を返し、適切なエラーメッセージが表示されます。

## エラーハンドリング

AudioController は以下のエラー状況を適切に処理します：

1. **Web Audio API 未サポート**: ユーザーフレンドリーなメッセージを表示
2. **音声ファイル読み込み失敗**: ネットワークエラーやファイル形式エラーを処理
3. **音声デコードエラー**: 不正な音声ファイル形式の処理
4. **再生エラー**: 音声再生中のエラーを適切にハンドリング

## パフォーマンス考慮事項

- 音声ファイルは初回アクセス時にのみ読み込まれます
- Web Audio API のコンテキストは適切にクリーンアップされます
- メモリリークを防ぐため、コンポーネントのアンマウント時にリソースを解放します
- フェード効果は Web Audio API のネイティブ機能を使用し、CPUに優しい実装です

## テスト

AudioController には包括的なテストスイートが含まれています：

```bash
# テスト実行
npm test src/components/audio

# テスト監視モード
npm run test:watch src/components/audio
```

テストは以下をカバーしています：
- Web Audio API の基本機能
- エラーハンドリング
- ブラウザ互換性
- ユーザーインタラクション
- コンポーネントのライフサイクル
'use client';

import React, { useState } from 'react';
import { AudioControllerComponent } from './AudioControllerComponent';

/**
 * AudioController の使用例を示すコンポーネント
 * 瞑想アプリでの実際の使用方法を想定
 */
export const AudioExample: React.FC = () => {
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');

  // サンプル音声URL（実際の実装では瞑想スクリプトから取得）
  const sampleAudioUrls = [
    'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    'https://www.soundjay.com/misc/sounds/wind-chimes-01.wav',
    'https://www.soundjay.com/nature/sounds/rain-01.wav',
  ];

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handlePlay = (fadeInDuration?: number) => {
    console.log(`音声再生開始 (フェードイン: ${fadeInDuration}秒)`);
  };

  const handleStop = (fadeOutDuration?: number) => {
    console.log(`音声停止 (フェードアウト: ${fadeOutDuration}秒)`);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        AudioController 使用例
      </h2>

      {/* 音声URL選択 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          音声ファイルを選択:
        </label>
        <select
          value={audioUrl}
          onChange={(e) => setAudioUrl(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">音声ファイルを選択してください</option>
          {sampleAudioUrls.map((url, index) => (
            <option key={index} value={url}>
              サンプル音声 {index + 1}
            </option>
          ))}
        </select>
      </div>

      {/* カスタム音声URL入力 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          または音声URLを直接入力:
        </label>
        <input
          type="url"
          value={audioUrl}
          onChange={(e) => setAudioUrl(e.target.value)}
          placeholder="https://example.com/audio.mp3"
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* AudioController コンポーネント */}
      {audioUrl && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            音声コントロール
          </h3>
          <AudioControllerComponent
            audioUrl={audioUrl}
            volume={volume}
            onVolumeChange={handleVolumeChange}
            onToggleMute={handleToggleMute}
            onPlay={handlePlay}
            onStop={handleStop}
            className="bg-white p-4 rounded-md shadow-sm"
          />
        </div>
      )}

      {/* 現在の設定表示 */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          現在の設定
        </h3>
        <div className="space-y-1 text-sm text-blue-700">
          <p>音量: {Math.round(volume * 100)}%</p>
          <p>ミュート: {isMuted ? 'オン' : 'オフ'}</p>
          <p>音声URL: {audioUrl || '未設定'}</p>
        </div>
      </div>

      {/* 使用方法の説明 */}
      <div className="p-4 bg-yellow-50 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          使用方法
        </h3>
        <ul className="space-y-1 text-sm text-yellow-700 list-disc list-inside">
          <li>音声ファイルのURLを選択または入力してください</li>
          <li>再生ボタンで音声を開始（1秒のフェードイン効果付き）</li>
          <li>停止ボタンで音声を停止（1秒のフェードアウト効果付き）</li>
          <li>音量スライダーで音量を調整できます</li>
          <li>スピーカーアイコンでミュート/ミュート解除が可能です</li>
          <li>再生時間と総時間が表示されます</li>
        </ul>
      </div>

      {/* 技術的な特徴 */}
      <div className="p-4 bg-green-50 rounded-lg">
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          技術的な特徴
        </h3>
        <ul className="space-y-1 text-sm text-green-700 list-disc list-inside">
          <li>Web Audio API を使用した高品質な音声処理</li>
          <li>フェードイン/フェードアウト効果</li>
          <li>ブラウザ互換性チェック</li>
          <li>エラーハンドリングとユーザーフレンドリーなメッセージ</li>
          <li>レスポンシブデザイン対応</li>
          <li>アクセシビリティ対応（ARIA属性、キーボードナビゲーション）</li>
        </ul>
      </div>
    </div>
  );
};

export default AudioExample;
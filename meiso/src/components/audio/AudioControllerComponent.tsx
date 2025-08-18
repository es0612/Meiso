'use client';

import React from 'react';
import { AudioControllerProps } from '@/types';
import { useAudioController } from './AudioController';

interface AudioControllerComponentProps extends AudioControllerProps {
  onPlay?: (fadeInDuration?: number) => void;
  onStop?: (fadeOutDuration?: number) => void;
  showControls?: boolean;
  className?: string;
}

export const AudioControllerComponent: React.FC<AudioControllerComponentProps> = ({
  audioUrl,
  volume,
  onVolumeChange,
  onToggleMute,
  onPlay,
  onStop,
  showControls = true,
  className = '',
}) => {
  const audioController = useAudioController({
    audioUrl,
    volume,
    onVolumeChange,
    onToggleMute,
  });

  const handlePlay = () => {
    audioController.play(1.0); // 1秒のフェードイン
    onPlay?.(1.0);
  };

  const handleStop = () => {
    audioController.stop(1.0); // 1秒のフェードアウト
    onStop?.(1.0);
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    audioController.changeVolume(newVolume);
  };

  if (!audioController.isSupported) {
    return (
      <div className={`audio-controller-error ${className}`}>
        <p className="text-red-500 text-sm">
          お使いのブラウザは音声機能をサポートしていません。
        </p>
      </div>
    );
  }

  if (audioController.state.error) {
    return (
      <div className={`audio-controller-error ${className}`}>
        <p className="text-red-500 text-sm">
          音声の読み込みに失敗しました: {audioController.state.error}
        </p>
      </div>
    );
  }

  if (!showControls) {
    return null;
  }

  return (
    <div className={`audio-controller ${className}`}>
      <div className="flex items-center space-x-4">
        {/* 再生/停止ボタン */}
        <div className="flex space-x-2">
          <button
            onClick={handlePlay}
            disabled={audioController.state.isLoading || audioController.state.isPlaying}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {audioController.state.isLoading ? '読み込み中...' : '再生'}
          </button>
          
          <button
            onClick={handleStop}
            disabled={!audioController.state.isPlaying}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            停止
          </button>
        </div>

        {/* 音量コントロール */}
        <div className="flex items-center space-x-2">
          <button
            onClick={audioController.toggleMute}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            title={audioController.state.isMuted ? 'ミュート解除' : 'ミュート'}
          >
            {audioController.state.isMuted ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.617 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.617l3.766-3.793a1 1 0 011.617.793zM14.657 5.343a1 1 0 011.414 0 9.972 9.972 0 010 14.314 1 1 0 11-1.414-1.414 7.971 7.971 0 000-11.486 1 1 0 010-1.414zM12.828 7.172a1 1 0 011.414 0 5.971 5.971 0 010 8.485 1 1 0 01-1.414-1.414 3.971 3.971 0 000-5.657 1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.617 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.617l3.766-3.793a1 1 0 011.617.793zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            title="音量"
          />
          
          <span className="text-sm text-gray-600 w-8">
            {Math.round(volume * 100)}%
          </span>
        </div>

        {/* 再生時間表示 */}
        {audioController.state.duration > 0 && (
          <div className="text-sm text-gray-600">
            {Math.floor(audioController.state.currentTime)}s / {Math.floor(audioController.state.duration)}s
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioControllerComponent;
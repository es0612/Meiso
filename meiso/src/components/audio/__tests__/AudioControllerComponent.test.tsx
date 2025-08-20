import React from 'react';
import { render, screen } from '@testing-library/react';
import { AudioControllerComponent } from '../AudioControllerComponent';

// useAudioController フックのモック
jest.mock('../AudioController', () => ({
  useAudioController: jest.fn(),
}));

import { useAudioController } from '../AudioController';

const mockUseAudioController = useAudioController as jest.MockedFunction<typeof useAudioController>;

describe('AudioControllerComponent', () => {
  const defaultProps = {
    audioUrl: 'https://example.com/audio.mp3',
    volume: 0.8,
    onVolumeChange: jest.fn(),
    onToggleMute: jest.fn(),
  };

  const mockAudioController = {
    play: jest.fn(),
    stop: jest.fn(),
    changeVolume: jest.fn(),
    toggleMute: jest.fn(),
    isSupported: true,
    state: {
      isLoading: false,
      isPlaying: false,
      isMuted: false,
      error: null,
      currentTime: 0,
      duration: 60,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAudioController.mockReturnValue(mockAudioController);
  });

  it('should render audio controls when supported', () => {
    render(<AudioControllerComponent {...defaultProps} />);

    expect(screen.getByText('再生')).toBeInTheDocument();
    expect(screen.getByText('停止')).toBeInTheDocument();
  });

  it('should show error message when not supported', () => {
    mockUseAudioController.mockReturnValue({
      ...mockAudioController,
      isSupported: false,
    });

    render(<AudioControllerComponent {...defaultProps} />);

    expect(screen.getByText('お使いのブラウザは音声機能をサポートしていません。')).toBeInTheDocument();
  });
});
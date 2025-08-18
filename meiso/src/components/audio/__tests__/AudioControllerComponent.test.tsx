import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AudioControllerComponent } from '../AudioControllerComponent';

// useAudioController フックのモック
jest.mock('../AudioController', () => ({
  useAudioController: jest.fn(),
}));

import { useAudioController } from '../AudioController';
import { expect } from '@jest/globals';
import { it } from 'zod/locales';
import { expect } from '@jest/globals';
import { jest } from '@jest/globals';
import { it } from 'zod/locales';
import { expect } from '@jest/globals';
import { jest } from '@jest/globals';
import { it } from 'zod/locales';
import { expect } from '@jest/globals';
import { expect } from '@jest/globals';
import { it } from 'zod/locales';
import { expect } from '@jest/globals';
import { it } from 'zod/locales';
import { expect } from '@jest/globals';
import { it } from 'zod/locales';
import { expect } from '@jest/globals';
import { it } from 'zod/locales';
import { expect } from '@jest/globals';
import { it } from 'zod/locales';
import { expect } from '@jest/globals';
import { it } from 'zod/locales';
import { expect } from '@jest/globals';
import { it } from 'zod/locales';
import { expect } from '@jest/globals';
import { it } from 'zod/locales';
import { expect } from '@jest/globals';
import { it } from 'zod/locales';
import { expect } from '@jest/globals';
import { it } from 'zod/locales';
import { expect } from '@jest/globals';
import { it } from 'zod/locales';
import { expect } from '@jest/globals';
import { it } from 'zod/locales';
import { expect } from '@jest/globals';
import { it } from 'zod/locales';
import { expect } from '@jest/globals';
import { expect } from '@jest/globals';
import { expect } from '@jest/globals';
import { it } from 'zod/locales';
import { jest } from '@jest/globals';
import { beforeEach } from '@jest/globals';
import { jest } from '@jest/globals';
import { jest } from '@jest/globals';
import { jest } from '@jest/globals';
import { jest } from '@jest/globals';
import { jest } from '@jest/globals';
import { jest } from '@jest/globals';
import { describe } from '@jest/globals';
import { jest } from '@jest/globals';
import { jest } from '@jest/globals';
import { jest } from '@jest/globals';
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
    expect(screen.getByTitle('音量')).toBeInTheDocument();
  });

  it('should show error message when not supported', () => {
    mockUseAudioController.mockReturnValue({
      ...mockAudioController,
      isSupported: false,
    });

    render(<AudioControllerComponent {...defaultProps} />);

    expect(screen.getByText('お使いのブラウザは音声機能をサポートしていません。')).toBeInTheDocument();
  });

  it('should show error message when audio loading fails', () => {
    mockUseAudioController.mockReturnValue({
      ...mockAudioController,
      state: {
        ...mockAudioController.state,
        error: 'Failed to load audio',
      },
    });

    render(<AudioControllerComponent {...defaultProps} />);

    expect(screen.getByText('音声の読み込みに失敗しました: Failed to load audio')).toBeInTheDocument();
  });

  it('should call play with fade in when play button is clicked', async () => {
    render(<AudioControllerComponent {...defaultProps} />);

    const playButton = screen.getByText('再生');
    fireEvent.click(playButton);

    expect(mockAudioController.play).toHaveBeenCalledWith(1.0);
  });

  it('should call stop with fade out when stop button is clicked', async () => {
    mockUseAudioController.mockReturnValue({
      ...mockAudioController,
      state: {
        ...mockAudioController.state,
        isPlaying: true,
      },
    });

    render(<AudioControllerComponent {...defaultProps} />);

    const stopButton = screen.getByText('停止');
    fireEvent.click(stopButton);

    expect(mockAudioController.stop).toHaveBeenCalledWith(1.0);
  });

  it('should disable play button when loading', () => {
    mockUseAudioController.mockReturnValue({
      ...mockAudioController,
      state: {
        ...mockAudioController.state,
        isLoading: true,
      },
    });

    render(<AudioControllerComponent {...defaultProps} />);

    const playButton = screen.getByText('読み込み中...');
    expect(playButton).toBeDisabled();
  });

  it('should disable play button when playing', () => {
    mockUseAudioController.mockReturnValue({
      ...mockAudioController,
      state: {
        ...mockAudioController.state,
        isPlaying: true,
      },
    });

    render(<AudioControllerComponent {...defaultProps} />);

    const playButton = screen.getByText('再生');
    expect(playButton).toBeDisabled();
  });

  it('should disable stop button when not playing', () => {
    render(<AudioControllerComponent {...defaultProps} />);

    const stopButton = screen.getByText('停止');
    expect(stopButton).toBeDisabled();
  });

  it('should handle volume change', async () => {
    render(<AudioControllerComponent {...defaultProps} />);

    const volumeSlider = screen.getByTitle('音量');
    fireEvent.change(volumeSlider, { target: { value: '0.5' } });

    expect(mockAudioController.changeVolume).toHaveBeenCalledWith(0.5);
  });

  it('should toggle mute when mute button is clicked', async () => {
    render(<AudioControllerComponent {...defaultProps} />);

    const muteButton = screen.getByTitle('ミュート');
    fireEvent.click(muteButton);

    expect(mockAudioController.toggleMute).toHaveBeenCalled();
  });

  it('should show muted icon when muted', () => {
    mockUseAudioController.mockReturnValue({
      ...mockAudioController,
      state: {
        ...mockAudioController.state,
        isMuted: true,
      },
    });

    render(<AudioControllerComponent {...defaultProps} />);

    const muteButton = screen.getByTitle('ミュート解除');
    expect(muteButton).toBeInTheDocument();
  });

  it('should display current time and duration', () => {
    mockUseAudioController.mockReturnValue({
      ...mockAudioController,
      state: {
        ...mockAudioController.state,
        currentTime: 30,
        duration: 60,
      },
    });

    render(<AudioControllerComponent {...defaultProps} />);

    expect(screen.getByText('30s / 60s')).toBeInTheDocument();
  });

  it('should display volume percentage', () => {
    render(<AudioControllerComponent {...defaultProps} />);

    expect(screen.getByText('80%')).toBeInTheDocument();
  });

  it('should not render when showControls is false', () => {
    render(<AudioControllerComponent {...defaultProps} showControls={false} />);

    expect(screen.queryByText('再生')).not.toBeInTheDocument();
    expect(screen.queryByText('停止')).not.toBeInTheDocument();
  });

  it('should call onPlay callback when play button is clicked', async () => {
    const onPlay = jest.fn();
    render(<AudioControllerComponent {...defaultProps} onPlay={onPlay} />);

    const playButton = screen.getByText('再生');
    fireEvent.click(playButton);

    expect(onPlay).toHaveBeenCalledWith(1.0);
  });

  it('should call onStop callback when stop button is clicked', async () => {
    const onStop = jest.fn();
    mockUseAudioController.mockReturnValue({
      ...mockAudioController,
      state: {
        ...mockAudioController.state,
        isPlaying: true,
      },
    });

    render(<AudioControllerComponent {...defaultProps} onStop={onStop} />);

    const stopButton = screen.getByText('停止');
    fireEvent.click(stopButton);

    expect(onStop).toHaveBeenCalledWith(1.0);
  });

  it('should apply custom className', () => {
    const { container } = render(
      <AudioControllerComponent {...defaultProps} className="custom-class" />
    );

    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});
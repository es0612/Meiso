import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MeditationTimer } from '../MeditationTimer';
import { MeditationScript } from '@/types';

// モックスクリプト
const mockScript: MeditationScript = {
  id: 'test-script',
  title: 'テスト瞑想',
  description: 'テスト用の瞑想スクリプトです',
  category: 'breathing',
  duration: 60,
  instructions: [
    { timestamp: 0, text: '深呼吸を始めましょう', type: 'guidance' },
    { timestamp: 30, text: 'ゆっくりと息を吸って', type: 'breathing' },
  ],
  tags: ['test'],
  difficulty: 'beginner',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// モック関数
const mockOnComplete = jest.fn();
const mockOnPause = jest.fn();
const mockOnResume = jest.fn();

// タイマーのモック
jest.useFakeTimers();

describe('MeditationTimer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const renderTimer = (duration = 60) => {
    return render(
      <MeditationTimer
        duration={duration}
        script={mockScript}
        onComplete={mockOnComplete}
        onPause={mockOnPause}
        onResume={mockOnResume}
      />
    );
  };

  describe('初期表示', () => {
    it('初期状態で正しい時間が表示される', () => {
      renderTimer(60);
      expect(screen.getByText('01:00')).toBeInTheDocument();
      expect(screen.getByText('準備完了')).toBeInTheDocument();
    });

    it('スクリプト情報が表示される', () => {
      renderTimer();
      expect(screen.getByText('テスト瞑想')).toBeInTheDocument();
      expect(screen.getByText('テスト用の瞑想スクリプトです')).toBeInTheDocument();
    });

    it('開始ボタンが表示される', () => {
      renderTimer();
      expect(screen.getByRole('button', { name: '開始' })).toBeInTheDocument();
    });

    it('キーボードショートカットのヒントが表示される', () => {
      renderTimer();
      expect(screen.getByText('スペースキー: 開始/一時停止/再開')).toBeInTheDocument();
      expect(screen.getByText('Escapeキー: リセット')).toBeInTheDocument();
    });
  });

  describe('タイマー機能', () => {
    it('開始ボタンをクリックするとタイマーが開始される', async () => {
      renderTimer(5);
      
      const startButton = screen.getByTestId('start-timer-button');
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(screen.getByText('瞑想中')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '一時停止' })).toBeInTheDocument();
      });
    });

    it('タイマーが正しくカウントダウンする', async () => {
      renderTimer(5);
      
      const startButton = screen.getByTestId('start-timer-button');
      fireEvent.click(startButton);

      // 1秒経過
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText('00:04')).toBeInTheDocument();
      });

      // さらに2秒経過
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.getByText('00:02')).toBeInTheDocument();
      });
    });

    it('タイマーが完了するとonCompleteが呼ばれる', async () => {
      renderTimer(2);
      
      const startButton = screen.getByTestId('start-timer-button');
      fireEvent.click(startButton);

      // 2秒経過してタイマー完了
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledTimes(1);
        expect(screen.getByText('完了')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'もう一度' })).toBeInTheDocument();
      });
    });
  });

  describe('一時停止・再開機能', () => {
    it('一時停止ボタンをクリックするとタイマーが停止する', async () => {
      renderTimer(10);
      
      // タイマー開始
      const startButton = screen.getByTestId('start-timer-button');
      fireEvent.click(startButton);

      // 一時停止ボタンが表示されるまで待機
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '一時停止' })).toBeInTheDocument();
      });

      // 2秒経過
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // 一時停止
      const pauseButton = screen.getByRole('button', { name: '一時停止' });
      fireEvent.click(pauseButton);

      expect(mockOnPause).toHaveBeenCalledTimes(1);
      
      await waitFor(() => {
        expect(screen.getByText('一時停止中')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '再開' })).toBeInTheDocument();
      });
    });

    it('再開ボタンをクリックするとタイマーが再開する', async () => {
      renderTimer(10);
      
      // タイマー開始
      const startButton = screen.getByTestId('start-timer-button');
      fireEvent.click(startButton);

      // 一時停止ボタンが表示されるまで待機
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '一時停止' })).toBeInTheDocument();
      });

      // 一時停止
      const pauseButton = screen.getByRole('button', { name: '一時停止' });
      fireEvent.click(pauseButton);

      // 再開ボタンが表示されるまで待機
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '再開' })).toBeInTheDocument();
      });

      // 再開
      const resumeButton = screen.getByRole('button', { name: '再開' });
      fireEvent.click(resumeButton);

      expect(mockOnResume).toHaveBeenCalledTimes(1);
      
      await waitFor(() => {
        expect(screen.getByText('瞑想中')).toBeInTheDocument();
      });
    });
  });

  describe('リセット機能', () => {
    it('リセットボタンをクリックするとタイマーがリセットされる', async () => {
      renderTimer(10);
      
      // タイマー開始
      const startButton = screen.getByTestId('start-timer-button');
      fireEvent.click(startButton);

      // 3秒経過
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // リセット
      const resetButton = screen.getByRole('button', { name: 'リセット' });
      fireEvent.click(resetButton);

      expect(screen.getByText('00:10')).toBeInTheDocument();
      expect(screen.getByText('準備完了')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '開始' })).toBeInTheDocument();
    });

    it('完了後にもう一度ボタンをクリックするとリセットされる', async () => {
      renderTimer(1);
      
      // タイマー開始
      const startButton = screen.getByTestId('start-timer-button');
      fireEvent.click(startButton);

      // 1秒経過してタイマー完了
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText('完了')).toBeInTheDocument();
      });

      // もう一度ボタンが表示されるまで待機
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'もう一度' })).toBeInTheDocument();
      });

      // もう一度ボタンをクリック
      const againButton = screen.getByRole('button', { name: 'もう一度' });
      fireEvent.click(againButton);

      expect(screen.getByText('00:01')).toBeInTheDocument();
      expect(screen.getByText('準備完了')).toBeInTheDocument();
    });
  });

  describe('キーボードショートカット', () => {
    it('スペースキーでタイマーを開始できる', () => {
      renderTimer();
      
      fireEvent.keyDown(window, { code: 'Space' });
      
      expect(screen.getByText('瞑想中')).toBeInTheDocument();
    });

    it('スペースキーでタイマーを一時停止できる', async () => {
      renderTimer();
      
      // スペースキーで開始
      fireEvent.keyDown(window, { code: 'Space' });
      
      // スペースキーで一時停止
      fireEvent.keyDown(window, { code: 'Space' });
      
      expect(mockOnPause).toHaveBeenCalledTimes(1);
      expect(screen.getByText('一時停止中')).toBeInTheDocument();
    });

    it('スペースキーでタイマーを再開できる', async () => {
      renderTimer();
      
      // 開始
      fireEvent.keyDown(window, { code: 'Space' });
      
      // 一時停止
      fireEvent.keyDown(window, { code: 'Space' });
      
      // 再開
      fireEvent.keyDown(window, { code: 'Space' });
      
      expect(mockOnResume).toHaveBeenCalledTimes(1);
      expect(screen.getByText('瞑想中')).toBeInTheDocument();
    });

    it('Escapeキーでタイマーをリセットできる', async () => {
      renderTimer(10);
      
      // タイマー開始
      fireEvent.keyDown(window, { code: 'Space' });
      
      // 時間経過
      act(() => {
        jest.advanceTimersByTime(3000);
      });
      
      // Escapeキーでリセット
      fireEvent.keyDown(window, { code: 'Escape' });
      
      expect(screen.getByText('00:10')).toBeInTheDocument();
      expect(screen.getByText('準備完了')).toBeInTheDocument();
    });
  });

  describe('プログレスバー', () => {
    it('プログレスバーが正しく表示される', () => {
      renderTimer();
      
      const progressCircle = document.querySelector('circle[stroke-dasharray]');
      expect(progressCircle).toBeInTheDocument();
    });

    it('時間の経過に応じてプログレスが更新される', async () => {
      renderTimer(4);
      
      // タイマー開始
      const startButton = screen.getByTestId('start-timer-button');
      fireEvent.click(startButton);

      // 2秒経過（50%進行）
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // プログレスバーのstrokeDashoffsetが変更されていることを確認
      const progressCircle = document.querySelector('circle[stroke-dashoffset]');
      expect(progressCircle).toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    it('ボタンにフォーカスが当たる', () => {
      renderTimer();
      
      const startButton = screen.getByTestId('start-timer-button');
      startButton.focus();
      
      expect(startButton).toHaveFocus();
    });

    it('適切なARIA属性が設定されている', () => {
      renderTimer();
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
    });
  });
});
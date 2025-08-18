import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MeditationTimerExample } from '../MeditationTimerExample';

// タイマーのモック
jest.useFakeTimers();

describe('MeditationTimer Integration', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  it('完全な瞑想セッションフローが正常に動作する', async () => {
    render(<MeditationTimerExample />);

    // 初期状態の確認
    expect(screen.getByText('瞑想タイマー デモ')).toBeInTheDocument();
    expect(screen.getByText('基本の呼吸瞑想')).toBeInTheDocument();
    expect(screen.getByText('01:00')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument(); // 完了セッション数

    // セッション開始
    const startButton = screen.getByRole('button', { name: '開始' });
    fireEvent.click(startButton);

    // タイマーが開始されることを確認
    await waitFor(() => {
      expect(screen.getByText('瞑想中')).toBeInTheDocument();
    });

    // 30秒経過
    jest.advanceTimersByTime(30000);

    await waitFor(() => {
      expect(screen.getByText('00:30')).toBeInTheDocument();
    });

    // 一時停止
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '一時停止' })).toBeInTheDocument();
    });

    const pauseButton = screen.getByRole('button', { name: '一時停止' });
    fireEvent.click(pauseButton);

    await waitFor(() => {
      expect(screen.getByText('一時停止中')).toBeInTheDocument();
    });

    // 再開
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '再開' })).toBeInTheDocument();
    });

    const resumeButton = screen.getByRole('button', { name: '再開' });
    fireEvent.click(resumeButton);

    await waitFor(() => {
      expect(screen.getByText('瞑想中')).toBeInTheDocument();
    });

    // 残り30秒経過してセッション完了
    jest.advanceTimersByTime(30000);

    await waitFor(() => {
      expect(screen.getByText('完了')).toBeInTheDocument();
    });

    // 完了メッセージが表示される
    await waitFor(() => {
      expect(screen.getByText('瞑想セッション完了！')).toBeInTheDocument();
    });

    // セッション数が更新される
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument(); // 完了セッション数
    });

    // もう一度ボタンでリセット
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'もう一度' })).toBeInTheDocument();
    });

    const againButton = screen.getByRole('button', { name: 'もう一度' });
    fireEvent.click(againButton);

    expect(screen.getByText('01:00')).toBeInTheDocument();
    expect(screen.getByText('準備完了')).toBeInTheDocument();
  });

  it('キーボードショートカットが正常に動作する', async () => {
    render(<MeditationTimerExample />);

    // スペースキーでセッション開始
    fireEvent.keyDown(window, { code: 'Space' });

    await waitFor(() => {
      expect(screen.getByText('瞑想中')).toBeInTheDocument();
    });

    // 10秒経過
    jest.advanceTimersByTime(10000);

    // スペースキーで一時停止
    fireEvent.keyDown(window, { code: 'Space' });

    await waitFor(() => {
      expect(screen.getByText('一時停止中')).toBeInTheDocument();
    });

    // Escapeキーでリセット
    fireEvent.keyDown(window, { code: 'Escape' });

    expect(screen.getByText('01:00')).toBeInTheDocument();
    expect(screen.getByText('準備完了')).toBeInTheDocument();
  });

  it('プログレスバーが時間の経過に応じて更新される', async () => {
    render(<MeditationTimerExample />);

    // セッション開始
    const startButton = screen.getByRole('button', { name: '開始' });
    fireEvent.click(startButton);

    // プログレスバーの存在確認
    const progressCircle = document.querySelector('circle[stroke-dasharray]');
    expect(progressCircle).toBeInTheDocument();

    // 初期状態のstrokeDashoffset
    const initialOffset = progressCircle?.getAttribute('stroke-dashoffset');

    // 30秒経過
    jest.advanceTimersByTime(30000);

    await waitFor(() => {
      expect(screen.getByText('00:30')).toBeInTheDocument();
    });

    // プログレスが更新されていることを確認
    const updatedOffset = progressCircle?.getAttribute('stroke-dashoffset');
    expect(updatedOffset).not.toBe(initialOffset);
  });

  it('複数セッションの統計が正しく更新される', async () => {
    render(<MeditationTimerExample />);

    // 最初のセッション完了
    const startButton = screen.getByRole('button', { name: '開始' });
    fireEvent.click(startButton);

    jest.advanceTimersByTime(60000);

    await waitFor(() => {
      expect(screen.getByText('瞑想セッション完了！')).toBeInTheDocument();
    });

    // 新しいセッション開始ボタンをクリック
    const newSessionButton = screen.getByRole('button', { name: '新しいセッションを開始' });
    fireEvent.click(newSessionButton);

    // 2回目のセッション開始
    const startButton2 = screen.getByRole('button', { name: '開始' });
    fireEvent.click(startButton2);

    jest.advanceTimersByTime(60000);

    await waitFor(() => {
      expect(screen.getByText('瞑想セッション完了！')).toBeInTheDocument();
    });

    // セッション数が2になっていることを確認
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // 完了セッション数
    });
  });
});
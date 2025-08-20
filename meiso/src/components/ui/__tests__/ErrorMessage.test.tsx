import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorMessage, ErrorContainer } from '../ErrorMessage';

// Framer Motion のモック
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('ErrorMessage', () => {
  it('should render error message', () => {
    const error = new Error('Test error message');
    render(<ErrorMessage error={error} />);
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/予期しないエラーが発生しました/)).toBeInTheDocument();
  });

  it('should show retry button for retryable errors', () => {
    const error = new Error('network error');
    const onRetry = jest.fn();
    
    render(<ErrorMessage error={error} onRetry={onRetry} />);
    
    const retryButton = screen.getByRole('button', { name: '再試行' });
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should show dismiss button when onDismiss is provided', () => {
    const error = new Error('Test error');
    const onDismiss = jest.fn();
    
    render(<ErrorMessage error={error} onDismiss={onDismiss} />);
    
    const dismissButton = screen.getByRole('button', { name: 'エラーメッセージを閉じる' });
    expect(dismissButton).toBeInTheDocument();
    
    fireEvent.click(dismissButton);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('should categorize network errors correctly', () => {
    const error = new Error('fetch failed');
    render(<ErrorMessage error={error} />);
    
    expect(screen.getByText(/インターネット接続を確認してください/)).toBeInTheDocument();
  });

  it('should categorize audio errors correctly', () => {
    const error = new Error('Web Audio API not supported');
    render(<ErrorMessage error={error} />);
    
    expect(screen.getByText(/音声の再生に問題があります/)).toBeInTheDocument();
  });

  it('should not render when error is null', () => {
    const { container } = render(<ErrorMessage error={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('should show developer info in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    const error = new Error('Detailed error message');
    render(<ErrorMessage error={error} />);
    
    expect(screen.getByText('開発者情報')).toBeInTheDocument();
    
    process.env.NODE_ENV = originalEnv;
  });
});

describe('ErrorContainer', () => {
  it('should render multiple errors', () => {
    const errors = [
      new Error('First error'),
      new Error('Second error'),
    ];
    
    render(<ErrorContainer errors={errors} />);
    
    expect(screen.getAllByRole('alert')).toHaveLength(2);
  });

  it('should filter out null/undefined errors', () => {
    const errors = [
      new Error('Valid error'),
      null,
      undefined,
      new Error('Another valid error'),
    ];
    
    render(<ErrorContainer errors={errors} />);
    
    expect(screen.getAllByRole('alert')).toHaveLength(2);
  });

  it('should not render when no valid errors', () => {
    const errors = [null, undefined];
    const { container } = render(<ErrorContainer errors={errors} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should call onRetry with correct index', () => {
    const errors = [
      new Error('network error'),
      new Error('fetch failed'),
    ];
    const onRetry = jest.fn();
    
    render(<ErrorContainer errors={errors} onRetry={onRetry} />);
    
    const retryButtons = screen.getAllByRole('button', { name: '再試行' });
    expect(retryButtons).toHaveLength(2);
    
    fireEvent.click(retryButtons[1]);
    expect(onRetry).toHaveBeenCalledWith(1);
  });

  it('should call onDismiss with correct index', () => {
    const errors = [
      new Error('First error'),
      new Error('Second error'),
    ];
    const onDismiss = jest.fn();
    
    render(<ErrorContainer errors={errors} onDismiss={onDismiss} />);
    
    const dismissButtons = screen.getAllByRole('button', { name: 'エラーメッセージを閉じる' });
    expect(dismissButtons).toHaveLength(2);
    
    fireEvent.click(dismissButtons[0]);
    expect(onDismiss).toHaveBeenCalledWith(0);
  });
});
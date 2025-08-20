/**
 * エラーハンドリングユーティリティ
 * ユーザーフレンドリーなエラーメッセージとエラー処理を提供
 */

export interface ErrorInfo {
  message: string;
  code?: string;
  type: 'network' | 'validation' | 'audio' | 'auth' | 'storage' | 'unknown';
  severity: 'low' | 'medium' | 'high';
  userMessage: string;
  actionable?: boolean;
  retryable?: boolean;
}

/**
 * エラーを分類してユーザーフレンドリーなメッセージに変換
 */
export function categorizeError(error: unknown): ErrorInfo {
  const defaultError: ErrorInfo = {
    message: 'Unknown error occurred',
    type: 'unknown',
    severity: 'medium',
    userMessage: '予期しないエラーが発生しました。しばらく待ってから再度お試しください。',
    actionable: false,
    retryable: true,
  };

  if (!error) return defaultError;

  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();

  // ネットワークエラー
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('connection')) {
    return {
      message: errorMessage,
      type: 'network',
      severity: 'medium',
      userMessage: 'インターネット接続を確認してください。オフラインでも基本機能は利用できます。',
      actionable: true,
      retryable: true,
    };
  }

  // 音声関連エラー
  if (lowerMessage.includes('audio') || lowerMessage.includes('web audio api')) {
    return {
      message: errorMessage,
      type: 'audio',
      severity: 'low',
      userMessage: '音声の再生に問題があります。音声をオフにして視覚的ガイダンスをご利用ください。',
      actionable: true,
      retryable: false,
    };
  }

  // 認証エラー
  if (lowerMessage.includes('auth') || lowerMessage.includes('unauthorized') || lowerMessage.includes('token')) {
    return {
      message: errorMessage,
      type: 'auth',
      severity: 'medium',
      userMessage: 'ログインセッションが期限切れです。再度ログインしてください。',
      actionable: true,
      retryable: false,
    };
  }

  // バリデーションエラー
  if (lowerMessage.includes('validation') || lowerMessage.includes('invalid')) {
    return {
      message: errorMessage,
      type: 'validation',
      severity: 'low',
      userMessage: '入力内容を確認してください。',
      actionable: true,
      retryable: false,
    };
  }

  // ストレージエラー
  if (lowerMessage.includes('storage') || lowerMessage.includes('quota')) {
    return {
      message: errorMessage,
      type: 'storage',
      severity: 'medium',
      userMessage: 'ストレージの容量が不足しています。ブラウザのデータを整理してください。',
      actionable: true,
      retryable: false,
    };
  }

  return {
    ...defaultError,
    message: errorMessage,
  };
}

/**
 * エラーメッセージコンポーネント用のプロパティを生成
 */
export function getErrorMessageProps(error: unknown) {
  const errorInfo = categorizeError(error);
  
  return {
    message: errorInfo.userMessage,
    type: errorInfo.type,
    severity: errorInfo.severity,
    actionable: errorInfo.actionable,
    retryable: errorInfo.retryable,
  };
}

/**
 * エラーログ記録（開発環境でのデバッグ用）
 */
export function logError(error: unknown, context?: string) {
  const errorInfo = categorizeError(error);
  
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚨 Error ${context ? `in ${context}` : ''}`);
    console.error('Original error:', error);
    console.log('Categorized:', errorInfo);
    console.groupEnd();
  }
  
  // 本番環境では外部サービス（Sentry等）に送信することも可能
  // if (process.env.NODE_ENV === 'production') {
  //   // Send to error tracking service
  // }
}

/**
 * リトライ可能なエラーかどうかを判定
 */
export function isRetryableError(error: unknown): boolean {
  const errorInfo = categorizeError(error);
  return errorInfo.retryable ?? false;
}

/**
 * エラーの重要度を取得
 */
export function getErrorSeverity(error: unknown): 'low' | 'medium' | 'high' {
  const errorInfo = categorizeError(error);
  return errorInfo.severity;
}
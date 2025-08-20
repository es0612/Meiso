import {
  categorizeError,
  getErrorMessageProps,
  logError,
  isRetryableError,
  getErrorSeverity,
} from '../errorHandling';

// console.group と console.groupEnd のモック
const mockConsoleGroup = jest.fn();
const mockConsoleGroupEnd = jest.fn();
const mockConsoleError = jest.fn();
const mockConsoleLog = jest.fn();

beforeAll(() => {
  global.console = {
    ...console,
    group: mockConsoleGroup,
    groupEnd: mockConsoleGroupEnd,
    error: mockConsoleError,
    log: mockConsoleLog,
  };
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('categorizeError', () => {
  it('should categorize network errors', () => {
    const error = new Error('Network connection failed');
    const result = categorizeError(error);
    
    expect(result.type).toBe('network');
    expect(result.severity).toBe('medium');
    expect(result.retryable).toBe(true);
    expect(result.userMessage).toContain('インターネット接続を確認してください');
  });

  it('should categorize audio errors', () => {
    const error = new Error('Web Audio API not supported');
    const result = categorizeError(error);
    
    expect(result.type).toBe('audio');
    expect(result.severity).toBe('low');
    expect(result.retryable).toBe(false);
    expect(result.userMessage).toContain('音声の再生に問題があります');
  });

  it('should categorize auth errors', () => {
    const error = new Error('Unauthorized access');
    const result = categorizeError(error);
    
    expect(result.type).toBe('auth');
    expect(result.severity).toBe('medium');
    expect(result.retryable).toBe(false);
    expect(result.userMessage).toContain('ログインセッションが期限切れです');
  });

  it('should categorize validation errors', () => {
    const error = new Error('Invalid input data');
    const result = categorizeError(error);
    
    expect(result.type).toBe('validation');
    expect(result.severity).toBe('low');
    expect(result.retryable).toBe(false);
    expect(result.userMessage).toContain('入力内容を確認してください');
  });

  it('should categorize storage errors', () => {
    const error = new Error('Storage quota exceeded');
    const result = categorizeError(error);
    
    expect(result.type).toBe('storage');
    expect(result.severity).toBe('medium');
    expect(result.retryable).toBe(false);
    expect(result.userMessage).toContain('ストレージの容量が不足しています');
  });

  it('should handle unknown errors', () => {
    const error = new Error('Some unknown error');
    const result = categorizeError(error);
    
    expect(result.type).toBe('unknown');
    expect(result.severity).toBe('medium');
    expect(result.retryable).toBe(true);
    expect(result.userMessage).toContain('予期しないエラーが発生しました');
  });

  it('should handle null/undefined errors', () => {
    const result1 = categorizeError(null);
    const result2 = categorizeError(undefined);
    
    expect(result1.type).toBe('unknown');
    expect(result2.type).toBe('unknown');
  });

  it('should handle string errors', () => {
    const result = categorizeError('String error message');
    
    expect(result.message).toBe('String error message');
    expect(result.type).toBe('unknown');
  });

  it('should be case insensitive', () => {
    const error = new Error('NETWORK ERROR');
    const result = categorizeError(error);
    
    expect(result.type).toBe('network');
  });
});

describe('getErrorMessageProps', () => {
  it('should return correct props for error', () => {
    const error = new Error('fetch failed');
    const props = getErrorMessageProps(error);
    
    expect(props.type).toBe('network');
    expect(props.severity).toBe('medium');
    expect(props.retryable).toBe(true);
    expect(props.message).toContain('インターネット接続を確認してください');
  });
});

describe('logError', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('should log error in development mode', () => {
    process.env.NODE_ENV = 'development';
    
    const error = new Error('Test error');
    logError(error, 'TestContext');
    
    expect(mockConsoleGroup).toHaveBeenCalledWith('🚨 Error in TestContext');
    expect(mockConsoleError).toHaveBeenCalledWith('Original error:', error);
    expect(mockConsoleLog).toHaveBeenCalledWith('Categorized:', expect.any(Object));
    expect(mockConsoleGroupEnd).toHaveBeenCalled();
  });

  it('should not log error in production mode', () => {
    process.env.NODE_ENV = 'production';
    
    const error = new Error('Test error');
    logError(error);
    
    expect(mockConsoleGroup).not.toHaveBeenCalled();
    expect(mockConsoleError).not.toHaveBeenCalled();
  });

  it('should log without context', () => {
    process.env.NODE_ENV = 'development';
    
    const error = new Error('Test error');
    logError(error);
    
    expect(mockConsoleGroup).toHaveBeenCalledWith('🚨 Error ');
  });
});

describe('isRetryableError', () => {
  it('should return true for retryable errors', () => {
    const error = new Error('network timeout');
    expect(isRetryableError(error)).toBe(true);
  });

  it('should return false for non-retryable errors', () => {
    const error = new Error('validation failed');
    expect(isRetryableError(error)).toBe(false);
  });
});

describe('getErrorSeverity', () => {
  it('should return correct severity for different error types', () => {
    expect(getErrorSeverity(new Error('audio error'))).toBe('low');
    expect(getErrorSeverity(new Error('network error'))).toBe('medium');
    expect(getErrorSeverity(new Error('unknown error'))).toBe('medium');
  });
});
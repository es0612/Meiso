import {
  categorizeError,
  getErrorMessageProps,
  logError,
  isRetryableError,
  getErrorSeverity,
  type ErrorInfo,
} from '../errorHandling'

// Environment variables for Supabase
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

// Mock console methods
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {})
const mockConsoleGroup = jest.spyOn(console, 'group').mockImplementation(() => {})
const mockConsoleGroupEnd = jest.spyOn(console, 'groupEnd').mockImplementation(() => {})

describe('ErrorHandling Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Set development environment for logging tests
    process.env.NODE_ENV = 'development'
  })

  afterAll(() => {
    mockConsoleError.mockRestore()
    mockConsoleLog.mockRestore()
    mockConsoleGroup.mockRestore()
    mockConsoleGroupEnd.mockRestore()
  })

  describe('categorizeError', () => {
    it('should categorize network errors', () => {
      const error = new Error('Network connection failed')
      const result = categorizeError(error)

      expect(result.type).toBe('network')
      expect(result.severity).toBe('medium')
      expect(result.userMessage).toBe('インターネット接続を確認してください。オフラインでも基本機能は利用できます。')
      expect(result.actionable).toBe(true)
      expect(result.retryable).toBe(true)
    })

    it('should categorize fetch errors as network errors', () => {
      const error = new Error('Failed to fetch')
      const result = categorizeError(error)

      expect(result.type).toBe('network')
      expect(result.retryable).toBe(true)
    })

    it('should categorize audio errors', () => {
      const error = new Error('Web Audio API not supported')
      const result = categorizeError(error)

      expect(result.type).toBe('audio')
      expect(result.severity).toBe('low')
      expect(result.userMessage).toBe('音声の再生に問題があります。音声をオフにして視覚的ガイダンスをご利用ください。')
      expect(result.actionable).toBe(true)
      expect(result.retryable).toBe(false)
    })

    it('should categorize authentication errors', () => {
      const error = new Error('Unauthorized access')
      const result = categorizeError(error)

      expect(result.type).toBe('auth')
      expect(result.severity).toBe('medium')
      expect(result.userMessage).toBe('ログインセッションが期限切れです。再度ログインしてください。')
      expect(result.actionable).toBe(true)
      expect(result.retryable).toBe(false)
    })

    it('should categorize token errors as auth errors', () => {
      const error = new Error('Invalid token')
      const result = categorizeError(error)

      expect(result.type).toBe('auth')
      expect(result.retryable).toBe(false)
    })

    it('should categorize validation errors', () => {
      const error = new Error('Invalid email format')
      const result = categorizeError(error)

      expect(result.type).toBe('validation')
      expect(result.severity).toBe('low')
      expect(result.userMessage).toBe('入力内容を確認してください。')
      expect(result.actionable).toBe(true)
      expect(result.retryable).toBe(false)
    })

    it('should categorize storage errors', () => {
      const error = new Error('Storage quota exceeded')
      const result = categorizeError(error)

      expect(result.type).toBe('storage')
      expect(result.severity).toBe('medium')
      expect(result.userMessage).toBe('ストレージの容量が不足しています。ブラウザのデータを整理してください。')
      expect(result.actionable).toBe(true)
      expect(result.retryable).toBe(false)
    })

    it('should handle unknown errors with default values', () => {
      const error = new Error('Some unexpected error')
      const result = categorizeError(error)

      expect(result.type).toBe('unknown')
      expect(result.severity).toBe('medium')
      expect(result.userMessage).toBe('予期しないエラーが発生しました。しばらく待ってから再度お試しください。')
      expect(result.actionable).toBe(false)
      expect(result.retryable).toBe(true)
      expect(result.message).toBe('Some unexpected error')
    })

    it('should handle string errors', () => {
      const result = categorizeError('String error message')

      expect(result.type).toBe('unknown')
      expect(result.message).toBe('String error message')
      expect(result.retryable).toBe(true)
    })

    it('should handle null/undefined errors', () => {
      const nullResult = categorizeError(null)
      const undefinedResult = categorizeError(undefined)

      expect(nullResult.type).toBe('unknown')
      expect(nullResult.message).toBe('Unknown error occurred')
      expect(undefinedResult.type).toBe('unknown')
      expect(undefinedResult.message).toBe('Unknown error occurred')
    })

    it('should be case insensitive', () => {
      const error = new Error('NETWORK CONNECTION FAILED')
      const result = categorizeError(error)

      expect(result.type).toBe('network')
    })
  })

  describe('getErrorMessageProps', () => {
    it('should return proper props for network error', () => {
      const error = new Error('Connection timeout')
      const props = getErrorMessageProps(error)

      expect(props.message).toBe('インターネット接続を確認してください。オフラインでも基本機能は利用できます。')
      expect(props.type).toBe('network')
      expect(props.severity).toBe('medium')
      expect(props.actionable).toBe(true)
      expect(props.retryable).toBe(true)
    })

    it('should return proper props for validation error', () => {
      const error = new Error('Validation failed')
      const props = getErrorMessageProps(error)

      expect(props.message).toBe('入力内容を確認してください。')
      expect(props.type).toBe('validation')
      expect(props.severity).toBe('low')
      expect(props.actionable).toBe(true)
      expect(props.retryable).toBe(false)
    })

    it('should return proper props for unknown error', () => {
      const error = new Error('Unknown problem')
      const props = getErrorMessageProps(error)

      expect(props.message).toBe('予期しないエラーが発生しました。しばらく待ってから再度お試しください。')
      expect(props.type).toBe('unknown')
      expect(props.severity).toBe('medium')
      expect(props.actionable).toBe(false)
      expect(props.retryable).toBe(true)
    })
  })

  describe('logError', () => {
    it('should log error in development mode', () => {
      process.env.NODE_ENV = 'development'
      const error = new Error('Test error')

      logError(error)

      expect(mockConsoleGroup).toHaveBeenCalledWith('🚨 Error ')
      expect(mockConsoleError).toHaveBeenCalledWith('Original error:', error)
      expect(mockConsoleLog).toHaveBeenCalled()
      expect(mockConsoleGroupEnd).toHaveBeenCalled()
    })

    it('should log error with context', () => {
      process.env.NODE_ENV = 'development'
      const error = new Error('Test error')

      logError(error, 'authentication module')

      expect(mockConsoleGroup).toHaveBeenCalledWith('🚨 Error in authentication module')
      expect(mockConsoleError).toHaveBeenCalledWith('Original error:', error)
    })

    it('should not log in production mode', () => {
      process.env.NODE_ENV = 'production'
      const error = new Error('Test error')

      logError(error)

      expect(mockConsoleGroup).not.toHaveBeenCalled()
      expect(mockConsoleError).not.toHaveBeenCalled()
      expect(mockConsoleLog).not.toHaveBeenCalled()
    })

    it('should handle non-error objects', () => {
      process.env.NODE_ENV = 'development'
      const errorObj = { message: 'Custom error object' }

      logError(errorObj, 'test context')

      expect(mockConsoleGroup).toHaveBeenCalledWith('🚨 Error in test context')
      expect(mockConsoleError).toHaveBeenCalledWith('Original error:', errorObj)
    })
  })

  describe('isRetryableError', () => {
    it('should return true for network errors', () => {
      const error = new Error('Network connection failed')
      expect(isRetryableError(error)).toBe(true)
    })

    it('should return true for unknown errors', () => {
      const error = new Error('Some random error')
      expect(isRetryableError(error)).toBe(true)
    })

    it('should return false for validation errors', () => {
      const error = new Error('Invalid input')
      expect(isRetryableError(error)).toBe(false)
    })

    it('should return false for auth errors', () => {
      const error = new Error('Unauthorized')
      expect(isRetryableError(error)).toBe(false)
    })

    it('should return false for audio errors', () => {
      const error = new Error('Audio playback failed')
      expect(isRetryableError(error)).toBe(false)
    })

    it('should return false for storage errors', () => {
      const error = new Error('Storage quota exceeded')
      expect(isRetryableError(error)).toBe(false)
    })

    it('should handle null errors', () => {
      expect(isRetryableError(null)).toBe(true) // Default unknown error is retryable
    })
  })

  describe('getErrorSeverity', () => {
    it('should return correct severity for network errors', () => {
      const error = new Error('Network timeout')
      expect(getErrorSeverity(error)).toBe('medium')
    })

    it('should return correct severity for validation errors', () => {
      const error = new Error('Invalid data')
      expect(getErrorSeverity(error)).toBe('low')
    })

    it('should return correct severity for audio errors', () => {
      const error = new Error('Audio context failed')
      expect(getErrorSeverity(error)).toBe('low')
    })

    it('should return correct severity for auth errors', () => {
      const error = new Error('Authentication failed')
      expect(getErrorSeverity(error)).toBe('medium')
    })

    it('should return correct severity for storage errors', () => {
      const error = new Error('Storage error')
      expect(getErrorSeverity(error)).toBe('medium')
    })

    it('should return default severity for unknown errors', () => {
      const error = new Error('Unknown error')
      expect(getErrorSeverity(error)).toBe('medium')
    })

    it('should handle non-error objects', () => {
      expect(getErrorSeverity('string error')).toBe('medium')
      expect(getErrorSeverity(null)).toBe('medium')
      expect(getErrorSeverity({ custom: 'error' })).toBe('medium')
    })
  })

  describe('Edge cases and error handling', () => {
    it('should handle errors with mixed case keywords', () => {
      const error = new Error('AUDIO playback FAILED')
      const result = categorizeError(error)
      expect(result.type).toBe('audio')
    })

    it('should handle empty error messages', () => {
      const error = new Error('')
      const result = categorizeError(error)
      expect(result.type).toBe('unknown')
      expect(result.message).toBe('')
    })

    it('should handle errors with multiple matching keywords', () => {
      const error = new Error('Network auth validation failed')
      // Should match the first category found (network)
      const result = categorizeError(error)
      expect(result.type).toBe('network')
    })

    it('should preserve original error message', () => {
      const originalMessage = 'Very specific network connection error details'
      const error = new Error(originalMessage)
      const result = categorizeError(error)
      
      expect(result.message).toBe(originalMessage)
      expect(result.type).toBe('network')
    })
  })
})
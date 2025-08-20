'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { categorizeError, type ErrorInfo } from '@/utils/errorHandling';

interface ErrorMessageProps {
  error: unknown;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  showIcon?: boolean;
}

const ErrorIcon = ({ type }: { type: ErrorInfo['type'] }) => {
  const iconClass = "w-5 h-5 flex-shrink-0";
  
  switch (type) {
    case 'network':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'audio':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      );
    case 'auth':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      );
    case 'storage':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
      );
    default:
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
};

export function ErrorMessage({ 
  error, 
  onRetry, 
  onDismiss, 
  className = '', 
  showIcon = true 
}: ErrorMessageProps) {
  if (!error) return null;

  const errorInfo = categorizeError(error);
  
  const severityStyles = {
    low: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
    medium: 'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-200',
    high: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
  };

  const buttonStyles = {
    low: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:hover:bg-yellow-700 dark:text-yellow-100',
    medium: 'bg-orange-100 hover:bg-orange-200 text-orange-800 dark:bg-orange-800 dark:hover:bg-orange-700 dark:text-orange-100',
    high: 'bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-800 dark:hover:bg-red-700 dark:text-red-100',
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={`
          rounded-lg border p-4 ${severityStyles[errorInfo.severity]} ${className}
        `}
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          {showIcon && (
            <div className="flex-shrink-0 mt-0.5">
              <ErrorIcon type={errorInfo.type} />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              {errorInfo.userMessage}
            </p>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-2">
                <summary className="text-xs cursor-pointer opacity-70 hover:opacity-100">
                  開発者情報
                </summary>
                <pre className="text-xs mt-1 p-2 bg-black/10 rounded overflow-auto">
                  {errorInfo.message}
                </pre>
              </details>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {errorInfo.retryable && onRetry && (
              <button
                onClick={onRetry}
                className={`
                  px-3 py-1 text-xs font-medium rounded-md transition-colors
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current
                  ${buttonStyles[errorInfo.severity]}
                `}
                aria-label="再試行"
              >
                再試行
              </button>
            )}
            
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-current opacity-70 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current rounded"
                aria-label="エラーメッセージを閉じる"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * 複数のエラーを表示するコンテナコンポーネント
 */
interface ErrorContainerProps {
  errors: unknown[];
  onRetry?: (index: number) => void;
  onDismiss?: (index: number) => void;
  className?: string;
}

export function ErrorContainer({ errors, onRetry, onDismiss, className = '' }: ErrorContainerProps) {
  const validErrors = errors.filter(Boolean);
  
  if (validErrors.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`} role="region" aria-label="エラー一覧">
      {validErrors.map((error, index) => (
        <ErrorMessage
          key={index}
          error={error}
          onRetry={onRetry ? () => onRetry(index) : undefined}
          onDismiss={onDismiss ? () => onDismiss(index) : undefined}
        />
      ))}
    </div>
  );
}
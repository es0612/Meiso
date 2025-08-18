'use client'

import React, { useState } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { AuthModal } from './AuthModal'

interface AnonymousUserPromptProps {
  sessionCount?: number
  onDismiss?: () => void
}

export function AnonymousUserPrompt({ sessionCount = 0, onDismiss }: AnonymousUserPromptProps) {
  const { isAnonymous } = useAuthContext()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'convert'>('convert')
  const [isDismissed, setIsDismissed] = useState(false)

  // Don't show if user is authenticated or has dismissed
  if (!isAnonymous || isDismissed) {
    return null
  }

  // Show after 3 sessions or more
  const shouldShow = sessionCount >= 3

  if (!shouldShow) {
    return null
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.()
  }

  const handleCreateAccount = () => {
    setAuthMode('convert')
    setShowAuthModal(true)
  }

  const handleSignIn = () => {
    setAuthMode('signin')
    setShowAuthModal(true)
  }

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-40">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              瞑想履歴を保存しませんか？
            </h3>
            <p className="text-xs text-gray-600">
              アカウントを作成すると、瞑想履歴がクラウドに保存され、他のデバイスからもアクセスできます。
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="閉じる"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCreateAccount}
            className="flex-1 bg-blue-600 text-white text-xs py-2 px-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            アカウント作成
          </button>
          <button
            onClick={handleSignIn}
            className="flex-1 bg-gray-100 text-gray-700 text-xs py-2 px-3 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            ログイン
          </button>
        </div>

        <div className="mt-2 text-center">
          <button
            onClick={handleDismiss}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            後で
          </button>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </>
  )
}
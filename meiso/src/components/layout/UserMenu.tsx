'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { useUserProfile } from '@/hooks/useUserProfile'
import { AuthModal } from '@/components/auth/AuthModal'
import { UserProfileSettings } from '@/components/auth/UserProfileSettings'

export function UserMenu() {
  const { user, isAnonymous, signInAnonymously } = useAuthContext()
  const { profile } = useUserProfile()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'convert'>('signin')
  const menuRef = useRef<HTMLDivElement>(null)

  // Auto sign in anonymously if no user
  useEffect(() => {
    if (!user) {
      signInAnonymously().catch(console.error)
    }
  }, [user, signInAnonymously])

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignIn = () => {
    setAuthMode('signin')
    setShowAuthModal(true)
    setIsMenuOpen(false)
  }

  const handleSignUp = () => {
    setAuthMode('signup')
    setShowAuthModal(true)
    setIsMenuOpen(false)
  }

  const handleCreateAccount = () => {
    setAuthMode('convert')
    setShowAuthModal(true)
    setIsMenuOpen(false)
  }

  const handleSettings = () => {
    setShowSettings(true)
    setIsMenuOpen(false)
  }

  const getUserDisplayName = () => {
    if (isAnonymous) return 'ゲスト'
    return profile?.displayName || user?.email?.split('@')[0] || 'ユーザー'
  }

  const getUserInitial = () => {
    const displayName = getUserDisplayName()
    return displayName.charAt(0).toUpperCase()
  }

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="ユーザーメニュー"
        >
          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
            {getUserInitial()}
          </div>
          <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
            {getUserDisplayName()}
          </span>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
            <div className="py-1">
              {isAnonymous ? (
                <>
                  <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    匿名ユーザー
                  </div>
                  <button
                    onClick={handleCreateAccount}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    アカウント作成
                  </button>
                  <button
                    onClick={handleSignIn}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    ログイン
                  </button>
                  <div className="border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleSettings}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      設定
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    {user?.email}
                  </div>
                  <button
                    onClick={handleSettings}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    プロフィール・設定
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />

      <UserProfileSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  )
}
'use client'

import React, { useState } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { useUserProfile } from '@/hooks/useUserProfile'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'signin' | 'signup' | 'convert'
  onModeChange: (mode: 'signin' | 'signup' | 'convert') => void
}

export function AuthModal({ isOpen, onClose, mode, onModeChange }: AuthModalProps) {
  const { signIn, signUp, convertAnonymousUser, loading } = useAuthContext()
  const { syncLocalToCloud } = useUserProfile()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
  }

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('メールアドレスとパスワードを入力してください')
      return false
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      setError('有効なメールアドレスを入力してください')
      return false
    }

    if (formData.password.length < 6) {
      setError('パスワードは6文字以上で入力してください')
      return false
    }

    if ((mode === 'signup' || mode === 'convert') && formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    setError(null)

    try {
      if (mode === 'signin') {
        await signIn(formData.email, formData.password)
      } else if (mode === 'signup') {
        await signUp(formData.email, formData.password, formData.displayName)
      } else if (mode === 'convert') {
        await convertAnonymousUser(formData.email, formData.password, formData.displayName)
        // Sync local data to cloud after conversion
        await syncLocalToCloud()
      }
      
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTitle = () => {
    switch (mode) {
      case 'signin': return 'ログイン'
      case 'signup': return 'アカウント作成'
      case 'convert': return 'アカウントを作成して履歴を保存'
      default: return 'ログイン'
    }
  }

  const getSubmitText = () => {
    if (isSubmitting) return '処理中...'
    switch (mode) {
      case 'signin': return 'ログイン'
      case 'signup': return 'アカウント作成'
      case 'convert': return 'アカウント作成'
      default: return 'ログイン'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">{getTitle()}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="閉じる"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {mode === 'convert' && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              アカウントを作成すると、瞑想履歴がクラウドに保存され、他のデバイスからもアクセスできるようになります。
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {(mode === 'signup' || mode === 'convert') && (
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                表示名（任意）
              </label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="山田太郎"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              パスワード
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              minLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="6文字以上"
            />
          </div>

          {(mode === 'signup' || mode === 'convert') && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                パスワード確認
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="パスワードを再入力"
              />
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {getSubmitText()}
          </button>
        </form>

        <div className="mt-4 text-center">
          {mode === 'signin' ? (
            <p className="text-sm text-gray-600">
              アカウントをお持ちでない方は{' '}
              <button
                onClick={() => onModeChange('signup')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                こちら
              </button>
            </p>
          ) : mode === 'signup' ? (
            <p className="text-sm text-gray-600">
              既にアカウントをお持ちの方は{' '}
              <button
                onClick={() => onModeChange('signin')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                こちら
              </button>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
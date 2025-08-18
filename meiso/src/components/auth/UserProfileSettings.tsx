'use client'

import React, { useState, useEffect } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { useUserProfile } from '@/hooks/useUserProfile'
import type { UserPreferences } from '@/types'

interface UserProfileSettingsProps {
  isOpen: boolean
  onClose: () => void
}

export function UserProfileSettings({ isOpen, onClose }: UserProfileSettingsProps) {
  const { user, signOut, isAnonymous } = useAuthContext()
  const { profile, updateProfile, updatePreferences, loading, error } = useUserProfile()
  
  const [displayName, setDisplayName] = useState('')
  const [preferences, setPreferences] = useState<UserPreferences>({
    defaultScript: 'basic-breathing',
    audioEnabled: true,
    volume: 0.7,
    notifications: false,
    theme: 'auto'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '')
      setPreferences(profile.preferences)
    }
  }, [profile])

  if (!isOpen) return null

  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayName(e.target.value)
  }

  const handlePreferenceChange = (key: keyof UserPreferences, value: string | number | boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  const handleSaveProfile = async () => {
    if (isAnonymous) return

    setIsSubmitting(true)
    setSuccessMessage(null)

    try {
      await updateProfile({ displayName: displayName || undefined })
      setSuccessMessage('プロフィールを更新しました')
    } catch (err) {
      console.error('Failed to update profile:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSavePreferences = async () => {
    setIsSubmitting(true)
    setSuccessMessage(null)

    try {
      await updatePreferences(preferences)
      setSuccessMessage('設定を保存しました')
    } catch (err) {
      console.error('Failed to update preferences:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      onClose()
    } catch (err) {
      console.error('Failed to sign out:', err)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">設定</h2>
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
        </div>

        <div className="p-6 space-y-6">
          {/* User Info Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">ユーザー情報</h3>
            
            {isAnonymous ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  匿名ユーザーとしてご利用中です。アカウントを作成すると履歴がクラウドに保存されます。
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                    表示名
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="displayName"
                      value={displayName}
                      onChange={handleDisplayNameChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="表示名を入力"
                    />
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      保存
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Preferences Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">瞑想設定</h3>

            <div>
              <label htmlFor="defaultScript" className="block text-sm font-medium text-gray-700 mb-1">
                デフォルトスクリプト
              </label>
              <select
                id="defaultScript"
                value={preferences.defaultScript}
                onChange={(e) => handlePreferenceChange('defaultScript', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="basic-breathing">基本の呼吸法</option>
                <option value="mindfulness">マインドフルネス</option>
                <option value="focus">集中力向上</option>
                <option value="relaxation">リラクゼーション</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="audioEnabled" className="text-sm font-medium text-gray-700">
                音声ガイダンス
              </label>
              <button
                type="button"
                onClick={() => handlePreferenceChange('audioEnabled', !preferences.audioEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  preferences.audioEnabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.audioEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {preferences.audioEnabled && (
              <div>
                <label htmlFor="volume" className="block text-sm font-medium text-gray-700 mb-1">
                  音量: {Math.round(preferences.volume * 100)}%
                </label>
                <input
                  type="range"
                  id="volume"
                  min="0"
                  max="1"
                  step="0.1"
                  value={preferences.volume}
                  onChange={(e) => handlePreferenceChange('volume', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            )}

            <div>
              <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">
                テーマ
              </label>
              <select
                id="theme"
                value={preferences.theme}
                onChange={(e) => handlePreferenceChange('theme', e.target.value as 'light' | 'dark' | 'auto')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="auto">自動</option>
                <option value="light">ライト</option>
                <option value="dark">ダーク</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="notifications" className="text-sm font-medium text-gray-700">
                通知
              </label>
              <button
                type="button"
                onClick={() => handlePreferenceChange('notifications', !preferences.notifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  preferences.notifications ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <button
              onClick={handleSavePreferences}
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? '保存中...' : '設定を保存'}
            </button>
          </div>

          {/* Statistics Section */}
          {profile && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">統計情報</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-md">
                  <div className="text-2xl font-bold text-blue-600">{profile.statistics.totalSessions}</div>
                  <div className="text-sm text-gray-600">総セッション数</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-md">
                  <div className="text-2xl font-bold text-green-600">{profile.statistics.currentStreak}</div>
                  <div className="text-sm text-gray-600">連続日数</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-md col-span-2">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(profile.statistics.totalDuration / 60)}分
                  </div>
                  <div className="text-sm text-gray-600">総瞑想時間</div>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {successMessage && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Sign Out */}
          {!isAnonymous && (
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleSignOut}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                ログアウト
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
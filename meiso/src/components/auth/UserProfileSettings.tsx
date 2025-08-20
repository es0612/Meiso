'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthContext } from '@/contexts/AuthContext'
import { useUserProfile } from '@/hooks/useUserProfile'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { VisualGuidancePreview } from '@/components/meditation/VisualGuidance'
import { logError } from '@/utils/errorHandling'
import type { UserPreferences } from '@/types'

interface UserProfileSettingsProps {
  isOpen: boolean
  onClose: () => void
}

interface FormErrors {
  displayName?: string
  preferences?: string
  general?: string
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
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // プロフィール読み込み時の初期化
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '')
      setPreferences(profile.preferences)
      setHasUnsavedChanges(false)
    }
  }, [profile])

  // 変更検知
  useEffect(() => {
    if (profile) {
      const hasDisplayNameChange = displayName !== (profile.displayName || '')
      const hasPreferencesChange = JSON.stringify(preferences) !== JSON.stringify(profile.preferences)
      setHasUnsavedChanges(hasDisplayNameChange || hasPreferencesChange)
    }
  }, [displayName, preferences, profile])

  // エラーメッセージの自動クリア
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  // フォームバリデーション
  const validateForm = useCallback(() => {
    const errors: FormErrors = {}
    
    if (displayName.length > 50) {
      errors.displayName = '表示名は50文字以内で入力してください'
    }
    
    if (preferences.volume < 0 || preferences.volume > 1) {
      errors.preferences = '音量は0から100の範囲で設定してください'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }, [displayName, preferences.volume])

  if (!isOpen) return null

  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setDisplayName(value)
    
    // リアルタイムバリデーション
    if (value.length > 50) {
      setFormErrors(prev => ({ ...prev, displayName: '表示名は50文字以内で入力してください' }))
    } else {
      setFormErrors(prev => ({ ...prev, displayName: undefined }))
    }
  }

  const handlePreferenceChange = (key: keyof UserPreferences, value: string | number | boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
    
    // 音量の場合はリアルタイムバリデーション
    if (key === 'volume' && typeof value === 'number') {
      if (value < 0 || value > 1) {
        setFormErrors(prev => ({ ...prev, preferences: '音量は0から100の範囲で設定してください' }))
      } else {
        setFormErrors(prev => ({ ...prev, preferences: undefined }))
      }
    }
  }

  const handleSaveProfile = async () => {
    if (isAnonymous || !validateForm()) return

    setIsSubmitting(true)
    setSuccessMessage(null)
    setFormErrors(prev => ({ ...prev, general: undefined }))

    try {
      await updateProfile({ displayName: displayName || undefined })
      setSuccessMessage('プロフィールを更新しました')
    } catch (err) {
      logError(err, 'UserProfileSettings.handleSaveProfile')
      setFormErrors(prev => ({ ...prev, general: 'プロフィールの更新に失敗しました' }))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSavePreferences = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    setSuccessMessage(null)
    setFormErrors(prev => ({ ...prev, general: undefined }))

    try {
      await updatePreferences(preferences)
      setSuccessMessage('設定を保存しました')
    } catch (err) {
      logError(err, 'UserProfileSettings.handleSavePreferences')
      setFormErrors(prev => ({ ...prev, general: '設定の保存に失敗しました' }))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      onClose()
    } catch (err) {
      logError(err, 'UserProfileSettings.handleSignOut')
      setFormErrors(prev => ({ ...prev, general: 'ログアウトに失敗しました' }))
    }
  }

  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('保存されていない変更があります。閉じてもよろしいですか？')) {
        onClose()
      }
    } else {
      onClose()
    }
  }

  // キーボードナビゲーション
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-title"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* ヘッダー */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
              <div className="flex justify-between items-center">
                <h2 id="settings-title" className="text-xl font-semibold text-gray-900 dark:text-white">
                  設定
                </h2>
                <div className="flex items-center gap-2">
                  {hasUnsavedChanges && (
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                      未保存の変更があります
                    </span>
                  )}
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="設定を閉じる"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* エラーメッセージ */}
              {(error || formErrors.general) && (
                <ErrorMessage 
                  error={error || formErrors.general} 
                  onDismiss={() => {
                    setFormErrors(prev => ({ ...prev, general: undefined }))
                  }}
                />
              )}

              {/* 成功メッセージ */}
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
                  </div>
                </motion.div>
              )}

              {/* ユーザー情報セクション */}
              <section aria-labelledby="user-info-title">
                <h3 id="user-info-title" className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  ユーザー情報
                </h3>
                
                {isAnonymous ? (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                          匿名ユーザーとしてご利用中
                        </p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                          アカウントを作成すると履歴がクラウドに保存され、複数のデバイスで同期できます。
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        メールアドレス
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                        aria-describedby="email-help"
                      />
                      <p id="email-help" className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        メールアドレスは変更できません
                      </p>
                    </div>

                    <div>
                      <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        表示名
                      </label>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <input
                            type="text"
                            id="displayName"
                            value={displayName}
                            onChange={handleDisplayNameChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                              formErrors.displayName 
                                ? 'border-red-300 dark:border-red-600' 
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                            placeholder="表示名を入力"
                            maxLength={50}
                            aria-describedby={formErrors.displayName ? 'displayName-error' : 'displayName-help'}
                          />
                          {formErrors.displayName && (
                            <p id="displayName-error" className="text-xs text-red-600 dark:text-red-400 mt-1">
                              {formErrors.displayName}
                            </p>
                          )}
                          <p id="displayName-help" className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {displayName.length}/50文字
                          </p>
                        </div>
                        <button
                          onClick={handleSaveProfile}
                          disabled={isSubmitting || !!formErrors.displayName}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
                        >
                          {isSubmitting ? '保存中...' : '保存'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* 瞑想設定セクション */}
              <section aria-labelledby="meditation-settings-title">
                <h3 id="meditation-settings-title" className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  瞑想設定
                </h3>

                <div className="space-y-6">
                  {/* デフォルトスクリプト */}
                  <div>
                    <label htmlFor="defaultScript" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      デフォルトスクリプト
                    </label>
                    <select
                      id="defaultScript"
                      value={preferences.defaultScript}
                      onChange={(e) => handlePreferenceChange('defaultScript', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      aria-describedby="defaultScript-help"
                    >
                      <option value="basic-breathing">基本の呼吸法</option>
                      <option value="mindfulness">マインドフルネス</option>
                      <option value="focus">集中力向上</option>
                      <option value="relaxation">リラクゼーション</option>
                    </select>
                    <p id="defaultScript-help" className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      瞑想開始時に自動的に選択されるスクリプトです
                    </p>
                  </div>

                  {/* 音声設定 */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label htmlFor="audioEnabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          音声ガイダンス
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          音声による瞑想ガイダンスの有効/無効を切り替えます
                        </p>
                      </div>
                      <button
                        type="button"
                        id="audioEnabled"
                        onClick={() => handlePreferenceChange('audioEnabled', !preferences.audioEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          preferences.audioEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                        }`}
                        role="switch"
                        aria-checked={preferences.audioEnabled}
                        aria-describedby="audioEnabled-description"
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            preferences.audioEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* 音声オフ時の視覚ガイダンスプレビュー */}
                    {!preferences.audioEnabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <VisualGuidancePreview enabled={!preferences.audioEnabled} />
                      </motion.div>
                    )}

                    {/* 音量設定 */}
                    <AnimatePresence>
                      {preferences.audioEnabled && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <label htmlFor="volume" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            音量: {Math.round(preferences.volume * 100)}%
                          </label>
                          <div className="space-y-2">
                            <input
                              type="range"
                              id="volume"
                              min="0"
                              max="1"
                              step="0.1"
                              value={preferences.volume}
                              onChange={(e) => handlePreferenceChange('volume', parseFloat(e.target.value))}
                              className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider focus:outline-none focus:ring-2 focus:ring-blue-500"
                              aria-describedby="volume-help"
                            />
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                              <span>0%</span>
                              <span>50%</span>
                              <span>100%</span>
                            </div>
                            <p id="volume-help" className="text-xs text-gray-500 dark:text-gray-400">
                              音声ガイダンスの音量を調整します
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* テーマ設定 */}
                  <div>
                    <label htmlFor="theme" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      テーマ
                    </label>
                    <select
                      id="theme"
                      value={preferences.theme}
                      onChange={(e) => handlePreferenceChange('theme', e.target.value as 'light' | 'dark' | 'auto')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      aria-describedby="theme-help"
                    >
                      <option value="auto">自動（システム設定に従う）</option>
                      <option value="light">ライト</option>
                      <option value="dark">ダーク</option>
                    </select>
                    <p id="theme-help" className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      アプリの外観テーマを選択します
                    </p>
                  </div>

                  {/* 通知設定 */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="notifications" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        通知
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        瞑想リマインダーなどの通知を受け取ります
                      </p>
                    </div>
                    <button
                      type="button"
                      id="notifications"
                      onClick={() => handlePreferenceChange('notifications', !preferences.notifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        preferences.notifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                      role="switch"
                      aria-checked={preferences.notifications}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences.notifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* 設定保存ボタン */}
                  <div className="pt-4">
                    <button
                      onClick={handleSavePreferences}
                      disabled={isSubmitting || !!formErrors.preferences}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {isSubmitting ? '保存中...' : '設定を保存'}
                    </button>
                  </div>
                </div>
              </section>

              {/* 統計情報セクション */}
              {profile && (
                <section aria-labelledby="statistics-title">
                  <h3 id="statistics-title" className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    統計情報
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {profile.statistics.totalSessions}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">総セッション数</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {profile.statistics.currentStreak}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">連続日数</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg sm:col-span-2 lg:col-span-1">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {Math.round(profile.statistics.totalDuration / 60)}分
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">総瞑想時間</div>
                    </div>
                  </div>
                </section>
              )}

              {/* ログアウト */}
              {!isAnonymous && (
                <section className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleSignOut}
                    className="w-full bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
                  >
                    ログアウト
                  </button>
                </section>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
'use client'

import { useState } from 'react'
import { UserProfileSettings } from '@/components/auth'

export default function SettingsPage() {
  const [showSettings, setShowSettings] = useState(true)

  return (
    <div className="flex-1 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          設定
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            ユーザープロフィール、瞑想設定、音声設定などを管理できます。
          </p>
          <button
            onClick={() => setShowSettings(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            設定を開く
          </button>
        </div>

        <UserProfileSettings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      </div>
    </div>
  )
}
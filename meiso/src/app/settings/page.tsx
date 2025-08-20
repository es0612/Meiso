'use client'

import { UserProfileSettings } from '@/components/auth'

export default function SettingsPage() {
  return (
    <div className="flex-1 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            設定
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            瞑想体験をカスタマイズして、あなたに最適な環境を作りましょう
          </p>
        </header>
        
        <UserProfileSettings
          isOpen={true}
          onClose={() => {}}
        />
      </div>
    </div>
  )
}
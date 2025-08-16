export default function SettingsPage() {
  return (
    <div className="flex-1 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          設定
        </h1>
        
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                音声設定
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-gray-700 dark:text-gray-300">
                    音声ガイダンス
                  </label>
                  <input 
                    type="checkbox" 
                    defaultChecked 
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-gray-700 dark:text-gray-300">
                    音量
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    defaultValue="70"
                    className="w-32"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                表示設定
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-gray-700 dark:text-gray-300">
                    テーマ
                  </label>
                  <select className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="system">システム設定に従う</option>
                    <option value="light">ライトモード</option>
                    <option value="dark">ダークモード</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                通知設定
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-gray-700 dark:text-gray-300">
                    リマインダー通知
                  </label>
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
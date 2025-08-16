export default function HistoryPage() {
  return (
    <div className="flex-1 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          瞑想履歴
        </h1>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              総セッション数
            </h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">0</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              連続日数
            </h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">0</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              総時間
            </h3>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">0分</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              最近のセッション
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              まだ瞑想セッションがありません。最初の瞑想を始めてみましょう！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
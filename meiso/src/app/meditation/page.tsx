export default function MeditationPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          瞑想セッション
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          1分間の瞑想セッションを開始します。リラックスして、深呼吸を始めましょう。
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            瞑想タイマーコンポーネントがここに表示されます
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors">
            瞑想を開始
          </button>
        </div>
      </div>
    </div>
  );
}
'use client';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Logo and description */}
          <div className="text-center md:text-left">
            <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              瞑想
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              忙しいビジネスマンのための1分間瞑想
            </p>
          </div>

          {/* Links */}
          <div className="flex space-x-6 text-sm">
            <a
              href="/privacy"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              プライバシーポリシー
            </a>
            <a
              href="/terms"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              利用規約
            </a>
            <a
              href="/contact"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              お問い合わせ
            </a>
          </div>

          {/* Copyright */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            © {currentYear} 瞑想. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
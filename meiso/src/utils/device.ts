// デバイス情報を取得するユーティリティ関数

/**
 * 現在のデバイス情報を取得
 */
export function getDeviceInfo() {
  if (typeof window === 'undefined') {
    return {
      userAgent: 'Server',
      screenSize: '0x0',
    };
  }

  return {
    userAgent: navigator.userAgent,
    screenSize: `${window.screen.width}x${window.screen.height}`,
  };
}

/**
 * ブラウザの種類を判定
 */
export function getBrowserType(): string {
  if (typeof window === 'undefined') return 'unknown';

  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes('chrome')) return 'chrome';
  if (userAgent.includes('firefox')) return 'firefox';
  if (userAgent.includes('safari')) return 'safari';
  if (userAgent.includes('edge')) return 'edge';

  return 'other';
}

/**
 * モバイルデバイスかどうかを判定
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * タッチデバイスかどうかを判定
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;

  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * 画面サイズのカテゴリを取得
 */
export function getScreenSizeCategory(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';

  const width = window.innerWidth;

  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

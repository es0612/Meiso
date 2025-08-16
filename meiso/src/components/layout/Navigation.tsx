'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavigationProps {
  mobile?: boolean;
  onItemClick?: () => void;
}

const navigationItems = [
  { href: '/', label: 'ホーム' },
  { href: '/meditation', label: '瞑想' },
  { href: '/history', label: '履歴' },
  { href: '/settings', label: '設定' },
];

export function Navigation({ mobile = false, onItemClick }: NavigationProps) {
  const pathname = usePathname();

  const baseClasses = mobile
    ? 'block px-3 py-2 text-base font-medium rounded-md transition-colors'
    : 'px-3 py-2 text-sm font-medium rounded-md transition-colors';

  return (
    <nav className={mobile ? 'space-y-1' : 'flex space-x-1'}>
      {navigationItems.map((item) => {
        const isActive = pathname === item.href;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              baseClasses,
              isActive
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
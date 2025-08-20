// Set up environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

import { render, screen } from '@testing-library/react';
import { AppLayout } from '../AppLayout';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

// Mock the theme hook
jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'light',
    resolvedTheme: 'light',
    setTheme: jest.fn(),
    toggleTheme: jest.fn(),
  }),
}));

// Mock ThemeProvider
jest.mock('@/contexts/ThemeContext', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useThemeContext: () => ({
    theme: 'light',
    resolvedTheme: 'light',
    setTheme: jest.fn(),
    toggleTheme: jest.fn(),
  }),
}));

describe('AppLayout', () => {
  it('renders header, main content, and footer', () => {
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );

    // Check if main content is rendered
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    
    // Check if navigation items are rendered
    expect(screen.getByText('ホーム')).toBeInTheDocument();
    expect(screen.getByText('履歴')).toBeInTheDocument();
    expect(screen.getByText('設定')).toBeInTheDocument();
    
    // Check if multiple instances of 瞑想 exist (logo, nav, footer)
    expect(screen.getAllByText('瞑想')).toHaveLength(3);
  });

  it('has proper semantic structure', () => {
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );

    expect(screen.getByRole('banner')).toBeInTheDocument(); // header
    expect(screen.getByRole('main')).toBeInTheDocument(); // main
    expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer
  });
});
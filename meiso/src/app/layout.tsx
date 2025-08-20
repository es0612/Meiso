import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppLayout } from '@/components/layout/AppLayout';
import Script from 'next/script';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap', // Optimize font loading
  preload: true,
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap', // Optimize font loading
});

export const metadata: Metadata = {
  title: 'Meiso - 1分瞑想ガイド',
  description: '忙しいビジネスマンのための1分間瞑想アプリ。短時間でストレス軽減と集中力向上を実現します。',
  keywords: '瞑想,マインドフルネス,ストレス解消,集中力,ビジネス,リラックス,ウェルネス',
  authors: [{ name: 'Meiso Team' }],
  creator: 'Meiso',
  publisher: 'Meiso',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Meiso',
    startupImage: [
      {
        url: '/startup-640x1136.png',
        media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/startup-750x1334.png',
        media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/startup-1242x2208.png',
        media: '(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)',
      },
    ],
  },
  icons: {
    icon: [
      { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://meiso.app',
    siteName: 'Meiso',
    title: 'Meiso - 1分瞑想ガイド',
    description: '忙しいビジネスマンのための1分間瞑想アプリ。短時間でストレス軽減と集中力向上を実現します。',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Meiso - 瞑想アプリ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Meiso - 1分瞑想ガイド',
    description: '忙しいビジネスマンのための1分間瞑想アプリ',
    images: ['/twitter-image.png'],
    creator: '@meiso_app',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  other: {
    'msapplication-TileColor': '#2563eb',
    'msapplication-config': '/browserconfig.xml',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        {/* DNS Prefetch for external resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Preconnect to critical third-party origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* Critical CSS preload */}
        <link rel="preload" href="/_next/static/css/app.css" as="style" />
        
        {/* Resource hints for performance */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <AppLayout>
              {children}
            </AppLayout>
          </AuthProvider>
        </ThemeProvider>
        
        {/* Performance monitoring script */}
        <Script
          id="performance-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Initialize performance tracking immediately
              if (typeof window !== 'undefined') {
                // Preload critical resources
                const criticalResources = [
                  { href: '/manifest.json', as: 'manifest' },
                  { href: '/icon-192x192.png', as: 'image' }
                ];
                
                criticalResources.forEach(({ href, as }) => {
                  const link = document.createElement('link');
                  link.rel = 'preload';
                  link.href = href;
                  link.as = as;
                  document.head.appendChild(link);
                });
                
                // Set up font-display optimization
                const style = document.createElement('style');
                style.textContent = \`
                  @font-face {
                    font-family: 'Geist';
                    font-display: swap;
                  }
                  @font-face {
                    font-family: 'Geist Mono';
                    font-display: swap;
                  }
                \`;
                document.head.appendChild(style);
              }
            `,
          }}
        />
      </body>
    </html>
  );
}

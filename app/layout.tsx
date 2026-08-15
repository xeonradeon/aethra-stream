import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AETHRA STREAM - Advanced Entertainment Hub',
  description: 'Platform streaming premium dengan koleksi anime, donghua, dan komik terbaik',
  keywords: 'streaming, anime, donghua, film, komik, movie, AETHRA',
  manifest: '/manifest.json',
  icons: {
    icon: '/as.jpg',
    shortcut: '/as.jpg',
    apple: '/as.jpg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'AETHRA STREAM',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#d4a847',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Orbitron:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/as.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/as.jpg" />
        <link rel="manifest" href="/manifest.json" />
        
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AETHRA STREAM" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="AETHRA STREAM" />
        <meta name="msapplication-TileColor" content="#0a0a0a" />
        <meta name="theme-color" content="#d4a847" />
      </head>
      <body className="min-h-screen bg-[#0a0a0a] text-[#e8e0d4] font-body antialiased">
        {children}
      </body>
    </html>
  );
}

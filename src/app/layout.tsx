import type { Metadata, Viewport } from 'next';
import './globals.css';
import { FinanceProvider } from '@/context/FinanceContext';

export const metadata: Metadata = {
  title: 'Finanzas',
  description: 'Control Financiero Personal y Nómina Banamex',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Finanzas',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#1E3A8A',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Finanzas" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="bg-app-bg text-slate-900 selection:bg-blue-100 selection:text-blue-900 antialiased min-h-screen">
        <FinanceProvider>
          {children}
        </FinanceProvider>
      </body>
    </html>
  );
}


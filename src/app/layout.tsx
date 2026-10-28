import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'M.T. DÖNER | Orijinal Berlin Usulü Döner',
  description: 'Berlin sokak lezzetlerinin fenomeni: Özel üçgen susamlı ekmek, yaprak döner ve efsanevi Berlin sosları. QR Dijital Menü.',
  keywords: ['MT Döner', 'Berlin Döner', 'Ekmek Arası Döner', 'Kräuter Sos', 'Knoblauch Sos', 'Scharf Sos', 'QR Menü'],
  icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a0a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body className="min-h-screen bg-neutral-950 text-neutral-100 antialiased selection:bg-amber-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}

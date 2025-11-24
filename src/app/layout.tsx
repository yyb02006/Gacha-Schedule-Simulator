import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { spoqaHanSansNeo } from '#/fonts/spoqa';
import { cls } from '#/libs/utils';
import { Analytics } from '@vercel/analytics/react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: '가챠 일정 시뮬레이터',
  description: '가챠 일정 시뮬레이터',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-clip overflow-y-auto">
      <body
        className={cls(
          geistSans.variable,
          geistMono.variable,
          spoqaHanSansNeo.variable,
          'antialiased',
          'mb-32',
        )}
      >
        {children}
        <div id="portal-root" />
        <Analytics />
      </body>
    </html>
  );
}

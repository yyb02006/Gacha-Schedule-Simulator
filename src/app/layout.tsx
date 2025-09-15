import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { spoqaHanSansNeo } from '#/fonts/spoqa';
import { cls } from '#/libs/utils';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
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
    <html lang="en">
      <body
        className={cls(
          geistSans.variable,
          geistMono.variable,
          'antialiased',
          spoqaHanSansNeo.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}

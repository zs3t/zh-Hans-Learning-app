// app/layout.tsx

import './globals.css';
import localFont from "next/font/local";
import { cn } from "@/lib/utils";
import AudioUnlocker from '../components/AudioUnlocker';
import { Toaster } from 'react-hot-toast';

// We are making sure it points to the correct 'opsz' filename
const fontSans = localFont({
  src: './fonts/Inter-VariableFont_opsz,wght.ttf', 
  variable: "--font-sans",
  display: 'swap',
});

export const metadata = {
  title: '汉字学习网站',
  description: '轻松学习汉字的笔画、发音和词语',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <AudioUnlocker />
        {/* 将 Toaster 放在 children 前面，确保它在顶层 */}
        <Toaster position="top-center" />  {/* <-- 修改这里 */}
        {children}
      </body>
    </html>
  );
}

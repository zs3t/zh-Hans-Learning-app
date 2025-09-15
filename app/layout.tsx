// app/layout.tsx

import './globals.css';
import '../styles/hanzi-writer.css'; // 核心修复：加载 HanziWriter 的样式
import localFont from "next/font/local";
import { cn } from "@/lib/utils";
import AudioUnlocker from '../components/AudioUnlocker';
import { Toaster } from 'react-hot-toast';

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
  // 暗色模式开关，可以后续动态替换为 state 或 next-themes
  const isDarkMode = false;

  return (
    <html
      lang="zh-CN"
      className={isDarkMode ? "dark" : ""}
      suppressHydrationWarning
    >
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <AudioUnlocker />
        <Toaster position="top-center" />
        {children}
      </body>
    </html>
  );
}
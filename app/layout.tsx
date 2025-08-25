import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '中文学习应用 - 汉字学习',
  description: '一个基于 Next.js 的交互式中文汉字学习应用，支持汉字显示、拼音学习、笔画动画和语音朗读',
  keywords: '中文学习,汉字学习,拼音,笔画,语音朗读',
  authors: [{ name: '中文学习应用' }],
}

// Next.js 14+ 新规范：单独导出 viewport
export const viewport = 'width=device-width, initial-scale=1'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}

import './styles.css'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: '百度照片直播',
  description: '百度照片直播 FTP 联机拍摄交互演示',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#2468f2',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="zh-CN"><body>{children}</body></html>
}

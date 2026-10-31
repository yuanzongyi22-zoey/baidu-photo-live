import type { Metadata, Viewport } from 'next'
import ChessGuide from '../../../src/chess/ChessGuide'
import '../chess.css'

export const metadata: Metadata = {
  title: 'AI智能棋盘 · ¥89.90 购买与使用指南',
  description: 'AI智能棋盘顾客版：查看使用说明与17款玩法，微信支付89.90元后填写收货信息。',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f6f6f1',
}

export default function CustomerChessPage() {
  return <ChessGuide customer />
}

import type { Metadata, Viewport } from 'next'
import ChessGuide from '../../src/chess/ChessGuide'
import './chess.css'

export const metadata: Metadata = {
  title: 'AI智能棋盘 · 方寸之间，大有玩头',
  description: 'AI智能棋盘数字使用指南：四步上手、按键说明、17 款游戏与 AI 对战、常见问题及使用体验反馈。',
}
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#f6f6f1' }
export default function ChessPage() { return <ChessGuide /> }

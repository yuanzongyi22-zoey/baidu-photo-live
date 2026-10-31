'use client'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { createClient } from '@supabase/supabase-js'
import QRCode from 'qrcode'
import BoardArt from './BoardArt'
import { controls, faqs, games, questions, type Game } from './content'

const DRAFT_KEY = 'ai-chess-feedback-v1'
const ORDER_FORM_URL = 'https://my.feishu.cn/share/base/form/shrcnFItdw9scAYgkxSBOqBpwtb'
const backendUrl = process.env.NEXT_PUBLIC_CHESS_SUPABASE_URL
const backendKey = process.env.NEXT_PUBLIC_CHESS_SUPABASE_ANON_KEY
const feedbackClient = backendUrl && backendKey ? createClient(backendUrl, backendKey, { auth: { persistSession: false, autoRefreshToken: false } }) : null

export function isPublicUrl(value: string) {
  try {
    const url = new URL(value), host = url.hostname.toLowerCase()
    return url.protocol === 'https:' && !url.username && !url.password && host.includes('.') && !/\.(local|localhost|test)$/.test(host) &&
      !/^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host) && !host.includes(':')
  } catch { return false }
}
function ShareDialog() {
  const dialog = useRef<HTMLDialogElement>(null)
  const [url, setUrl] = useState(''), [qr, setQr] = useState(''), [error, setError] = useState('')
  useEffect(() => {
    const configured = process.env.NEXT_PUBLIC_CHESS_GUIDE_URL || window.location.href.split(/[?#]/)[0]
    if (isPublicUrl(configured)) setUrl(configured)
  }, [])
  useEffect(() => {
    let cancelled = false
    setQr(''); setError('')
    if (isPublicUrl(url)) QRCode.toDataURL(url, { width: 1200, margin: 4, errorCorrectionLevel: 'M', color: { dark: '#171717', light: '#ffffff' } })
      .then(image => { if (!cancelled) setQr(image) }).catch(() => { if (!cancelled) setError('二维码生成失败，请稍后重试。') })
    return () => { cancelled = true }
  }, [url])
  return <><button className="ch-share" onClick={() => dialog.current?.showModal()}><span aria-hidden="true">▦</span> 扫码带走</button><dialog className="ch-dialog" ref={dialog} onClick={e => { if (e.target === e.currentTarget) dialog.current?.close() }}><button className="ch-close" aria-label="关闭分享窗口" onClick={() => dialog.current?.close()}>×</button><span className="ch-eyebrow">TAKE THE PLAYBOOK</span><h2>小小二维码，<br/>装下所有玩法。</h2><p>扫码打开这份指南，无需安装 App。</p>{qr ? <img className="ch-qr" src={qr} alt="AI智能棋盘使用说明二维码" width="240" height="240"/> : <div className="ch-qr-placeholder"><span aria-hidden="true">▦</span>等待正式页面地址<small>上线后即可生成印刷用二维码</small></div>}<label className="ch-url">说明书的公网 HTTPS 地址<input type="url" value={url} placeholder="https://你的域名/chess/" onChange={e => setUrl(e.target.value.trim())}/></label>{url && !isPublicUrl(url) && <p role="alert">请输入公网 HTTPS 地址，本机或局域网地址不适合印刷分享。</p>}{qr && <a className="ch-button" href={qr} download="AI智能棋盘-使用说明二维码.png">下载高清二维码 <span>↓</span></a>}<p className="ch-fine">二维码指向上方地址。请先确认网页已经发布，并用手机实测，再印刷。</p>{error && <p role="alert">{error}</p>}</dialog></>
}
export function ExperienceForm() {
  const [answers, setAnswers] = useState(['', '', '', '']), [comment, setComment] = useState(''), [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sending' | 'received'>('idle'), [message, setMessage] = useState('')
  const submitting = useRef(false)
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null')
      if (saved && Array.isArray(saved.answers) && saved.answers.length === 4) {
        setAnswers(questions.map((q, i) => (q.options as readonly string[]).includes(saved.answers[i]) ? saved.answers[i] : ''))
        setComment(typeof saved.comment === 'string' ? saved.comment.slice(0, 500) : '')
      }
    } catch { /* Storage can be blocked; the form still works. */ }
  }, [])
  function saveDraft() {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ answers, comment })); setMessage('草稿已保存在此浏览器，尚未发送给产品团队。') }
    catch { setMessage('浏览器无法保存草稿，请复制建议文字自行保留。') }
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (submitting.current) return
    if (!feedbackClient) { saveDraft(); return }
    if (answers.some(v => !v) || !consent) { setMessage('请完成前 4 题，并勾选同意提交匿名反馈。'); return }
    submitting.current = true; setStatus('sending'); setMessage('')
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 15000)
    try {
      const { error } = await feedbackClient.from('chess_feedback').insert({ product: 'AI智能棋盘', guide_version: '1.0', ease: answers[0], favorite: answers[1], response: answers[2], rating: Number.parseInt(answers[3]), suggestion: comment.trim() }).abortSignal(controller.signal)
      if (error) throw error
      setStatus('received')
      try { localStorage.removeItem(DRAFT_KEY) } catch { /* Submission was already confirmed. */ }
    } catch { setStatus('idle'); setMessage('暂时未能确认提交，你的填写内容仍在。请检查网络后重试。') }
    finally { clearTimeout(timer); submitting.current = false }
  }
  return <section className="ch-feedback" id="feedback" aria-labelledby="feedback-heading"><div className="ch-feedback-intro"><span className="ch-eyebrow">05 / YOUR NEXT MOVE</span><h2 id="feedback-heading">这一局，<br/>感觉<span>怎么样？</span></h2><p>你的想法，是我们的下一步。<br/>5 个小问题，约 1 分钟。</p><div className="ch-feedback-face" aria-hidden="true">:)</div><p className="ch-fine">匿名反馈，无需姓名或手机号。<br/>{feedbackClient ? '提交后存入产品方配置的体验反馈数据库。' : '收集服务尚未接通，目前仅支持本机保存草稿。'}</p></div>{status === 'received' ? <div className="ch-success" role="status"><span>↗</span><h3>收到，下一局更精彩。</h3><p>反馈已存入产品体验数据库，谢谢你认真玩，也认真分享。</p><a className="ch-button" href="#games">再探索一种玩法 <span>↗</span></a></div> : <form className="ch-form" onSubmit={submit}><fieldset className="ch-form-fields" disabled={status === 'sending'}>{questions.map((q,i) => <fieldset className="ch-question" key={q.title}><legend><span>0{i+1}</span>{q.title}<small>必填</small></legend><div className="ch-options">{q.options.map(option => <label key={option} className={answers[i]===option?'selected':''}><input type="radio" name={`chess-question-${i}`} checked={answers[i]===option} value={option} onChange={()=>{setAnswers(prev=>prev.map((v,n)=>n===i?option:v));setMessage('')}}/><span>{option}</span></label>)}</div></fieldset>)}<label className="ch-comment"><span><b>05</b> 如果可以改进一点，你希望是？<small>选填</small></span><textarea value={comment} maxLength={500} onChange={e=>setComment(e.target.value)} placeholder="比如：多一点玩法、灯光再柔和些，或任何小灵感……" rows={3}/><small className="ch-count">{comment.length} / 500</small></label>{feedbackClient && <label className="ch-consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>同意将以上匿名反馈发送至产品方的 Supabase 数据库，用于产品体验改进。请勿填写个人敏感信息。</span></label>}<button className="ch-button ch-submit" type="submit">{status==='sending'?'正在提交…':feedbackClient?'提交我的体验':'保存体验草稿'}<span aria-hidden="true">↗</span></button>{feedbackClient&&<button className="ch-draft" type="button" onClick={saveDraft}>先保存草稿</button>}</fieldset>{message&&<p className="ch-form-message" role="status">{message}</p>}</form>}</section>
}

export function PurchaseSection() {
  return <section className="ch-purchase" id="purchase" aria-labelledby="purchase-heading">
    <div className="ch-purchase-copy">
      <span className="ch-eyebrow">05 / TAKE ONE HOME</span>
      <h2 id="purchase-heading">把这一局，<br/>带回<span>家。</span></h2>
      <p className="ch-price"><small>到手价</small><b>¥89.90</b></p>
      <p>微信扫码完成付款，再提交收货信息。订单提交后，我们会根据付款备注核款并安排发货。</p>
      <ol>
        <li><span>01</span>微信扫描右侧收款码，支付 ¥89.90</li>
        <li><span>02</span>保留付款记录或支付单号后 6 位</li>
        <li><span>03</span>点击按钮填写姓名、电话和详细地址</li>
      </ol>
      <aside><b>请注意</b>付款与订单提交是两个步骤，网页无法自动核验微信支付结果。付款后务必提交收货信息，请勿重复付款。</aside>
    </div>
    <div className="ch-purchase-panel">
      <div className="ch-pay-code">
        <img src="./wechat-pay.jpg" width="621" height="846" alt="微信支付收款二维码，金额89.90元"/>
      </div>
      <a className="ch-button ch-order-button" href={ORDER_FORM_URL} target="_blank" rel="noreferrer">已付款，填写收货信息 <span>↗</span></a>
      <p>订单信息进入产品方飞书多维表格，仅用于核款、联系与配送。请确认电话和地址准确。</p>
    </div>
  </section>
}
const steps = [
  { icon:'⏻',tag:'唤醒棋盘',title:'开机，灵感就位。',text:'打开机身侧面的电源拨动开关，再长按开关键。音乐响起、动画亮起，就准备好了。',note:'充电时不能使用，先拔下充电线哦。' },
  { icon:'⊞',tag:'选个玩法',title:'今天，玩哪一款？',text:'短按玩法键切换游戏，查看数显屏上的 A01～A17 编号，找到你想玩的那一款。',note:'第一次体验，不妨从 A03 井字棋开始。' },
  { icon:'⇆',tag:'挑选难度',title:'小试身手，或挑战 AI。',text:'短按等级键切换难度或单人、双人模式。前六款棋类还可以切换 AI 对战。',note:'Ⅰ 初级 · Ⅱ 中级 · Ⅲ 高级' },
  { icon:'↗',tag:'开始这一局',title:'轻轻一点，好戏开场。',text:'短按开关键确认开始。根据灯光与语音提示，触按棋盘上的感应点进行游戏。',note:'想换个游戏？短按玩法键回到选择界面。' },
]
export default function ChessGuide({ customer = false }: { customer?: boolean }) {
  const [category,setCategory]=useState('全部玩法'),[selected,setSelected]=useState<Game>(games[0]),[control,setControl]=useState(0),[about,setAbout]=useState(false)
  const gamePanel=useRef<HTMLDivElement>(null)
  return <div className="chess-guide" id="top"><header className="ch-header"><a href="#top" className="ch-brand"><span className="ch-logo" aria-hidden="true"><i/><i/><i/><i/></span><span>AI智能棋盘<small>{customer ? 'SHOP & PLAY' : 'THE PLAYBOOK'}</small></span></a><nav aria-label="说明书导航"><a href="#start">快速上手</a><a href="#controls">认识棋盘</a><a href="#games">探索玩法</a><a href="#help">常见问题</a>{customer && <a href="#purchase">购买</a>}</nav><ShareDialog/></header><main className="ch-main">
    <section className="ch-hero"><div className="ch-hero-copy"><span className="ch-pill"><i/> YOUR MOVE. YOUR MOMENT.</span><h1>方寸之间，<br/>大有<span>玩头。</span></h1><p>你好，这是你的 AI智能棋盘使用指南。<br/>让指尖点亮棋盘，让每一局都有新发现。</p><a className="ch-button" href="#start">从第一步开始 <span>↗</span></a><a className="ch-text-link" href="#games">直接探索玩法 →</a><div className="ch-hero-meta"><span>17 款游戏</span><span>23 种玩法</span><span>声光 × 触控 × AI</span></div></div><div className="ch-hero-visual"><div className="ch-visual-grid"/><span className="ch-visual-label">AI INTELLIGENT CHESSBOARD<small>小棋盘，大玩家。</small></span><BoardArt/><div className="ch-float-label"><span>✦</span> 下一步，轮到你。</div><span className="ch-schematic">产品结构示意 · 以实物为准</span></div><div className="ch-hero-bottom"><span>一份为好奇心准备的使用指南</span><a href="#start">SCROLL TO PLAY ↓</a></div></section>
    <div className="ch-ticker" aria-hidden="true">LESS SCREEN. <span>MORE PLAY.</span> <i>✳</i> 动手，也动脑。 <i>✳</i> ONE BOARD. <span>ENDLESS DISCOVERIES.</span> <i>✳</i></div>
    <section id="start" className="ch-section ch-start"><div className="ch-section-title"><div><span className="ch-eyebrow">01 / LET’S GET STARTED</span><h2>4 步，<span>进入状态。</span></h2></div><p>从开机到开玩，<br/>比想象中更简单。</p></div><div className="ch-steps">{steps.map((s,i)=><article className="ch-step" key={s.tag}><div className="ch-step-top"><span>0{i+1}</span><b>{s.tag}</b></div><div className="ch-step-icon" aria-hidden="true">{s.icon}<i>↗</i></div><h3>{s.title}</h3><p>{s.text}</p><small>{s.note}</small></article>)}</div></section>
    <section id="controls" className="ch-section ch-controls"><div className="ch-section-title"><div><span className="ch-eyebrow">02 / MEET YOUR BOARD</span><h2>四个按键，<span>心中有数。</span></h2></div><p>短按做选择，长按有惊喜。<br/>点选按键，看看它的本领。</p></div><div className="ch-controls-grid"><div className="ch-control-art"><BoardArt compact/><div className="ch-hardware-labels"><span>11 × 11 感应棋盘</span><span>数显屏 · 计时 / 等级 / 关卡</span><span>Type-C 充电接口</span></div></div><div className="ch-control-list">{controls.map((c,i)=><button key={c.name} className={control===i?'active':''} aria-pressed={control===i} onClick={()=>setControl(i)}><span className="ch-control-icon" aria-hidden="true">{c.icon}</span><span><b>{c.name}</b><small>{c.short}</small></span><i>↗</i></button>)}<div className="ch-control-detail" aria-live="polite"><div><span>短按</span>{controls[control].short}</div><div><span>长按</span>{controls[control].long}</div><p>{controls[control].detail}</p></div></div></div><div className="ch-charge-note"><span aria-hidden="true">↯</span><p><b>先充电，再尽兴。</b>红灯常亮：充电中；绿灯常亮：充电完成。充电时设备会关机，不能边充边玩。</p></div></section>
    <section id="games" className="ch-section ch-games"><div className="ch-section-title"><div><span className="ch-eyebrow">03 / FIND YOUR NEXT FAVORITE</span><h2>今天，<span>想玩哪一局？</span></h2></div><p>棋逢对手，或自得其乐。<br/>17 款游戏，总有你的主场。</p></div><div className="ch-categories" aria-label="按玩法类型筛选">{['全部玩法','棋类对战','反应记忆','益智挑战','创意音乐'].map(c=><button aria-pressed={category===c} className={category===c?'active':''} key={c} onClick={()=>setCategory(c)}>{c}{c==='全部玩法'&&<sup>17</sup>}</button>)}</div><div className="ch-games-grid">{games.filter(g=>category==='全部玩法'||g.category===category).map(g=><button key={g.code} className={`ch-game-card ${selected.code===g.code?'selected':''}`} aria-pressed={selected.code===g.code} onClick={()=>{setSelected(g);gamePanel.current?.scrollIntoView({behavior:'smooth',block:'nearest'})}}><div className="ch-game-top"><span>{g.code}{g.ai&&` / ${g.ai}`}</span><small>{g.ai?'双人 / AI':g.category}</small></div><span className="ch-game-symbol" aria-hidden="true">{g.symbol}</span><h3>{g.name}<i>↗</i></h3><p>{g.brief}</p></button>)}</div><div className="ch-game-detail" ref={gamePanel} aria-live="polite"><div><span className="ch-eyebrow">{selected.code}{selected.ai&&` + ${selected.ai}`} / HOW TO PLAY</span><h3>{selected.name}<span>{selected.symbol}</span></h3><p>{selected.rules}</p><small>↗ {selected.tip}</small></div><aside><span>在实体棋盘上</span><ol><li>短按玩法键，选到 <b>{selected.code}</b></li><li>短按等级键，选模式与难度</li><li>短按开关键，确认开始</li></ol>{selected.ai&&<p>AI 对战编号 <b>{selected.ai}</b><br/>通过等级键切换</p>}</aside></div><p className="ch-fine ch-game-note">A01～A17 为基础游戏；B01～B06 为前六款棋类的 AI 对战，共 23 种玩法。网页用于阅读指南，实际游戏请在棋盘上操作。</p></section>
    <section id="help" className="ch-section ch-help"><div className="ch-section-title"><div><span className="ch-eyebrow">04 / A LITTLE HELP</span><h2>有疑问？<span>接着看。</span></h2></div><span className="ch-help-mark" aria-hidden="true">?</span></div><div className="ch-faqs">{faqs.map(([q,a],i)=><details key={q}><summary><span>0{i+1}</span>{q}<i aria-hidden="true">+</i></summary><p>{a}</p></details>)}</div><aside className="ch-safety"><span aria-hidden="true">!</span><p><b>好好玩，也要安全玩。</b>产品含小零件，不适合 3 岁以下儿童使用，请勿吞食，以免发生窒息危险。儿童请在成人监护下使用，充电及日常操作以实物标识和原说明书为准。</p></aside><details className="ch-original"><summary>想看看原版说明书？<span>6 张原图 ↗</span></summary><p>点击图片可打开原图，放大查阅。</p><div>{[1,2,3,4,5,6].map(i=><a href={`./manual/${i}.jpg`} key={i} target="_blank" rel="noreferrer"><img loading="lazy" src={`./manual/${i}.jpg`} alt={`AI智能棋盘原版说明书第 ${i} 张`} width="240" height="320"/><span>0{i} / 原版说明</span></a>)}</div></details></section>
    {customer && <PurchaseSection/>}<ExperienceForm/><footer className="ch-footer"><a className="ch-brand" href="#top"><span className="ch-logo" aria-hidden="true"><i/><i/><i/><i/></span><span>AI智能棋盘<small>每一步，都有新发现。</small></span></a><p>根据随附纸质说明书整理 · GUIDE V1.0<br/>产品功能及外观以实物为准</p><button onClick={()=>setAbout(!about)} aria-expanded={about}>关于这份指南 {about?'−':'+'}</button><a href="#top">回到顶部 ↑</a></footer>{about&&<div className="ch-about-note">这是一份数字使用指南。二维码用于打开本网页；购买版订单信息进入产品方飞书多维表格，体验问卷仅在配置反馈数据库后发送。</div>}
  </main><a className="ch-mobile-feedback" href={customer ? '#purchase' : '#feedback'}>{customer ? '¥89.90 · 立即购买 ↗' : '分享这一局的体验 ↗'}</a></div>
}

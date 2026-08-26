import { useMemo, useState } from 'react'

type Page = 'today' | 'brain' | 'topics' | 'intelligence' | 'creation' | 'accounts' | 'weekly'
type Account = { code: string; name: string; type: string; color: string; count: number; goal: string }
type Topic = { title: string; account: string; score: number; creator: number; status: string; tag: string }

const accounts: Account[] = [
  { code: 'A', name: '个人IP', type: '生活 / 观点', color: '#e98572', count: 2, goal: '建立可信赖的个人表达' },
  { code: 'B', name: 'AI知识', type: '工具 / 方法', color: '#7b72e8', count: 1, goal: '持续输出 AI 实践经验' },
  { code: 'C', name: '摄影', type: '审美 / 影像', color: '#50a88f', count: 0, goal: '记录有温度的视觉故事' },
  { code: 'D', name: '追星', type: '文化 / 情绪', color: '#e7ad58', count: 2, goal: '找到同频的表达方式' },
  { code: 'E', name: '测试产品', type: '体验 / 评测', color: '#619bd5', count: 0, goal: '验证产品与内容的可能性' },
  { code: 'F', name: '青鱼保研工作室', type: '教育 / 信息', color: '#b07bc5', count: 1, goal: '提供可靠的升学信息' },
]

const initialTopics: Topic[] = [
  { title: '一个人做六个账号，我是怎么安排时间的', account: 'A', score: 88, creator: 82, status: '待复盘', tag: '个人经验' },
  { title: '我用 AI 重做了自己的内容工作流', account: 'B', score: 94, creator: 90, status: '已选中', tag: 'AI实践' },
  { title: '新手如何建立自己的第一套摄影审美', account: 'C', score: 79, creator: 76, status: '候选', tag: '摄影入门' },
  { title: '追星不是浪费时间，是一种情绪补给', account: 'D', score: 86, creator: 71, status: '候选', tag: '情绪价值' },
  { title: '2026保研夏令营信息如何判断真假', account: 'F', score: 91, creator: 86, status: '待复盘', tag: '信息核验' },
]

const nav = [
  ['today', '⌂', '今日工作台'], ['brain', '✦', '我的大脑'], ['topics', '◈', '选题池'],
  ['intelligence', '⌁', '外部情报'], ['creation', '▣', '创作生产'], ['weekly', '◷', '每周复盘'], ['accounts', '◎', '账号矩阵'],
] as const

function App() {
  const [page, setPage] = useState<Page>('today')
  const [topics, setTopics] = useState(initialTopics)
  const [capacity, setCapacity] = useState(90)
  const [toast, setToast] = useState('')
  const showToast = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2400) }

  const selectedCount = topics.filter(t => t.status === '已选中').length
  const title = nav.find(n => n[0] === page)?.[2] ?? '今日工作台'

  return <div className="shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">z</div><div><strong>zoey创作世界</strong><small>ZOEY CREATE SYSTEM</small></div></div>
      <div className="workspace-label">我的工作台</div>
      <nav>{nav.map(([id, icon, label]) => <button key={id} className={page === id ? 'nav-item active' : 'nav-item'} onClick={() => setPage(id)}><span>{icon}</span>{label}{id === 'topics' && <b>{topics.length}</b>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="sync-status"><i /> 本地工作区已同步</div><button className="profile"><span className="avatar">Z</span><span><strong>Zoey</strong><small>个人创作者</small></span><em>···</em></button></div>
    </aside>
    <main className="main">
      <header className="topbar"><div><div className="breadcrumb">ZCS <span>/</span> {title}</div><h1>{title}</h1></div><div className="top-actions"><button className="icon-btn">⌕</button><button className="icon-btn">♧</button><button className="primary" onClick={() => showToast('新建入口将在下一步接入')}>＋ 新建</button></div></header>
      <div className="content">
        {page === 'today' && <Today capacity={capacity} setCapacity={setCapacity} selectedCount={selectedCount} onAction={showToast} />}
        {page === 'brain' && <Brain onAction={showToast} />}
        {page === 'topics' && <Topics topics={topics} setTopics={setTopics} onAction={showToast} />}
        {page === 'intelligence' && <Intelligence />}
        {page === 'creation' && <Creation onAction={showToast} />}
        {page === 'weekly' && <Weekly topics={topics} setTopics={setTopics} onAction={showToast} />}
        {page === 'accounts' && <Accounts />}
      </div>
    </main>
    {toast && <div className="toast">✓ {toast}</div>}
  </div>
}

function SectionTitle({ eyebrow, title, action, onAction }: { eyebrow?: string; title: string; action?: string; onAction?: () => void }) {
  return <div className="section-title">{<div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h2>{title}</h2></div>}{action && <button className="text-btn" onClick={onAction}>{action} →</button>}</div>
}

function Today({ capacity, setCapacity, selectedCount, onAction }: { capacity: number; setCapacity: (n: number) => void; selectedCount: number; onAction: (s: string) => void }) {
  return <><div className="welcome"><div><p className="eyebrow">WEDNESDAY · AUG 26, 2026</p><h2>早上好，Zoey <span>✦</span></h2><p className="muted">今天也为你的创作世界，推进一点点。</p></div><div className="capacity"><span>今日可用时间</span><strong>{capacity}<small> min</small></strong><input type="range" min="30" max="240" step="15" value={capacity} onChange={e => setCapacity(Number(e.target.value))} /></div></div>
    <div className="stat-grid"><Stat number="06" label="账号矩阵" detail="全部活跃" color="purple" /><Stat number="05" label="待复盘选题" detail="较昨日 +2" color="orange" /><Stat number="02" label="本周已排期" detail="共 90 分钟" color="green" /><Stat number="01" label="即将失效热点" detail="建议今日处理" color="blue" /></div>
    <div className="dashboard-grid"><div className="panel tasks-panel"><SectionTitle eyebrow="TODAY'S FOCUS" title="今天做什么" action="查看全部" onAction={() => onAction('任务列表将在下一步开放')} /><div className="focus-callout"><div className="focus-icon">✦</div><div><strong>如果今天只能完成一项</strong><p>完成「我用 AI 重做了自己的内容工作流」的初稿</p></div><span>45 min</span></div><Task title="完成 AI 内容工作流初稿" meta="B · AI知识  /  内容生产" time="45 min" checked={false} onAction={onAction} /><Task title="整理云南旅行的 12 张照片" meta="C · 摄影  /  个人资产" time="30 min" checked={false} onAction={onAction} /><Task title="确认保研夏令营信息来源" meta="F · 青鱼保研  /  信息核验" time="15 min" checked={true} onAction={onAction} /></div>
      <div className="panel"><SectionTitle eyebrow="WEEKLY PULSE" title="本周进度" action="进入复盘" onAction={() => onAction('已打开每周复盘')} /><div className="progress-ring"><div><strong>42%</strong><small>本周完成</small></div></div><div className="mini-progress"><div><span>内容发布</span><b>2 / 5</b></div><div className="bar"><i style={{width:'40%'}} /></div><div><span>任务执行</span><b>7 / 12</b></div><div className="bar"><i style={{width:'58%', background:'#e7ad58'}} /></div></div><div className="pulse-note">本周 B 账号表现最好，继续保持稳定输出。</div></div></div>
    <SectionTitle eyebrow="ACCOUNT MATRIX" title="账号状态" action="管理账号" onAction={() => onAction('账号管理已打开')} /><div className="account-row">{accounts.map(a => <div className="account-chip" key={a.code} onClick={() => onAction(`${a.code}｜${a.name}`)}><span style={{background:a.color}}>{a.code}</span><div><strong>{a.name}</strong><small>{a.count ? `${a.count} 个待处理` : '暂无待处理'}</small></div><em>›</em></div>)}</div></>
}

function Stat({ number, label, detail, color }: {number:string;label:string;detail:string;color:string}) { return <div className="stat"><div className={`stat-number ${color}`}>{number}</div><div><strong>{label}</strong><small>{detail}</small></div></div> }
function Task({title,meta,time,checked,onAction}:{title:string;meta:string;time:string;checked:boolean;onAction:(s:string)=>void}) { const [done,setDone]=useState(checked); return <div className={`task ${done?'done':''}`}><button className="check" onClick={() => {setDone(!done); onAction(done?'已恢复任务':'任务已完成')}}>{done?'✓':''}</button><div><strong>{title}</strong><small>{meta}</small></div><time>{time}</time></div> }

function Brain({onAction}:{onAction:(s:string)=>void}) { return <><div className="hero-card brain-hero"><div><span className="pill purple-pill">PERSONAL BRAIN</span><h2>你的经历，<br />是最独特的内容资产。</h2><p>把散落在生活里的想法、记忆和经验，变成下一条内容的灵感。</p><button className="primary" onClick={() => onAction('已打开灵感捕捉器')}>记录一个想法 ＋</button></div><div className="orbit"><div>✦</div><span>Ideas</span><span>Assets</span><span>Cases</span></div></div><SectionTitle eyebrow="RECENT INPUTS" title="最近的输入" action="查看全部" /><div className="brain-grid"><div className="panel input-card"><span className="type-icon orange-bg">✎</span><div><small>IDEA · 2小时前</small><h3>为什么我总是想做很多账号？</h3><p>关于创作欲望、时间分配和长期主义的一点思考……</p></div><b>→</b></div><div className="panel input-card"><span className="type-icon green-bg">◒</span><div><small>PERSONAL ASSET · 昨天</small><h3>云南旅行：大理古城的清晨</h3><p>地点：云南大理　·　12 张照片</p></div><b>→</b></div><div className="panel input-card"><span className="type-icon blue-bg">▤</span><div><small>FEISHU SOURCE · 3天前</small><h3>阿宗 / 内容方法论</h3><p>已同步 18 篇文档，最后更新于今天</p></div><b>→</b></div></div></> }

function Topics({topics,setTopics,onAction}:{topics:Topic[];setTopics:(t:Topic[])=>void;onAction:(s:string)=>void}) { const [filter,setFilter]=useState('全部'); const visible=useMemo(()=>filter==='全部'?topics:topics.filter(t=>t.status===filter),[filter,topics]); return <><div className="page-intro"><div><p className="eyebrow">IDEA → TOPIC → DECISION</p><h2>选题池</h2><p className="muted">所有可能性先到这里，再由你决定什么值得被做出来。</p></div><button className="primary" onClick={() => onAction('已打开新建选题')}>＋ 添加选题</button></div><div className="filter-tabs">{['全部','候选','待复盘','已选中','已放弃'].map(f=><button className={filter===f?'selected':''} key={f} onClick={()=>setFilter(f)}>{f}<span>{f==='全部'?topics.length:topics.filter(t=>t.status===f).length}</span></button>)}</div><div className="topic-list">{visible.map((t,i)=><div className="topic-row" key={t.title}><div className="topic-index">0{i+1}</div><div className="topic-main"><div><span className="tag">{t.tag}</span><span className="account-tag" style={{color:accounts.find(a=>a.code===t.account)?.color}}>● {t.account} · {accounts.find(a=>a.code===t.account)?.name}</span></div><h3>{t.title}</h3><div className="score-line"><span>AI评分 <b>{t.score}</b></span><span>我的评分 <b>{t.creator}</b></span><span className="score-bar"><i style={{width:`${t.score}%`}} /></span></div></div><span className={`status ${t.status==='已选中'?'status-green':t.status==='待复盘'?'status-orange':''}`}>{t.status}</span><button className="more" onClick={()=>{setTopics(topics.map(x=>x.title===t.title?{...x,status:x.status==='已选中'?'候选':'已选中'}:x));onAction('已更新选题决策')}}>···</button></div>)}</div></> }

function Intelligence() { return <><div className="page-intro"><div><p className="eyebrow">EXTERNAL INTELLIGENCE</p><h2>外部情报</h2><p className="muted">趋势、案例与研究，让创作不只来自内部灵感。</p></div><button className="ghost">⌁ 同步数据</button></div><div className="intel-layout"><div className="panel"><SectionTitle eyebrow="TRENDING NOW" title="正在发生" action="添加热点" /><div className="trend"><span className="trend-rank">01</span><div><h3>AI Agent 开始进入真实工作流</h3><p>来源：小红书趋势　·　热度上升 32%</p></div><strong>↑ 32%</strong></div><div className="trend"><span className="trend-rank">02</span><div><h3>2026 保研夏令营信息窗口</h3><p>来源：教育部官网　·　截止提醒 5 天</p></div><strong>↑ 18%</strong></div><div className="trend"><span className="trend-rank">03</span><div><h3>低饱和生活感影像持续受欢迎</h3><p>来源：平台观察　·　适合 C 账号</p></div><strong>↑ 12%</strong></div></div><div className="panel"><SectionTitle eyebrow="CASES" title="值得研究的案例" /><div className="case-card"><div className="case-cover purple-cover">AI<br /><span>WORKFLOW</span></div><div><span className="tag">B · AI知识</span><h3>一个人如何管理 7 个 AI Agent</h3><p>结构清晰 · 前 3 秒有钩子 · 评论区互动强</p><small>小红书　♡ 2.8k　💬 186</small></div></div><div className="case-card"><div className="case-cover orange-cover">保研<br /><span>信息差</span></div><div><span className="tag">F · 青鱼保研</span><h3>夏令营避坑指南：这 3 个信号要注意</h3><p>信息密度高 · 来源标注明确 · 收藏率高</p><small>抖音　♡ 5.1k　💬 302</small></div></div></div></div></> }

function Creation({onAction}:{onAction:(s:string)=>void}) { return <><div className="page-intro"><div><p className="eyebrow">CONTENT PRODUCTION STUDIO</p><h2>创作生产</h2><p className="muted">从一个选题，到一条可以发布的内容。</p></div><button className="primary" onClick={()=>onAction('已打开新建内容项目')}>＋ 新建项目</button></div><div className="creation-grid"><div className="panel project-feature"><div className="project-top"><span className="tag">B · AI知识</span><span className="status status-orange">进行中</span></div><h2>我用 AI 重做了自己的内容工作流</h2><p>从研究、脚本到剪辑，我把一个人的创作流程拆开重组。</p><div className="creation-steps">{['研究','文案','拍摄','剪辑','配乐','封面'].map((s,i)=><div className={i<2?'step done-step':'step'} key={s}><span>{i<2?'✓':i+1}</span>{s}</div>)}</div><button className="primary" onClick={()=>onAction('已进入文案编辑器')}>继续编辑 →</button></div><div className="panel"><SectionTitle eyebrow="RECENT PROJECTS" title="最近项目" /><div className="recent-project"><span className="project-dot purple-dot" /><div><strong>周末去看一场日落吧</strong><small>A · 个人IP　·　已发布</small></div><span className="status status-green">完成</span></div><div className="recent-project"><span className="project-dot green-dot" /><div><strong>大理清晨的 12 个瞬间</strong><small>C · 摄影　·　封面阶段</small></div><span className="status status-orange">进行中</span></div><div className="recent-project"><span className="project-dot blue-dot" /><div><strong>2026保研夏令营信息汇总</strong><small>F · 青鱼保研　·　研究阶段</small></div><span className="status">草稿</span></div></div></div></> }

function Weekly({topics,setTopics,onAction}:{topics:Topic[];setTopics:(t:Topic[])=>void;onAction:(s:string)=>void}) { return <><div className="page-intro"><div><p className="eyebrow">WEEKLY REVIEW · WEEK 35</p><h2>每周复盘</h2><p className="muted">先回看发生了什么，再决定下周做什么。</p></div><button className="primary" onClick={()=>onAction('周计划已保存')}>保存本周计划</button></div><div className="review-banner"><div className="review-icon">◷</div><div><strong>本周还有 3 个账号等待你的判断</strong><p>你的决定会成为 ZCS 逐渐理解你的方式。</p></div><button className="text-btn" onClick={()=>onAction('已开始账号复盘')}>开始复盘 →</button></div><div className="review-grid">{accounts.map(a=><div className="review-card" key={a.code}><div className="review-head"><span style={{background:a.color}}>{a.code}</span><div><strong>{a.name}</strong><small>{a.count ? `${a.count} 条内容 · 1 条待判断` : '本周暂无发布'}</small></div><em>›</em></div><div className="review-metric"><span>本周表现</span><b>{a.code==='B'?'↑ 28%':a.code==='F'?'↑ 16%':'—'}</b></div><div className="review-bar"><i style={{width:`${a.code==='B'?78:a.code==='F'?62:35}%`,background:a.color}} /></div><button className="small-btn" onClick={()=>onAction(`已打开 ${a.code}｜${a.name} 复盘`)}>查看复盘</button></div>)}</div><div className="panel plan-panel"><SectionTitle eyebrow="NEXT WEEK PLAN" title="下周准备做什么" action="从选题池添加" onAction={()=>onAction('已打开选题选择')} /><div className="plan-line"><span className="date-label">周一<br /><b>31</b></span><div className="plan-task purple-plan"><b>B</b><div><strong>我用 AI 重做了自己的内容工作流</strong><small>文案初稿　·　45 min</small></div></div></div><div className="plan-line"><span className="date-label">周三<br /><b>02</b></span><div className="plan-task orange-plan"><b>A</b><div><strong>一个人做六个账号，我是怎么安排时间的</strong><small>拍摄　·　30 min</small></div></div></div><div className="plan-line empty-plan"><span className="date-label">周五<br /><b>04</b></span><div>拖拽内容到这里排期</div></div></div></> }

function Accounts() { return <><div className="page-intro"><div><p className="eyebrow">ACCOUNT MATRIX</p><h2>账号矩阵</h2><p className="muted">六个账号，六种表达，属于同一个创作者。</p></div><button className="ghost">⚙ 矩阵设置</button></div><div className="accounts-grid">{accounts.map(a=><div className="account-card" key={a.code}><div className="account-card-top"><span style={{background:a.color}}>{a.code}</span><small>ACTIVE</small></div><h2>{a.name}</h2><p>{a.type}</p><div className="account-goal">“{a.goal}”</div><div className="account-footer"><span>{a.count} 待处理</span><span>查看详情 →</span></div></div>)}</div></> }

export default App

'use client'

import { useEffect, useRef, useState } from 'react'

type Screen = 'login' | 'home' | 'create' | 'project' | 'settings' | 'tutorial' | 'me'
type Sheet = 'ftp' | 'preset' | 'projectMenu' | 'rename' | 'deleteConfirm' | 'filter' | 'logout' | 'customerService' | 'cameraGuide' | null
type PhotoFilter = 'all' | 'success' | 'failed'
type PhotoSort = 'newest' | 'oldest'
type FtpStatus = 'disconnected' | 'connecting' | 'connected' | 'failed'
type CameraStatus = 'connected' | 'failed'
type PhotoStatus = 'uploading' | 'success' | 'failed'

type Photo = { id: number; url: string; status: PhotoStatus }
type Project = {
  id: number
  name: string
  createdAt: string
  photos: Photo[]
}

const DEMO_IMAGES = [
  'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&q=82',
  'https://images.unsplash.com/photo-1507501336603-6e31db2be093?auto=format&fit=crop&w=600&q=82',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=82',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=82',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=82',
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=82',
]

const DEFAULT_PROJECT: Project = {
  id: 1,
  name: '2026春日品牌发布会',
  createdAt: '2026-10-23 15:59',
  photos: DEMO_IMAGES.slice(0, 6).map((url, index) => ({
    id: index + 1,
    url,
    status: index === 2 ? 'failed' : 'success',
  })),
}

const STATUS_LABEL: Record<PhotoStatus, string> = { uploading: '上传中', success: '已上传', failed: '上传失败' }
const HELP_CENTER_URL = 'https://pan.baidu.com/aiphoto/doc/helpcenter'
const RECOMMENDED_PRESETS = [
  '无预设', '儿童', '儿童-亮调纯净', '儿童-暗调儿童', '全家福', '全家福-自然',
  '写真', '写真-清冷古风', '写真-简约肖像', '原生肌', '奶油肌', '婚礼跟拍',
  '婚礼跟拍-中式', '婚纱', '婚纱-浅色内景', '婚纱-深色内景', '孕妇',
  '孕妇-自然通用', '孕妇-身型美化', '新生儿', '新生儿-爱婴上门', '旅拍-薄雾',
  '旅拍-远山', '旅拍-锦绣', '毕业季', '油画-夏日', '油画-浓郁', '肤色-中性',
  '肤色-清冷', '胶片-暖阳', '胶片-蓝冰', '胶片人像-全能400', '胶片人像-富士NC',
  '胶片人像-富士NN', '胶片人像-理光正片', '胶片人像-理光负片', '证件照', '质感肌',
]
const MY_PRESETS = ['百度网盘AI修图-人像通透', '百度网盘AI修图-室内暖光', '百度网盘AI修图-活动纪实']
const ComputerIcon = () => <svg className="flat-icon-svg" viewBox="0 0 1024 1024" aria-hidden="true"><path d="M881.92 812.8H138.24C66.56 812.8 8.96 755.2 8.96 683.52v-512C8.96 99.84 66.56 42.24 138.24 42.24h743.68C953.6 42.24 1011.2 101.12 1011.2 171.52v510.72c0 71.68-57.6 130.56-129.28 130.56zM138.24 107.52c-35.84 0-65.28 29.44-65.28 65.28v510.72c0 35.84 29.44 65.28 65.28 65.28h743.68c35.84 0 65.28-29.44 65.28-65.28v-512c0-35.84-29.44-65.28-65.28-65.28H138.24zM847.36 999.68H179.2c-28.16 0-44.8-29.44-32-53.76L179.2 883.2c6.4-11.52 19.2-19.2 32-19.2h602.88c14.08 0 25.6 7.68 32 19.2l33.28 62.72c12.8 24.32-5.12 53.76-32 53.76z" /><path d="M409.6 785.92h200.96v154.88H409.6z" /></svg>
const CameraIcon = () => <svg className="flat-icon-svg" viewBox="0 0 1024 1024" aria-hidden="true"><path d="M269.44 256l23.296-75.381A74.667 74.667 0 0 1 364.075 128h295.85a74.667 74.667 0 0 1 71.339 52.619L754.56 256h66.773c64.8 0 117.334 52.533 117.334 117.333V800c0 64.8-52.534 117.333-117.334 117.333H202.667C137.867 917.333 85.333 864.8 85.333 800V373.333C85.333 308.533 137.867 256 202.667 256h66.773zm23.605 64h-90.378a53.333 53.333 0 0 0-53.334 53.333V800a53.333 53.333 0 0 0 53.334 53.333h618.666A53.333 53.333 0 0 0 874.667 800V373.333A53.333 53.333 0 0 0 821.333 320h-90.378a32 32 0 0 1-30.571-22.549l-30.272-97.93A10.667 10.667 0 0 0 659.925 192h-295.85a10.667 10.667 0 0 0-10.187 7.52l-30.272 97.92A32 32 0 0 1 293.045 320zM512 725.333c-88.363 0-160-71.637-160-160s71.637-160 160-160 160 71.637 160 160-71.637 160-160 160zm0-64a96 96 0 1 0 0-192 96 96 0 0 0 0 192z" /></svg>
const PresetIcon = () => <svg className="flat-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5" r="3.2" /><circle cx="6" cy="15" r="3.2" /><circle cx="18" cy="15" r="3.2" /><path d="M9.3 6.8 7.6 12M14.7 6.8l1.7 5.2M9.2 15h5.6" /></svg>
const nowStamp = () => {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}
// __BODY__
export default function App() {
  const [screen, setScreen] = useState<Screen>('login')
  const [sheet, setSheet] = useState<Sheet>(null)
  const [projects, setProjects] = useState<Project[]>([DEFAULT_PROJECT])
  const [activeProjectId, setActiveProjectId] = useState(1)
  const [menuProjectId, setMenuProjectId] = useState<number | null>(null)
  const [nameInput, setNameInput] = useState('')
  const [toast, setToast] = useState('')
  const [server, setServer] = useState('192.168.43.18')
  const [port, setPort] = useState('2121')
  const [ftpUser, setFtpUser] = useState('pix')
  const [ftpPass, setFtpPass] = useState('123456')
  const [scanning, setScanning] = useState(false)
  const [ftpEditing, setFtpEditing] = useState(false)
  const [ftpStatus, setFtpStatus] = useState<FtpStatus>('disconnected')
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('failed')
  const [savedPreset, setSavedPreset] = useState('无预设')
  const [presetDraft, setPresetDraft] = useState('无预设')
  const [presetTab, setPresetTab] = useState<'recommended' | 'mine'>('recommended')
  const [aiSelect, setAiSelect] = useState(true)
  const [aiBeauty, setAiBeauty] = useState(true)
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null)
  const [showOriginal, setShowOriginal] = useState(false)
  const [photoFilter, setPhotoFilter] = useState<PhotoFilter>('all')
  const [photoSort, setPhotoSort] = useState<PhotoSort>('newest')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [loginStep, setLoginStep] = useState<'phone' | 'code'>('phone')
  const [agreed, setAgreed] = useState(false)
  const autoPresetRef = useRef(false)
  const projectNameRef = useRef<HTMLInputElement>(null)
  const photoTouchStartX = useRef<number | null>(null)
  const toastTimer = useRef<number | null>(null)

  const project = projects.find((p) => p.id === activeProjectId) ?? projects[0]
  const uploaded = project ? project.photos.filter((p) => p.status === 'success').length : 0

  useEffect(() => () => { if (toastTimer.current) window.clearTimeout(toastTimer.current) }, [])
  useEffect(() => { setShowOriginal(false) }, [previewPhoto?.id])

  useEffect(() => {
    if (screen !== 'create') return
    const timer = window.setTimeout(() => {
      projectNameRef.current?.focus()
      projectNameRef.current?.select()
    }, 80)
    return () => window.clearTimeout(timer)
  }, [screen])

  const notify = (msg: string) => {
    setToast(msg)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 2600)
  }

  const patchProject = (id: number, patch: Partial<Project>) =>
    setProjects((items) => items.map((it) => (it.id === id ? { ...it, ...patch } : it)))

  const nameExists = (name: string, exceptId?: number) =>
    projects.some((p) => p.name === name && p.id !== exceptId)

  const nextProjectName = () => {
    const d = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const prefix = `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}_`
    const used = projects
      .map((p) => p.name.match(new RegExp(`^${prefix.replace(/\./g, '\\.')}([0-9]{2})(?:.*)?$`)))
      .filter(Boolean)
      .map((match) => Number(match?.[1] ?? 0))
    return `${prefix}${pad(Math.max(0, ...used) + 1)}`
  }

  const createProject = () => {
    const name = nameInput.trim()
    if (!name) { notify('请输入项目名称'); return }
    if (nameExists(name)) { notify('项目名称已存在，请换一个名称'); return }
    const id = Date.now()
    const next: Project = {
      id,
      name,
      createdAt: nowStamp(),
      photos: [],
    }
    setProjects((items) => [next, ...items])
    setActiveProjectId(id)
    setNameInput('')
    setScreen('project')
    autoPresetRef.current = ftpStatus !== 'connected'
    if (ftpStatus !== 'connected') {
      setFtpEditing(false)
      setScanning(false)
      setSheet('ftp')
    }
  }

  const connectFtp = (fail = false) => {
    setFtpStatus('connecting')
    notify('正在连接 AI 修图客户端…')
    window.setTimeout(() => {
      if (fail) { setFtpStatus('failed'); notify('连接失败，请检查服务器地址和端口后重试'); return }
      setFtpStatus('connected')
      setFtpEditing(false)
      notify('FTP 已连接电脑')
    }, 900)
  }

  const openFtpManually = () => {
    autoPresetRef.current = false
    setFtpEditing(false)
    setScanning(false)
    setSheet('ftp')
  }
  // __BODY2__
  const startShooting = (id: number) => {
    const base = Date.now()
    const shots = DEMO_IMAGES.slice(0, 5).map((url, i) => ({ id: base + i, url: `${url}&sig=${base + i}`, status: 'uploading' as PhotoStatus }))
    setProjects((items) => items.map((it) => (it.id === id ? { ...it, photos: [...it.photos, ...shots] } : it)))
    shots.forEach((shot, i) => {
      window.setTimeout(() => {
        const result: PhotoStatus = i === 2 ? 'failed' : 'success'
        setProjects((items) => items.map((it) => (it.id === id ? { ...it, photos: it.photos.map((p) => (p.id === shot.id ? { ...p, status: result } : p)) } : it)))
      }, 700 + i * 650)
    })
  }

  useEffect(() => {
    if (screen !== 'project' || !project || project.photos.length || ftpStatus !== 'connected' || cameraStatus !== 'connected' || sheet) return
    const timer = window.setTimeout(() => startShooting(project.id), 500)
    return () => window.clearTimeout(timer)
  }, [screen, project?.id, project?.photos.length, ftpStatus, cameraStatus, sheet])

  const applyPreset = () => {
    setSavedPreset(presetDraft)
    setSheet(null)
    notify('预设已应用')
  }

  const openPreset = () => {
    setPresetDraft(savedPreset)
    setSheet('preset')
  }

  const retryPhoto = (photoId: number) => {
    patchProject(activeProjectId, { photos: project.photos.map((p) => (p.id === photoId ? { ...p, status: 'uploading' } : p)) })
    window.setTimeout(() => {
      setProjects((items) => items.map((it) => (it.id === activeProjectId ? { ...it, photos: it.photos.map((p) => (p.id === photoId ? { ...p, status: 'success' } : p)) } : it)))
      notify('照片已重新上传')
    }, 800)
  }

  const switchPreviewPhoto = (direction: -1 | 1) => {
    if (!previewPhoto || !project) return
    const index = project.photos.findIndex((photo) => photo.id === previewPhoto.id)
    if (index < 0) return
    const nextIndex = (index + direction + project.photos.length) % project.photos.length
    setPreviewPhoto(project.photos[nextIndex])
  }

  const finishPreviewSwipe = (clientX: number) => {
    if (photoTouchStartX.current === null) return
    const distance = clientX - photoTouchStartX.current
    photoTouchStartX.current = null
    if (Math.abs(distance) < 45) return
    switchPreviewPhoto(distance < 0 ? 1 : -1)
  }

  const cameraTap = () => {
    if (cameraStatus !== 'connected') {
      setSheet('cameraGuide')
      return
    }
    setCameraStatus('failed')
    notify('相机已断开连接')
  }

  const simulateCameraConnected = () => {
    setCameraStatus('connected')
    setSheet(null)
    notify('相机与手机连接成功')
  }

  const openProject = (id: number) => { setActiveProjectId(id); setScreen('project') }

  const doRename = () => {
    const name = nameInput.trim()
    if (menuProjectId === null) return
    if (!name) { notify('项目名称不能为空'); return }
    if (nameExists(name, menuProjectId)) { notify('项目名称已存在，请换一个名称'); return }
    patchProject(menuProjectId, { name })
    setSheet(null); setMenuProjectId(null); setNameInput('')
    notify('项目名称已保存')
  }

  const doDelete = () => {
    if (menuProjectId === null) return
    const id = menuProjectId
    setProjects((items) => items.filter((it) => it.id !== id))
    setSheet(null); setMenuProjectId(null)
    if (activeProjectId === id) setScreen('home')
    notify('项目已删除')
  }

  const saveSettings = () => {
    const name = nameInput.trim()
    if (!name) { notify('项目名称不能为空'); return }
    if (nameExists(name, activeProjectId)) { notify('项目名称已存在，请换一个名称'); return }
    patchProject(activeProjectId, { name })
    notify('已保存'); setScreen('project')
  }

  const topbar = (title: string, back?: () => void, action?: React.ReactNode) => (
    <header className="topbar"><div>{back && <button className="icon-button" onClick={back} aria-label="返回">‹</button>}</div><h1>{title}</h1><div className="topbar-action">{action}</div></header>
  )
  const renderLogin = () => {
    const phoneReady = /^1\d{10}$/.test(phone)
    const codeReady = /^\d{4,6}$/.test(code)
    return <div className="screen login-page"><main className="login-content">
      <div className="login-brand"><span className="login-logo">∞</span><h1>百度照片直播</h1></div>
      <p className="login-tip">请登录与电脑端百度网盘AI修图相同的账号</p>
      {loginStep === 'phone' ? <>
        <div className="login-field"><b>+86</b><i>⌄</i><input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))} inputMode="tel" placeholder="请输入手机号" autoFocus /></div>
        <button className="login-primary" disabled={!phoneReady || !agreed} onClick={() => { setLoginStep('code'); notify('验证码已发送：123456') }}>获取验证码</button>
      </> : <>
        <div className="login-code-title"><button onClick={() => setLoginStep('phone')}>‹</button><span>验证码已发送至 +86 {phone}</span></div>
        <div className="login-field"><input className="code-input" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" placeholder="请输入验证码" autoFocus /><button onClick={() => notify('验证码已重新发送：123456')}>重新获取</button></div>
        <button className="login-primary" disabled={!codeReady || !agreed} onClick={() => setScreen('home')}>登录</button>
      </>}
      <button className="agreement" onClick={() => setAgreed(!agreed)}><i className={agreed ? 'checked' : ''}>{agreed ? '✓' : ''}</i><span>我已阅读并同意 <b>用户协议</b> 和 <b>隐私协议</b></span></button>
      <p className="login-demo">演示验证码：123456</p>
    </main></div>
  }
  // __RENDER__
  const renderConnectionActions = () => (
    <div className="project-top-actions">
      <button className={`ftp-top ${ftpStatus === 'connected' ? 'connected' : 'disconnected'}`} onClick={openFtpManually}><span className="flat-icon"><ComputerIcon /></span><strong>{ftpStatus === 'connected' ? 'FTP已连接' : ftpStatus === 'connecting' ? 'FTP连接中' : 'FTP未连接'}</strong><em className={ftpStatus === 'connected' ? 'status-dot success' : 'status-dot fail'} /></button>
      <button className={`camera-status-card ${cameraStatus === 'connected' ? 'on' : 'off'}`} onClick={cameraTap}>
        <span className="flat-icon cam-icon"><CameraIcon /></span><strong>{cameraStatus === 'connected' ? '相机已连接' : '相机未连接'}</strong><em className={cameraStatus === 'connected' ? 'status-dot success' : 'status-dot fail'} />
      </button>
      <button className={`preset-top ${ftpStatus !== 'connected' ? 'locked' : ''}`} title={savedPreset} onClick={() => ftpStatus === 'connected' ? openPreset() : notify('FTP 连接成功后可设置预设')}><span className="flat-icon"><PresetIcon /></span><strong>预设</strong></button>
    </div>
  )

  const renderHome = () => (
    <div className="screen home-v2">
      <header className="brand-header">
        <div><span className="brand-paw">∞</span><strong>百度照片直播</strong></div>
        <button className="header-me" onClick={() => setScreen('me')} aria-label="我的"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg></button>
      </header>
      <main className="content home-content">
        {renderConnectionActions()}
        <div className="create-row">
          <div className="create-card-v2">
            <div className="create-card-copy">
              <h3>照片<span>边拍边传边修</span></h3>
              <p>FTP传输到百度网盘AI修图</p>
              <button className="create-project-btn" onClick={() => { setNameInput(nextProjectName()); setScreen('create') }}>创建项目</button>
            </div>
            <div className="create-card-art">
              <img src={DEMO_IMAGES[5]} alt="活动现场" />
              <button className="tutorial-pill" onClick={() => window.open(HELP_CENTER_URL, '_blank', 'noopener,noreferrer')}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11a2 2 0 0 1 2 2v15a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 20.5zM20 5.5A2.5 2.5 0 0 0 17.5 3H13v17a2 2 0 0 1 2-2h2.5a2.5 2.5 0 0 1 2.5 2.5z" /></svg>使用教程</button>
            </div>
          </div>
        </div>
        <div className="section-heading"><h2>项目列表</h2><span>{projects.length} 个项目</span></div>
        <div className="project-list">
          {projects.map((item) => {
            return (
              <div className="project-card plain" key={item.id} onClick={() => openProject(item.id)}>
                <span className="project-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="7.5" cy="7" r="1.6" /><path d="M4 4h16v16H4zM4 17l5-5 3.2 3.2 2.3-2.3L20 18" /></svg></span>
                <div className="project-copy">
                  <strong>{item.name}</strong>
                  <span>创建时间：{item.createdAt}</span>
                </div>
                <button className="more" onClick={(e) => { e.stopPropagation(); setMenuProjectId(item.id); setSheet('projectMenu') }}>•••</button>
              </div>
            )
          })}
          {!projects.length && <div className="empty-gallery"><span>▦</span><strong>暂无项目</strong><p>点击上方新建项目开始</p></div>}
        </div>
      </main>
    </div>
  )

  const renderCreate = () => (
    <div className="screen">
      {topbar('新建项目', () => setScreen('home'))}
      <main className="content form-page">
        <div className="form-hero"><span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h13m0 0-3.5-3.5M17 8l-3.5 3.5M20 16H7m0 0 3.5-3.5M7 16l3.5 3.5" /></svg></span><h2>传输至百度网盘AI修图</h2><p>手机FTP连接电脑，相机有线连接手机</p></div>
        <label className="field-label">项目名称</label>
        <div className="name-input-wrap"><input ref={projectNameRef} className="text-field" value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="例如：2026.10.27_01" maxLength={60} autoFocus /><span>{Array.from(nameInput).length}/60</span></div>
        <p className="field-help">项目名称不可重复，可在设置中修改</p>
      </main>
      <div className="sticky-action"><button className="primary-button" onClick={createProject}>创建项目</button></div>
    </div>
  )
  // __RENDER2__
  const renderProject = () => {
    const visiblePhotos = [...project.photos]
      .filter((p) => photoFilter === 'all' || p.status === photoFilter)
      .sort((a, b) => (photoSort === 'newest' ? b.id - a.id : a.id - b.id))
    const activeFilter = photoFilter !== 'all'
    return (
    <div className="screen project-screen">
      {topbar(project.name, () => setScreen('home'), <button className="text-action" onClick={() => { setNameInput(project.name); setScreen('settings') }}>设置</button>)}
      <main className="content project-content">
        {renderConnectionActions()}
        <div className="upload-summary-line"><span>已上传照片至百度网盘AI修图客户端</span><strong>{uploaded}/{project.photos.length}</strong></div>
        {!project.photos.length ? (
          <div className="empty-gallery tall"><span>▧</span><strong>还没有照片</strong><p>连接相机与电脑后，拍摄照片将自动上传</p></div>
        ) : (
          <>
            <div className="photo-toolbar">
              <div className="filter-chips">
                {([['all', '全部'], ['success', '上传成功'], ['failed', '上传失败']] as const).map(([value, label]) => (
                  <button key={value} className={photoFilter === value ? 'active' : ''} onClick={() => setPhotoFilter(value)}>{label}</button>
                ))}
              </div>
              <button className="sort-toggle" onClick={() => setSheet('filter')}>筛选</button>
            </div>
            {visiblePhotos.length ? (
              <div className="photo-grid">{visiblePhotos.map((photo) => (
                <button className="photo-tile" key={photo.id} onClick={() => setPreviewPhoto(photo)}>
                  <img src={photo.url} alt="活动照片" />
                  <span className={`photo-status ${photo.status}`}>{photo.status === 'uploading' && <i />}{STATUS_LABEL[photo.status]}</span>
                  {photo.status === 'failed' && <span className="retry-badge" onClick={(e) => { e.stopPropagation(); retryPhoto(photo.id) }}>重试</span>}
                </button>
              ))}</div>
            ) : (
              <div className="empty-gallery tall"><span>▧</span><strong>没有符合筛选的照片</strong><p>{activeFilter ? '可点击上方标签切换筛选条件' : '拍摄后照片将显示在这里'}</p></div>
            )}
          </>
        )}
      </main>
    </div>
    )
  }

  const renderSettings = () => (
    <div className="screen">
      {topbar('项目设置', () => setScreen('project'))}
      <main className="content settings-page">
        <section className="setting-section">
          <label className="field-label">项目名称</label>
          <div className="name-input-wrap"><input className="text-field" value={nameInput} onChange={(e) => setNameInput(e.target.value)} maxLength={60} /><span>{Array.from(nameInput).length}/60</span></div>
          <div className="readonly-row"><span>创建时间</span><b>{project.createdAt}</b></div>
          <div className="readonly-row"><span>照片数量</span><b>{project.photos.length} 张</b></div>
          <div className="readonly-row"><span>已上传</span><b>{uploaded} 张</b></div>
        </section>
      </main>
      <div className="sticky-action"><button className="primary-button" onClick={saveSettings}>保存修改</button></div>
    </div>
  )

  const renderMe = () => (
    <div className="screen me-page">
      {topbar('我的', () => setScreen('home'))}
      <main className="content me-content">
        <div className="me-profile"><div className="avatar">照</div><div><h2>百度照片直播</h2><p>本地演示账号</p></div></div>
        <section className="credit-card"><span>AI 修图权益</span><strong>12 <small>张修图券</small></strong><div><span>同步百度网盘AI修图的修图券数量。</span><button onClick={() => window.open('https://pan.baidu.com/aiphoto/commodity?enterprise=1&from=AIPS_page_top_person_pay&app_channel=&app_version=3.18.0-alpha.34', '_blank', 'noopener,noreferrer')}>购买修图券</button></div></section>
        <section className="menu-card"><button className="menu-row" onClick={() => window.open(HELP_CENTER_URL, '_blank', 'noopener,noreferrer')}><span>教程中心</span><b>›</b></button><button className="menu-row" onClick={() => setSheet('customerService')}><span>人工客服</span><b>›</b></button><button className="menu-row" onClick={() => notify('百度照片直播 Demo v1.0')}><span>关于百度照片直播</span><b>›</b></button></section>
        <section className="menu-card"><button className="menu-row danger" onClick={() => setSheet('logout')}><span>退出账号</span><b>›</b></button></section>
      </main>
    </div>
  )

  const renderTutorial = () => (
    <div className="screen tutorial-page">
      {topbar('使用教程', () => setScreen(screen === 'tutorial' ? 'home' : screen))}
      <main className="content"><div className="tutorial-hero"><span>FTP</span><h2>四步开始照片直播</h2><p>无需外网，同一局域网即可实时传输</p></div><div className="tutorial-list">{[
        ['1', '电脑开启 FTP', '在 AI 修图客户端选择网络并启动 FTP 服务'],
        ['2', '手机连接电脑', '扫码或手动输入服务器地址与端口'],
        ['3', '连接相机', '数据线连接手机与相机'],
        ['4', '拍摄并传输', '选择预设后拍摄，照片自动上传'],
      ].map(([num, title, copy]) => <div key={num}><span>{num}</span><p><strong>{title}</strong><small>{copy}</small></p></div>)}</div></main>
    </div>
  )
  // __SHEETS__
  const renderSheet = () => {
    if (!sheet) return null
    const tall = sheet === 'ftp' || sheet === 'preset'
    return <div className="sheet-layer" onClick={() => setSheet(null)}><div className={`bottom-sheet ${tall ? 'tall-sheet' : ''} ${sheet === 'projectMenu' ? 'compact-menu-sheet' : ''}`} onClick={(e) => e.stopPropagation()}>
      {sheet === 'ftp' && <><div className="sheet-title"><button onClick={() => { setScanning(false); setFtpEditing(false); setSheet(null) }}>取消</button><strong>FTP服务器连接</strong><span /></div>
        {scanning ? (
          <div className="scan-panel">
            <button className="scan-close" onClick={() => setScanning(false)} aria-label="关闭">×</button>
            <button className="scan-frame" onClick={() => { setServer('192.168.43.18'); setPort('2121'); setFtpUser('pix'); setFtpPass('123456'); setScanning(false); notify('已识别电脑端二维码') }}>
              <svg viewBox="0 0 21 21" className="scan-qr" aria-hidden="true">{Array.from({ length: 21 }, (_, r) => Array.from({ length: 21 }, (_, c) => ((r * 7 + c * 13 + r * c) % 5) < 2 ? <rect key={r * 21 + c} x={c} y={r} width="1" height="1" /> : null))}</svg>
            </button>
            <p className="scan-hint">将电脑端二维码放入框内，点击二维码模拟识别</p>
          </div>
        ) : ftpStatus === 'connected' && !ftpEditing ? (
          <div className="ftp-success-card">
            <div className="ftp-success-head"><span className="ok-icon">✓</span><strong>FTP连接成功</strong><button className="change-link" onClick={() => setFtpEditing(true)}>更换连接</button></div>
            <div className="ftp-info-rows">
              <div><span>服务器地址</span><b>{server}</b></div>
              <div><span>端口</span><b>{port}</b></div>
              <div><span>用户名</span><b>{ftpUser}</b></div>
              <div><span>密码</span><b>{ftpPass}</b></div>
            </div>
          </div>
        ) : (
          <>
            <p className="ftp-connect-tip">请确保手机与电脑登录同一个账号、连接同一个 WiFi。</p>
            <div className="ftp-field"><label>手机网络地址</label><div className="ftp-phone-ip">172.22.159.92</div></div>
            <div className="ftp-field-grid">
              <div className="ftp-field"><label><i>*</i>服务器地址</label><input value={server} onChange={(e) => setServer(e.target.value)} placeholder="请输入服务器地址" /></div>
              <div className="ftp-field"><label><i>*</i>端口</label><input value={port} onChange={(e) => setPort(e.target.value)} inputMode="numeric" placeholder="请输入端口" /></div>
            </div>
            <div className="ftp-field-grid">
              <div className="ftp-field"><label><i>*</i>用户名</label><input value={ftpUser} onChange={(e) => setFtpUser(e.target.value)} placeholder="请输入用户名" /></div>
              <div className="ftp-field"><label><i>*</i>密码</label><input value={ftpPass} onChange={(e) => setFtpPass(e.target.value)} placeholder="请输入密码" /></div>
            </div>
            <div className="sheet-button-row ftp-actions">
              <button className="ghost-button" onClick={() => setScanning(true)}>扫码录入</button>
              <button className="primary-button" disabled={!server.trim() || !port.trim() || !ftpUser.trim() || !ftpPass.trim() || ftpStatus === 'connecting'} onClick={() => connectFtp(false)}>{ftpStatus === 'connecting' ? '连接中…' : ftpStatus === 'connected' ? '重新连接' : '连接'}</button>
            </div>
          </>
        )}
        {ftpStatus === 'connected' && !ftpEditing && !scanning && <button className="primary-button ftp-next" onClick={() => { if (autoPresetRef.current) { autoPresetRef.current = false; openPreset() } else setSheet(null) }}>{autoPresetRef.current ? '下一步' : '我知道了'}</button>}
      </>}
      {sheet === 'preset' && <><div className="sheet-title"><button onClick={() => { setPresetDraft(savedPreset); setSheet(null) }}>取消</button><strong>预设</strong><button className="preset-reset" onClick={() => setPresetDraft('无预设')}>重置</button></div><div className="preset-panel"><div className="preset-sync-tip">{presetTab === 'recommended' ? '同步百度网盘AI修图客户端推荐预设' : '同步当前账号在百度网盘AI修图客户端的预设'}</div><div className="preset-tabs"><button className={presetTab === 'recommended' ? 'active' : ''} onClick={() => setPresetTab('recommended')}>推荐预设</button><button className={presetTab === 'mine' ? 'active' : ''} onClick={() => setPresetTab('mine')}>我的预设</button></div><div className="preset-name-list">{(presetTab === 'recommended' ? RECOMMENDED_PRESETS : MY_PRESETS).map((name) => <button className={presetDraft === name ? 'active' : ''} key={name} onClick={() => setPresetDraft(name)}><span>{name}</span>{presetDraft === name && <b>✓</b>}</button>)}</div></div><button className="primary-button sheet-confirm" onClick={applyPreset}>应用</button></>}
      {sheet === 'projectMenu' && <><button className="sheet-option center" onClick={() => { const t = projects.find((p) => p.id === menuProjectId); setNameInput(t ? t.name : ''); setSheet('rename') }}>重命名项目</button><button className="sheet-option center danger" onClick={() => setSheet('deleteConfirm')}>删除项目</button></>}
      {sheet === 'rename' && <><div className="sheet-title"><button onClick={() => setSheet('projectMenu')}>‹ 返回</button><strong>重命名项目</strong><span /></div><div className="name-input-wrap sheet-input"><input className="text-field" value={nameInput} onChange={(e) => setNameInput(e.target.value)} maxLength={60} autoFocus /><span>{Array.from(nameInput).length}/60</span></div><button className="primary-button sheet-confirm" onClick={doRename}>保存</button></>}
      {sheet === 'deleteConfirm' && <div className="dialog-card delete-confirm-dialog" onClick={(e) => e.stopPropagation()}><h3>删除项目</h3><p>此项目仅在该列表删除，不会删除客户端的项目。</p><div className="dialog-actions"><button onClick={() => setSheet('projectMenu')}>取消</button><button className="danger" onClick={doDelete}>删除</button></div></div>}
      {sheet === 'filter' && <><div className="sheet-title"><button onClick={() => setSheet(null)}>取消</button><strong>筛选与排序</strong><span /></div>
        <div className="sheet-filter-group"><span className="sheet-filter-label">上传状态</span><div className="sheet-filter-chips">{([['all', '全部'], ['success', '上传成功'], ['failed', '上传失败']] as const).map(([value, label]) => <button key={value} className={photoFilter === value ? 'active' : ''} onClick={() => setPhotoFilter(value)}>{photoFilter === value ? '✓ ' : ''}{label}</button>)}</div></div>
        <div className="sheet-filter-group"><span className="sheet-filter-label">排序方式</span><div className="sheet-filter-chips">{([['newest', '最新导入'], ['oldest', '最早导入']] as const).map(([value, label]) => <button key={value} className={photoSort === value ? 'active' : ''} onClick={() => setPhotoSort(value)}>{photoSort === value ? '✓ ' : ''}{label}</button>)}</div></div>
        <button className="primary-button sheet-confirm" onClick={() => setSheet(null)}>完成</button></>}
      {sheet === 'logout' && <div className="dialog-card" onClick={(e) => e.stopPropagation()}><h3>退出账号</h3><p>确定要退出当前账号吗？</p><div className="dialog-actions"><button onClick={() => setSheet(null)}>取消</button><button className="danger" onClick={() => { setSheet(null); setLoginStep('phone'); setCode(''); setScreen('login') }}>退出</button></div></div>}
      {sheet === 'customerService' && <div className="service-qr-dialog" onClick={(e) => e.stopPropagation()}>
        <button className="service-close" onClick={() => setSheet(null)} aria-label="关闭">×</button>
        <div className="service-qr-card"><svg viewBox="0 0 29 29" className="service-qr" aria-label="客服二维码">{Array.from({ length: 29 }, (_, r) => Array.from({ length: 29 }, (_, c) => {
          const finder = (x: number, y: number) => x >= 0 && y >= 0 && x < 7 && y < 7 && (x === 0 || y === 0 || x === 6 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4))
          const fixed = finder(c - 1, r - 1) || finder(c - 21, r - 1) || finder(c - 1, r - 21)
          const random = ((r * 11 + c * 17 + r * c * 3) % 7) < 3
          return fixed || random ? <rect key={r * 29 + c} x={c} y={r} width="1" height="1" /> : null
        }))}</svg></div>
        <p>微信扫码咨询客服</p>
      </div>}
      {sheet === 'cameraGuide' && <div className="camera-guide-content">
        <span className="camera-guide-icon"><CameraIcon /></span>
        <h3>相机未连接</h3>
        <p>相机与手机未连接，请用数据线连接。</p>
        <button className="camera-guide-link" onClick={() => window.open(HELP_CENTER_URL, '_blank', 'noopener,noreferrer')}>查看联机引导</button>
        <button className="camera-guide-confirm" onClick={simulateCameraConnected}>我知道了</button>
      </div>}
    </div></div>
  }

  let content: React.ReactNode
  if (screen === 'login') content = renderLogin()
  else if (screen === 'home') content = renderHome()
  else if (screen === 'create') content = renderCreate()
  else if (screen === 'project') content = renderProject()
  else if (screen === 'settings') content = renderSettings()
  else if (screen === 'me') content = renderMe()
  else content = renderTutorial()

  return <div className="device-stage"><div className="iphone-frame">
    <div className="dynamic-island" aria-hidden="true"><i /></div>
    <div className="app-shell">{content}{renderSheet()}
      {previewPhoto && <div className="photo-viewer" onClick={() => setPreviewPhoto(null)} onTouchStart={(e) => { photoTouchStartX.current = e.touches[0].clientX }} onTouchEnd={(e) => finishPreviewSwipe(e.changedTouches[0].clientX)}>
        <header><button aria-label="关闭照片预览" onClick={() => setPreviewPhoto(null)}>‹</button><span /><span /></header>
        <button className="preview-arrow left" onClick={(e) => { e.stopPropagation(); switchPreviewPhoto(-1) }} aria-label="上一张">‹</button>
        {/* Demo comparison only; production must use original and PC-rendered image URLs. */}
        <img className={showOriginal ? 'preview-original' : 'preview-edited'} src={previewPhoto.url} alt={showOriginal ? '预设应用前的原图' : '预设效果预览'} onClick={(e) => e.stopPropagation()} />
        <button className="preview-arrow right" onClick={(e) => { e.stopPropagation(); switchPreviewPhoto(1) }} aria-label="下一张">›</button>
        <button
          className="preview-compare"
          aria-label="按住查看原图"
          title="按住查看原图"
          aria-pressed={showOriginal}
          onPointerDown={(e) => {
            e.stopPropagation()
            if (!e.isPrimary || e.button !== 0) return
            e.currentTarget.setPointerCapture(e.pointerId)
            setShowOriginal(true)
          }}
          onPointerUp={(e) => { e.stopPropagation(); setShowOriginal(false) }}
          onPointerCancel={() => setShowOriginal(false)}
          onLostPointerCapture={() => setShowOriginal(false)}
          onBlur={() => setShowOriginal(false)}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setShowOriginal(true) }
          }}
          onKeyUp={(e) => {
            if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setShowOriginal(false) }
          }}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
          onClick={(e) => e.stopPropagation()}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path className="compare-half" d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4z" /><path d="M15 5h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3M12 2v20" /></svg>
        </button>
      </div>}
      {toast && <div className="toast">{toast}</div>}
    </div>
    <div className="home-indicator" aria-hidden="true" />
  </div></div>
}

# AI智能棋盘 · 扫码说明书

页面入口：`/chess/`。独立于现有首页，保留原项目内容。

内容根据用户提供的六张原说明书图片整理：四步上手、四个按键、17 款基础游戏、B01～B06 AI 对战、充电说明、常见问题、安全提醒、原图与五题问卷。

## 预览与二维码

运行 `npm run dev`，打开 `/chess/`。手机扫码需要手机能够访问的地址。

页面右上角「扫码带走」可输入已发布的公网 HTTPS 地址，生成并下载 1200px PNG 二维码。二维码内容为网页链接，不会把整本说明书塞入二维码。

可以预先配置 `NEXT_PUBLIC_CHESS_GUIDE_URL` 为正式说明书地址，重新构建后二维码窗口会自动填入。仅输入地址不会发布网页，须先部署并扫码实测再印刷。

`node scripts/generate-chess-qr.mjs https://你的域名/chess/` 可生成 PNG、SVG 和一张 A6 可打印说明卡 HTML，输出到 `output/chess-guide/`。

## 问卷最终保存到哪里

配置后的路径：访客手机 → Supabase HTTPS API → **你拥有的 Supabase 项目** → `public.chess_feedback` 数据表。项目管理员在 Supabase Dashboard 的 Table Editor 中查看和导出 CSV。不会发往任何预置邮箱。

1. 在自己的 Supabase 项目 SQL Editor 执行本目录 `feedback-schema.sql`。
2. 在部署环境设置：

   ```env
   NEXT_PUBLIC_CHESS_SUPABASE_URL=https://你的项目.supabase.co
   NEXT_PUBLIC_CHESS_SUPABASE_ANON_KEY=项目的匿名公开密钥
   NEXT_PUBLIC_CHESS_GUIDE_URL=https://正式说明书地址/chess/
   ```

3. 重新构建并部署。先提交一份真实测试问卷，确认后台出现记录。
4. 在产品方后台中查询、筛选、导出问卷。

页面只在数据库确认新增成功后显示提交成功。网络错误保留答案，并防止请求处理中重复点击。15 秒未能确认会提示检查网络重试。

**当前尚未配置专用数据库**：页面仅提供「保存体验草稿」，将答案写入当前浏览器的 `localStorage`，清楚提示「尚未发送」。不会将其他业务的既有数据库密钥用于此产品。清除浏览器数据会清除草稿。

问卷共 5 题：上手难度、最喜欢的玩法类型、触控声光配合、整体 1～5 分、改进建议（选填，最多 500 字）。不收集姓名、手机号；提交前提供匿名反馈用途说明与同意框。

数据库启用 RLS，公开客户端只能写入受约束字段，不能读取、修改或删除反馈。请勿将服务端 `service_role` 密钥放进 `NEXT_PUBLIC_*`。如用于大规模公开投放，可在部署方后端增加验证码和限流。

## 部署

现有项目是 Next.js 静态导出配置，包含 GitHub Pages 工作流。说明书和 Supabase 直连方案兼容静态站点，无需新增 Next.js API 服务。

GitHub Actions 构建如需问卷提交，请在工作流构建环境中设置以上公开配置；它们在构建时写入前端，不是运行时读取。

正式域名、可访问的部署和产品方数据库账户仍需实际配置。不要将仅在本机运行的链接作为正式印刷二维码。

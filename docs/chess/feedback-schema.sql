-- 在你为本产品创建的 Supabase 项目 SQL Editor 中执行。
-- 访客只可新增匿名反馈；读取、修改与删除不授予公开客户端。
create table if not exists public.chess_feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  product text not null check (product = 'AI智能棋盘'),
  guide_version text not null check (guide_version = '1.0'),
  ease text not null check (ease in ('一看就会', '基本明白', '还需摸索', '有点困难')),
  favorite text not null check (favorite in ('棋类对战', '反应记忆', '益智挑战', '创意音乐', '还没体验')),
  response text not null check (response in ('很流畅', '还不错', '偶尔没反应', '需要改进')),
  rating smallint not null check (rating between 1 and 5),
  suggestion text not null default '' check (char_length(suggestion) <= 500)
);
alter table public.chess_feedback enable row level security;
revoke all on public.chess_feedback from public, anon, authenticated;
grant insert (product, guide_version, ease, favorite, response, rating, suggestion)
  on public.chess_feedback to anon;
drop policy if exists "Visitors may submit chess feedback" on public.chess_feedback;
create policy "Visitors may submit chess feedback" on public.chess_feedback
  for insert to anon with check (product = 'AI智能棋盘' and guide_version = '1.0');
-- 产品方通过 Supabase Dashboard / Table Editor 查看与导出 CSV。
-- 不创建公开 SELECT 策略，不把 service_role 密钥放入前端。

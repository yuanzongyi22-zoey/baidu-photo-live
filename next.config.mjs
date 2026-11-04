/** @type {import('next').NextConfig} */
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true'

const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  basePath: isGitHubPages ? '/baidu-photo-live/v3' : '',
  assetPrefix: isGitHubPages ? '/baidu-photo-live/v3/' : '',
  trailingSlash: true,
}

export default nextConfig

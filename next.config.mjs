/** @type {import('next').NextConfig} */
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true'

const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  basePath: isGitHubPages ? '/baidu-photo-live' : '',
  assetPrefix: isGitHubPages ? '/baidu-photo-live/' : '',
  trailingSlash: true,
}

export default nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Канонический адрес — без хвостового слеша. Редирект www → apex
  // настраивается на стороне Vercel при добавлении домена (см. скил deploy).
  trailingSlash: false,

  // Next 16 при каждом `next dev`, увидев ИИ-агента, создаёт AGENTS.md
  // и дописывает свой блок в CLAUDE.md. CLAUDE.md здесь — наш файл
  // (Задача 13), а лишних файлов в шаблоне быть не должно. Выключаем.
  agentRules: false,

  images: {
    formats: ['image/webp'],
    minimumCacheTTL: 2678400,
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

export default nextConfig

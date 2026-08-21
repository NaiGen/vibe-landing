import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { SITE } from '@/lib/site'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = SITE.name

/**
 * Движок, который рисует эту картинку, НЕ УМЕЕТ кириллицу
 * без явно переданного шрифта — русский текст выйдет квадратами.
 * Поэтому шрифт грузится из public/fonts и кэшируется на модуле.
 */
let fontPromise: Promise<Buffer> | null = null
function loadFont(): Promise<Buffer> {
  fontPromise ??= readFile(join(process.cwd(), 'public/fonts/og.ttf'))
  return fontPromise
}

export default async function Image() {
  const font = await loadFont()

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 80,
          background: '#ffffff',
          color: '#0f1720',
          fontFamily: 'OG',
        }}
      >
        <div style={{ fontSize: 68, fontWeight: 700 }}>{SITE.name}</div>
        {SITE.description && (
          <div style={{ fontSize: 34, marginTop: 24, color: '#475569' }}>{SITE.description}</div>
        )}
      </div>
    ),
    { ...size, fonts: [{ name: 'OG', data: font, style: 'normal', weight: 700 }] },
  )
}

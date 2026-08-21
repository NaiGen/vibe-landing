import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import { SITE } from '@/lib/site'
import { robotsMeta } from '@/lib/seo'
import { Toaster } from '@/components/ui/sonner'
import { LeadModal } from '@/components/lead/lead-modal'
import { StickyCta } from '@/components/layout/sticky-cta'
import { ClickTracker } from '@/components/analytics/click-tracker'
import { SiteAnalytics } from '@/components/analytics/site-analytics'
import { JsonLd } from '@/components/seo/json-ld'

/**
 * Общая метадата всех страниц. Здесь НЕТ canonical и og:url:
 * корневой layout наследуется каждой страницей, и адрес главной
 * молча проставился бы всем остальным. Свой canonical
 * страница объявляет сама — см. app/page.tsx.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.name, template: `%s — ${SITE.name}` },
  description: SITE.description,
  robots: robotsMeta(),
  openGraph: {
    type: 'website',
    locale: SITE.locale,
    siteName: SITE.name,
    title: SITE.name,
    description: SITE.description,
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <JsonLd />
        {children}
        <StickyCta />
        <LeadModal />
        <ClickTracker />
        <SiteAnalytics />
        <Toaster />
      </body>
    </html>
  )
}

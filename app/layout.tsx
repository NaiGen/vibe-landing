import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import { SITE } from '@/lib/site'
import { absoluteUrl, robotsMeta } from '@/lib/seo'
import { Toaster } from '@/components/ui/sonner'
import { LeadModal } from '@/components/lead/lead-modal'
import { StickyCta } from '@/components/layout/sticky-cta'
import { ClickTracker } from '@/components/analytics/click-tracker'

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.name, template: `%s — ${SITE.name}` },
  description: SITE.description,
  alternates: { canonical: absoluteUrl('/') },
  robots: robotsMeta(),
  openGraph: {
    type: 'website',
    locale: SITE.locale,
    siteName: SITE.name,
    url: absoluteUrl('/'),
    title: SITE.name,
    description: SITE.description,
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>
        {children}
        <StickyCta />
        <LeadModal />
        <ClickTracker />
        <Toaster />
      </body>
    </html>
  )
}

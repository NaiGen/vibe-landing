import type { ReactNode } from 'react'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { LeadModal } from '@/components/lead/lead-modal'
import { StickyCta } from '@/components/layout/sticky-cta'
import { ClickTracker } from '@/components/analytics/click-tracker'

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

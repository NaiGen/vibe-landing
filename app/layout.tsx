import type { ReactNode } from 'react'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { LeadModal } from '@/components/lead/lead-modal'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>
        {children}
        <LeadModal />
        <Toaster />
      </body>
    </html>
  )
}

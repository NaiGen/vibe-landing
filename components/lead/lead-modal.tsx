'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LeadForm } from '@/components/lead/lead-form'
import { onLeadModalOpen } from '@/components/lead/modal-controller'

export function LeadModal() {
  const [open, setOpen] = useState(false)
  const [source, setSource] = useState<string | undefined>()

  useEffect(
    () =>
      onLeadModalOpen((nextSource) => {
        setSource(nextSource)
        setOpen(true)
      }),
    [],
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Оставьте заявку</DialogTitle>
        </DialogHeader>
        <LeadForm source={source} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

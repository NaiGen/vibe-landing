'use client'

import { openLeadModal } from '@/components/lead/modal-controller'

export default function Page() {
  return (
    <main>
      Каркас работает
      <button onClick={() => openLeadModal('тест')}>Заявка</button>
    </main>
  )
}

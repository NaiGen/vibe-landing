'use client'

import { useEffect } from 'react'

/**
 * Один слушатель на документ ловит клики по tel: и wa.me и пишет их в dataLayer.
 * Благодаря этому onClick не нужен ни на одной кнопке,
 * и новые кнопки трекаются автоматически.
 */
export function ClickTracker() {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const link = (event.target as HTMLElement | null)?.closest('a')
      if (!link) return

      const href = link.getAttribute('href') ?? ''
      const type = href.startsWith('tel:')
        ? 'click_phone'
        : href.includes('wa.me')
          ? 'click_whatsapp'
          : href.startsWith('mailto:')
            ? 'click_email'
            : null

      if (!type) return
      window.dataLayer?.push({ event: type, link_url: href })
    }

    // capture: ловим до того, как навигация уведёт со страницы.
    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [])

  return null
}

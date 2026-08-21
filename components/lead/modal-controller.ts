'use client'

/**
 * Событийная шина модалки. Позволяет открыть форму из любой кнопки
 * без прокидывания пропсов через всё дерево, и держать
 * один экземпляр модалки на приложение.
 */
const EVENT = 'lead-modal:open'

export function openLeadModal(source?: string): void {
  window.dispatchEvent(new CustomEvent<string | undefined>(EVENT, { detail: source }))
}

export function onLeadModalOpen(handler: (source?: string) => void): () => void {
  const listener = (event: Event) => handler((event as CustomEvent<string | undefined>).detail)
  window.addEventListener(EVENT, listener)
  return () => window.removeEventListener(EVENT, listener)
}

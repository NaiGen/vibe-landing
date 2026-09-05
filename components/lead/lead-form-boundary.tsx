'use client'

import { Component, type ReactNode } from 'react'

/**
 * Граница ошибки вокруг ленивой формы. Чанк с формой может не доехать:
 * сеть моргнула, или сайт передеплоили между загрузкой страницы и кликом —
 * старый адрес чанка отдаёт 404. Без границы React уронит всю страницу до
 * английского экрана Next; с ней в модалке остаётся подпись, страница живёт.
 * Класс, потому что хука для границ ошибок в React нет.
 */
export class LeadFormBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.error('[lead] форма не загрузилась:', error)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

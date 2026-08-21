const WINDOW_MS = 60_000
const MAX_REQUESTS = 3

/**
 * Ограничение частоты в памяти процесса.
 *
 * ВАЖНО И НЕ БАГ: счётчик не переживает перезапуск и не общий
 * между инстансами. От тупого флуда защищает, от целенаправленного — нет.
 * Нужна серьёзная защита — берите внешнее хранилище.
 */
const hits = new Map<string, number[]>()

export function checkRateLimit(key: string): boolean {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((time) => now - time < WINDOW_MS)

  if (recent.length >= MAX_REQUESTS) {
    hits.set(key, recent)
    return false
  }

  recent.push(now)
  hits.set(key, recent)
  return true
}

/** Только для тестов. */
export function resetRateLimit(): void {
  hits.clear()
}

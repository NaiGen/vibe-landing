#!/usr/bin/env node
import { execSync } from 'node:child_process'

/**
 * Хук на завершение хода: проверяет типы и возвращает ошибки Claude,
 * чтобы он починил их сразу, а не когда автор увидит пустую страницу.
 *
 * Код выхода 2 возвращает управление модели вместе с текстом из stderr.
 */

let input = ''
for await (const chunk of process.stdin) input += chunk

// Если предыдущий запуск хука уже вернул управление модели —
// не зацикливаемся, выходим молча.
try {
  if (JSON.parse(input || '{}').stop_hook_active) process.exit(0)
} catch {
  // невалидный вход — проверяем всё равно
}

try {
  execSync('pnpm exec tsc --noEmit', { stdio: 'pipe', encoding: 'utf8' })
  process.exit(0)
} catch (error) {
  const output = `${error.stdout ?? ''}${error.stderr ?? ''}`.trim()
  console.error(`Проверка типов не прошла — исправь до завершения:\n\n${output}`)
  process.exit(2)
}

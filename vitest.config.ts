import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  // tsconfig держит jsx: 'preserve' — этого требует Next. Vite читает ту же
  // настройку и оставляет JSX как есть, из-за чего .tsx не парсится в тестах
  // (например tests/json-ld.test.ts импортирует компонент). Переопределяем
  // только для vitest. Внимание: esbuild: { jsx: 'automatic' } здесь НЕ работает.
  oxc: { jsx: { runtime: 'automatic' } },

  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
  resolve: {
    alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
  },
})

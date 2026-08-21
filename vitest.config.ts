import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  // Vite берёт режим JSX из tsconfig.json. Сейчас там "jsx": "react-jsx",
  // и с ним .tsx парсится и без этой строки. Но стоит вернуть в tsconfig
  // "preserve" (его советует часть документации Next) — и любой тест,
  // импортирующий .tsx, падает с «Unexpected JSX expression» ещё на разборе
  // файла. Строка ниже прибивает автоматический JSX-рантайм для vitest
  // независимо от tsconfig. Внимание: esbuild: { jsx: 'automatic' } здесь НЕ работает.
  oxc: { jsx: { runtime: 'automatic' } },

  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
  resolve: {
    alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
  },
})

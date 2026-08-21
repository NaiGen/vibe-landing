import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = process.cwd()
const SCAN_DIRS = ['lib', 'app', 'components', 'scripts']
const SCAN_EXT = ['.ts', '.tsx', '.mjs', '.css', '.json', '.txt', '.xml', '.webmanifest']

/** Заглушки шаблона. Пока хоть одна на месте — сайт не готов к запуску. */
const PLACEHOLDERS: Array<{ value: string; hint: string }> = [
  { value: 'example.kz', hint: 'домен' },
  { value: '+7 700 000 00 00', hint: 'телефон' },
  { value: '77000000000', hint: 'телефон для WhatsApp/tel:' },
  { value: '000000000000', hint: 'БИН' },
  { value: 'Пример Сервис', hint: 'название компании' },
  { value: 'ТОО «Пример»', hint: 'юридическое лицо' },
]

function walk(dir: string): string[] {
  const abs = join(ROOT, dir)
  let entries: string[] = []
  try {
    entries = readdirSync(abs)
  } catch {
    return [] // каталога может не быть — components/sections создаёт ученик
  }
  return entries.flatMap((entry) => {
    const full = join(abs, entry)
    if (statSync(full).isDirectory()) return walk(relative(ROOT, full))
    return SCAN_EXT.some((ext) => entry.endsWith(ext)) ? [full] : []
  })
}

describe('заглушки шаблона заменены', () => {
  const files = SCAN_DIRS.flatMap(walk)

  it('находит файлы для проверки', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  for (const { value, hint } of PLACEHOLDERS) {
    it(`заменён ${hint} (${value})`, () => {
      const hits = files
        .map((file) => {
          const lines = readFileSync(file, 'utf8').split('\n')
          const index = lines.findIndex((line) => line.includes(value))
          return index === -1 ? null : `${relative(ROOT, file)}:${index + 1}`
        })
        .filter((hit): hit is string => hit !== null)

      expect(hits, `Не заменён ${hint}. Найдено в:\n  ${hits.join('\n  ')}`).toEqual([])
    })
  }
})

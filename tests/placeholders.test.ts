import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { PLACEHOLDER_LIST } from '@/lib/placeholders'

const ROOT = process.cwd()
// public/ сегодня попаданий не даёт: og.ttf и README.md не подходят
// под SCAN_EXT, а OFL.txt (.txt в списке есть) сканируется и заглушек
// не содержит. Каталог здесь ради завтрашних site.webmanifest
// и browserconfig.xml с названием компании.
// .claude/ сюда НЕ добавлять: скил deploy намеренно приводит example.kz
// как пример в инструкции, и guard от этого никогда не позеленеет.
const SCAN_DIRS = ['lib', 'app', 'components', 'scripts', 'public']
const SCAN_EXT = ['.ts', '.tsx', '.mjs', '.css', '.json', '.txt', '.xml', '.webmanifest']

/**
 * lib/placeholders.ts не сканируем на тех же основаниях, на которых не
 * сканируем tests/: файл не употребляет заглушки, а определяет их — он и есть
 * источник значений из PLACEHOLDER_LIST ниже. Явный список путей, а не фильтр
 * по расширению или директории — чтобы исключение не расползлось молча
 * на файлы, которые появятся в lib/ позже.
 */
const EXCLUDE_FILES = ['lib/placeholders.ts']

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
  const files = SCAN_DIRS.flatMap(walk).filter((file) => !EXCLUDE_FILES.includes(relative(ROOT, file)))

  it('находит файлы для проверки', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  for (const { value, hint } of PLACEHOLDER_LIST) {
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

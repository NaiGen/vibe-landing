import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export type BriefSection = { name: string; filled: string[]; empty: string[] }

/** Поле брифа: `- **Название:** значение`. Двоеточие ВНУТРИ жирного — обязательно. */
const FIELD = /^-\s\*\*(.+?):\*\*\s*(.*)$/
const SECTION = /^##\s+(.+)$/

export function parseBrief(text: string): BriefSection[] {
  const sections: BriefSection[] = []
  let current: BriefSection | null = null

  for (const line of text.split('\n')) {
    const heading = line.match(SECTION)
    if (heading) {
      current = { name: heading[1].trim(), filled: [], empty: [] }
      sections.push(current)
      continue
    }

    const field = line.match(FIELD)
    if (!field || !current) continue

    if (field[2].trim()) current.filled.push(field[1])
    else current.empty.push(field[1])
  }

  // Разделы без полей (только списки и таблицы) в счёт не идут:
  // иначе они печатались бы как «✅ … — 0/0» и выглядели готовыми.
  return sections.filter((section) => section.filled.length + section.empty.length > 0)
}

/** Читает brief.md из корня проекта. Только для сервера и скриптов. */
export function readBriefProgress(): BriefSection[] {
  try {
    return parseBrief(readFileSync(join(process.cwd(), 'brief.md'), 'utf8'))
  } catch {
    return []
  }
}

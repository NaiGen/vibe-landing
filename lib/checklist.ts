import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseBrief } from '@/lib/brief'
import { foldSection, type ChecklistGroup } from '@/lib/checklist-fold'

/**
 * Чек-лист «что собрать до начала работы» — тот же brief.md, показанный
 * галочками. Отдельного списка пунктов нет намеренно: бриф остаётся
 * единственным источником правды, а заполненное отмечается само.
 *
 * Здесь — чтение файла и деление на «сейчас» и «перед запуском».
 * Арифметика «что считать собранным» живёт в `lib/checklist-fold.ts`.
 * Точный счёт единиц остаётся за `pnpm check-brief`; здесь — пометка
 * для себя.
 */

export type { ChecklistGroup, ChecklistItem } from '@/lib/checklist-fold'

/** `now` — собирать сейчас, `later` — Блок Б, перед запуском. */
export type Checklist = { now: ChecklistGroup[]; later: ChecklistGroup[] }

/** Заголовок первого уровня — им разделены Блок А и Блок Б. */
const BLOCK = /^#\s+(.+)$/
/** Заголовок раздела внутри блока. */
const SECTION = /^##\s+(.+)$/

/**
 * Раздел Блока Б, который всё равно нужен рано. Домен закрывает одну
 * из шести заглушек `lib/site.ts` и спрашивается первым шагом `/brand-init` —
 * ждать с ним до запуска нельзя. Сравнение по названию без номера раздела.
 */
const EARLY_ANYWAY = ['Домен']

/** Названия разделов, лежащих под заголовком «БЛОК Б». */
function laterSections(text: string): Set<string> {
  const names = new Set<string>()
  let inLater = false
  for (const line of text.split('\n')) {
    const block = line.match(BLOCK)
    if (block) {
      inLater = /блок\s+б/i.test(block[1])
      continue
    }
    const section = line.match(SECTION)
    if (section && inLater) names.add(section[1].trim())
  }
  return names
}

/**
 * Чистая функция: текст брифа → чек-лист. Порядок групп — как в брифе,
 * внутри группы собранные пункты идут первыми: `BriefSection` хранит
 * заполненное и пустое двумя списками, исходное чередование в нём
 * не сохраняется.
 */
export function buildChecklist(text: string): Checklist {
  const later = laterSections(text)
  const checklist: Checklist = { now: [], later: [] }

  for (const section of parseBrief(text)) {
    const group = foldSection(section)
    const early = !later.has(section.name.trim()) || EARLY_ANYWAY.includes(group.name)
    checklist[early ? 'now' : 'later'].push(group)
  }

  return checklist
}

/** Читает brief.md из корня проекта. Только для сервера. */
export function readChecklist(): Checklist {
  try {
    return buildChecklist(readFileSync(join(process.cwd(), 'brief.md'), 'utf8'))
  } catch {
    return { now: [], later: [] }
  }
}

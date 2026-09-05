import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseBrief, type BriefSection } from '@/lib/brief'

/**
 * Чек-лист «что собрать до начала работы» — тот же brief.md, показанный
 * галочками. Отдельного списка пунктов нет намеренно: бриф остаётся
 * единственным источником правды, а заполненное отмечается само.
 *
 * Отличие от `parseBrief` одно, и оно про людей, а не про подсчёт.
 * Парсер считает единицы заполнения и называет их `Отзывы №1`, `Отзывы №2`,
 * `Частые вопросы №1: Вопрос`. Для «что собрать» это шум: отзывы — одна
 * вещь, которую надо принести, а не три. Поэтому повторы по метке
 * сворачиваются в один пункт.
 *
 * Точный счёт остаётся за `pnpm check-brief`; здесь — пометка для себя.
 */

export type ChecklistItem = {
  id: string
  label: string
  /**
   * Отмечен и заблокирован. Только у одиночного поля `- **Поле:**`:
   * у него «заполнено» — бинарный факт парсера, а не догадка.
   */
  done: boolean
  /**
   * Свёрнутый пункт: сколько единиц под меткой уже заполнено. У одиночного
   * поля всегда 0 — там всё сказано в `done`.
   */
  inBrief: number
}
export type ChecklistGroup = { name: string; items: ChecklistItem[] }
/** `now` — собирать сейчас, `later` — Блок Б, перед запуском. */
export type Checklist = { now: ChecklistGroup[]; later: ChecklistGroup[] }

/** `Отзывы №2`, `Частые вопросы №1: Ответ` → метка `Отзывы`, `Частые вопросы`. */
const REPEAT = /^(.+?)\s+№\d+(?::\s.*)?$/
/** Номер раздела или пункта в начале названия: `8. Домен` → `Домен`. */
const NUMBER = /^\d+[.)]\s*/
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

/** Убирает разметку, которую незачем показывать человеку. */
function clean(text: string): string {
  return text.replace(/`/g, '').trim()
}

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

/** Черновик пункта: свёрнут ли он и сколько единиц под меткой заполнено. */
type Draft = { label: string; folded: boolean; filled: number }

/**
 * Раздел брифа → группа чек-листа.
 *
 * Сам отмечается ТОЛЬКО одиночный пункт — тот, что вырос из одного поля
 * `- **Поле:**`. У свёрнутого «заполнено» вывести нельзя, любое правило
 * врёт в одну из сторон: «хотя бы одна единица» гасит FAQ, у которого
 * есть вопрос и нет ответа, — а правило 8 требует ответы прямо в HTML;
 * «все единицы» держит галочку снятой у того, кто принёс два отзыва
 * в три заготовленные строки, хотя пустые строки — заготовка, а не
 * обязательный минимум.
 *
 * Поэтому у свёрнутого пункта галочка живая, а рядом стоит `inBrief` —
 * сколько единиц уже записано. Ставит её человек, для того чек-лист
 * и нужен; точный счёт по-прежнему за `pnpm check-brief`.
 */
function foldSection(section: BriefSection): ChecklistGroup {
  const name = clean(section.name.replace(NUMBER, ''))
  const drafts = new Map<string, Draft>()

  const put = (field: string, filled: boolean) => {
    const repeat = field.match(REPEAT)
    const label = clean(repeat?.[1] ?? field)
    const draft = drafts.get(label) ?? { label, folded: false, filled: 0 }
    // Метка, встретившаяся хоть раз с номером, свёрнута навсегда: одиночным
    // считается только то, что нигде не пронумеровано.
    draft.folded ||= repeat !== null
    draft.filled += filled ? 1 : 0
    drafts.set(label, draft)
  }

  for (const field of section.filled) put(field, true)
  for (const field of section.empty) put(field, false)

  const items = [...drafts.values()].map((draft) => ({
    id: `${name}::${draft.label}`,
    label: draft.label,
    done: !draft.folded && draft.filled > 0,
    inBrief: draft.folded ? draft.filled : 0,
  }))

  return { name, items }
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

import type { BriefSection } from '@/lib/brief'

/**
 * Свёртка одного раздела брифа в группу чек-листа. Отделено от
 * `lib/checklist.ts` (чтение файла и деление на Блок А / Блок Б) намеренно:
 * здесь живёт вся арифметика «что считать собранным», и растёт она быстрее
 * остального. Импортов из node тут нет — модуль забирает и клиентский
 * компонент, ему нужны типы.
 *
 * Парсер (`lib/brief.ts`) считает единицы заполнения и называет их
 * `Отзывы №1`, `Отзывы №2`, `Частые вопросы №1: Вопрос`. Для «что собрать»
 * это шум: отзывы — одна вещь, которую надо принести, а не три. Повторы
 * по метке сворачиваются в один пункт.
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
   * Свёрнутый пункт: сколько ШТУК уже записано — отзывов, услуг, вопросов
   * с ответами, — а не сколько единиц насчитал парсер. У одиночного поля
   * всегда 0: там всё сказано в `done`.
   */
  inBrief: number
}

export type ChecklistGroup = { name: string; items: ChecklistItem[] }

/** `Отзывы №2`, `Частые вопросы №1: Ответ` → метка, номер штуки, имя единицы. */
const REPEAT = /^(.+?)\s+№(\d+)(?::\s(.*))?$/
/** Номер раздела или пункта в начале названия: `8. Домен` → `Домен`. */
const NUMBER = /^\d+[.)]\s*/

/** Убирает разметку, которую незачем показывать человеку. */
function clean(text: string): string {
  return text.replace(/`/g, '').trim()
}

/** Одна штука под меткой: сколько в ней единиц парсера и сколько заполнено. */
type Piece = { total: number; filled: number }
type Draft = { label: string; folded: boolean; pieces: Map<string, Piece> }

/** Штука считается записанной, только когда заполнены ВСЕ её единицы. */
function complete(draft: Draft): number {
  return [...draft.pieces.values()].filter((piece) => piece.filled === piece.total).length
}

/**
 * Раздел брифа → группа чек-листа.
 *
 * Сам отмечается ТОЛЬКО одиночный пункт — тот, что вырос из одного поля
 * `- **Поле:**`. У свёрнутого «заполнено» вывести нельзя: шаблон не знает,
 * сколько у бизнеса отзывов и вопросов. Поэтому у него живая галочка,
 * а рядом `inBrief` — сколько штук уже записано.
 *
 * Штука — это пункт списка или строка таблицы целиком, а не единица
 * парсера. У FAQ пункт состоит из двух единиц (вопрос и ответ), и восемь
 * заполненных вопросов с ответами обязаны показать «в брифе: 8», а не 16
 * при подписи «5–10 штук». Вопрос без ответа не штука вовсе: подпись
 * говорит «с ответами», а правило 8 требует ответы прямо в HTML. Что
 * работа начата, видно по `pnpm check-brief` — он по-прежнему считает
 * единицы и покажет вопрос отдельно от ответа.
 */
export function foldSection(section: BriefSection): ChecklistGroup {
  const name = clean(section.name.replace(NUMBER, ''))
  const drafts = new Map<string, Draft>()

  const put = (field: string, filled: boolean) => {
    const repeat = field.match(REPEAT)
    const label = clean(repeat?.[1] ?? field)
    // Номер штуки; у одиночного поля номера нет — вся метка и есть одна штука.
    const piece = repeat?.[2] ?? ''
    const draft = drafts.get(label) ?? { label, folded: false, pieces: new Map() }
    // Метка, встретившаяся хоть раз с номером, свёрнута навсегда: одиночным
    // считается только то, что нигде не пронумеровано.
    draft.folded ||= repeat !== null
    const counts = draft.pieces.get(piece) ?? { total: 0, filled: 0 }
    counts.total += 1
    counts.filled += filled ? 1 : 0
    draft.pieces.set(piece, counts)
    drafts.set(label, draft)
  }

  // По `fields`, а не по `filled` + `empty`: те два списка дали бы порядок
  // «сначала заполненное», и список переставлялся бы после каждого захода
  // `/start`. Порядок пунктов — порядок брифа.
  for (const field of section.fields) put(field.name, field.filled)

  const items = [...drafts.values()].map((draft) => ({
    id: `${name}::${draft.label}`,
    label: draft.label,
    done: !draft.folded && complete(draft) > 0,
    inBrief: draft.folded ? complete(draft) : 0,
  }))

  return { name, items }
}

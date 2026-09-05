import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { buildChecklist } from '@/lib/checklist'

const brief = readFileSync(join(process.cwd(), 'brief.md'), 'utf8')

/** Все пункты обеих половин чек-листа одним списком. */
const allItems = (text: string) => {
  const { now, later } = buildChecklist(text)
  return [...now, ...later].flatMap((group) => group.items)
}

const labels = (text: string) => allItems(text).map((item) => item.label)

describe('buildChecklist: повторы сворачиваются в один пункт', () => {
  const list = '## 1. Раздел\n**Отзывы клиентов:**\n1.\n2.\n3.\n'

  it('три пустые строки списка дают один пункт с именем метки', () => {
    expect(labels(list)).toEqual(['Отзывы клиентов'])
  })

  it('вопрос и ответ FAQ — одна вещь, которую надо собрать', () => {
    const faq = '## 1. Раздел\n**Частые вопросы:**\n1. **Вопрос:**\n   **Ответ:**\n2. **Вопрос:**\n   **Ответ:**\n'
    expect(labels(faq)).toEqual(['Частые вопросы'])
  })

  it('строки таблицы сворачиваются так же', () => {
    const table = '## 1. Раздел\n**Услуги:**\n\n| А | Б |\n| --- | --- |\n|  |  |\n|  |  |\n'
    expect(labels(table)).toEqual(['Услуги'])
  })
})

/**
 * Сам отмечается только одиночный пункт. У свёрнутого «заполнено» —
 * не факт, а догадка: «хотя бы одна строка» гасит FAQ, у которого есть
 * вопрос и нет ответа, «все строки» — держит галочку снятой у того, кто
 * принёс два отзыва в три заготовленные строки. Поэтому у свёрнутого
 * галочка живая, а число заполненного показано рядом.
 */
describe('buildChecklist: отмечается само только одиночное поле', () => {
  const list = (items: string) => allItems(`## 1. Раздел\n**Отзывы клиентов:**\n${items}\n`)[0]

  it('одиночное поле с текстом — отмечено и заблокировано', () => {
    const section = '## 1. Раздел\n- **Телефон:**\n- **Email:** a@b.kz\n'
    expect(allItems(section)).toEqual([
      { id: 'Раздел::Email', label: 'Email', done: true, inBrief: 0 },
      { id: 'Раздел::Телефон', label: 'Телефон', done: false, inBrief: 0 },
    ])
  })

  it('свёрнутый пункт не отмечается сам даже при всех заполненных строках', () => {
    const item = list('1. Всё понравилось, Айгуль\n2. Спасибо, Ерлан\n3. Рекомендую, Дана')
    expect(item.done).toBe(false)
    expect(item.inBrief).toBe(3)
  })

  it('пустой свёрнутый пункт показывает ноль', () => {
    expect(list('1.\n2.\n3.')).toEqual({
      id: 'Раздел::Отзывы клиентов',
      label: 'Отзывы клиентов',
      done: false,
      inBrief: 0,
    })
  })

  it('FAQ с вопросом без ответа считает одну единицу, а не пункт целиком', () => {
    const faq = '## 1. Раздел\n**Частые вопросы:**\n1. **Вопрос:** Сколько стоит?\n   **Ответ:**\n'
    const item = allItems(faq)[0]
    expect(item.done).toBe(false)
    expect(item.inBrief).toBe(1)
  })

  it('таблица из одной строки — тоже свёрнутый пункт, а не одиночное поле', () => {
    const table = '## 1. Раздел\n**Услуги:**\n\n| А | Б |\n| --- | --- |\n| Уборка | раз в неделю |\n'
    expect(allItems(table)[0]).toMatchObject({ done: false, inBrief: 1 })
  })
})

describe('buildChecklist: подписи для человека', () => {
  it('снимает номер раздела и обратные кавычки разметки', () => {
    const text = '## 2. Языки\n- **Языки сайта (`ru` / `ru,kk`):**\n'
    const { now } = buildChecklist(text)
    expect(now[0].name).toBe('Языки')
    expect(now[0].items[0].label).toBe('Языки сайта (ru / ru,kk)')
  })

  it('в подписях пунктов не остаётся номеров вида «№1»', () => {
    expect(labels(brief).filter((label) => label.includes('№'))).toEqual([])
  })

  it('идентификаторы пунктов уникальны — это ключи галочек в браузере', () => {
    const ids = allItems(brief).map((item) => item.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('buildChecklist: Блок Б показывается отдельно', () => {
  it('разделы после заголовка «БЛОК Б» уходят в later', () => {
    const text =
      '# БЛОК А\n## 1. О бизнесе\n- **Название:**\n' +
      '# БЛОК Б — перед запуском\n## 9. Заявки\n- **Куда слать:**\n'
    const { now, later } = buildChecklist(text)
    expect(now.map((group) => group.name)).toEqual(['О бизнесе'])
    expect(later.map((group) => group.name)).toEqual(['Заявки'])
  })

  it('домен — исключение: он из Блока Б, но нужен рано', () => {
    const text = '# БЛОК Б\n## 8. Домен\n- **Домен:**\n## 9. Заявки\n- **Куда слать:**\n'
    const { now, later } = buildChecklist(text)
    expect(now.map((group) => group.name)).toEqual(['Домен'])
    expect(later.map((group) => group.name)).toEqual(['Заявки'])
  })

  it('на настоящем brief.md домен стоит в раннем списке, а не в позднем', () => {
    const { now, later } = buildChecklist(brief)
    expect(now.map((group) => group.name)).toEqual([
      'О бизнесе',
      'Языки и география',
      'Структура сайта',
      'Контент',
      'Визуал и референсы',
      'Контакты',
      'Реквизиты',
      'Домен',
    ])
    expect(later.map((group) => group.name)).toEqual(['Заявки', 'Аналитика', 'SEO'])
  })

  it('пустых групп в чек-листе нет', () => {
    const { now, later } = buildChecklist(brief)
    expect([...now, ...later].filter((group) => group.items.length === 0)).toEqual([])
  })
})

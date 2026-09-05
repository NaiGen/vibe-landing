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

describe('buildChecklist: когда пункт считается собранным', () => {
  const list = (items: string) => allItems(`## 1. Раздел\n**Отзывы клиентов:**\n${items}\n`)[0]

  it('ни одной заполненной строки — пункт не отмечен', () => {
    expect(list('1.\n2.\n3.').done).toBe(false)
  })

  // Пустые нумерованные строки в брифе — заготовка, а не обязательный
  // минимум: «трёх отзывов» бриф не требует, он просто печатает три строки.
  it('одной заполненной строки хватает: материал собран', () => {
    expect(list('1. Всё понравилось, Айгуль\n2.\n3.').done).toBe(true)
  })

  it('обычное поле отмечено, только когда в нём что-то есть', () => {
    const section = '## 1. Раздел\n- **Телефон:**\n- **Email:** a@b.kz\n'
    expect(allItems(section)).toEqual([
      { id: 'Раздел::Email', label: 'Email', done: true },
      { id: 'Раздел::Телефон', label: 'Телефон', done: false },
    ])
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

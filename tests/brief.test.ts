import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseBrief } from '@/lib/brief'

const one = (text: string) => parseBrief(text)[0]

describe('parseBrief: поля', () => {
  it('пустое поле считает незаполненным, а заполненное — заполненным', () => {
    const section = one('## Раздел\n- **Телефон:**\n- **Email:** a@b.kz\n')
    expect(section.empty).toEqual(['Телефон'])
    expect(section.filled).toEqual(['Email'])
  })

  it('раздел без единого пункта в счёт не идёт', () => {
    expect(parseBrief('## Пусто\nпросто текст\n')).toEqual([])
  })
})

describe('parseBrief: таблицы', () => {
  const table = (rows: string) =>
    one(`## Раздел\n**Услуги:**\n\n| Название | Описание | Цена |\n| --- | --- | --- |\n${rows}\n`)

  it('шапку и разделитель не считает', () => {
    const section = table('| Уборка | раз в неделю | 20 000 ₸ |')
    expect(section.filled).toEqual(['Услуги №1'])
    expect(section.empty).toEqual([])
  })

  it('строка из пустых ячеек — не заполнена', () => {
    expect(table('|  |  |  |').empty).toEqual(['Услуги №1'])
  })

  it('одной заполненной ячейки из трёх достаточно', () => {
    expect(table('|  | раз в неделю |  |').filled).toEqual(['Услуги №1'])
  })

  it('пустая таблица — только шапка и разделитель — даёт «не заполнено»', () => {
    const section = one('## Раздел\n**Услуги:**\n\n| А | Б |\n| --- | --- |\n\nдальше текст\n')
    expect(section.empty).toEqual(['Услуги'])
    expect(section.filled).toEqual([])
  })

  it('считает каждую строку отдельно', () => {
    const section = table('| Уборка |  |  |\n|  |  |  |')
    expect(section.filled).toEqual(['Услуги №1'])
    expect(section.empty).toEqual(['Услуги №2'])
  })
})

describe('parseBrief: нумерованные списки', () => {
  const list = (items: string) => one(`## Раздел\n**Преимущества:**\n${items}\n`)

  it('список из одних номеров — не заполнен', () => {
    const section = list('1.\n2.\n3.')
    expect(section.empty).toEqual(['Преимущества №1', 'Преимущества №2', 'Преимущества №3'])
    expect(section.filled).toEqual([])
  })

  it('пункт с текстом — заполнен', () => {
    expect(list('1. Работаем 10 лет\n2.').filled).toEqual(['Преимущества №1'])
  })

  it('пункт-заготовка «1. **Вопрос:**» без ответа — не заполнен', () => {
    expect(list('1. **Вопрос:**').empty).toEqual(['Преимущества №1'])
  })

  it('тот же пункт с ответом — заполнен', () => {
    expect(list('1. **Вопрос:** Сколько стоит?').filled).toEqual(['Преимущества №1'])
  })
})

describe('parseBrief: раздел закрыт только целиком', () => {
  it('заполненное поле не закрывает раздел с пустой таблицей и списком', () => {
    const section = one(
      '## Раздел\n- **Телефон:** +7 700 000 00 00\n\n**Услуги:**\n\n| А | Б |\n| --- | --- |\n|  |  |\n\n**Преимущества:**\n1.\n',
    )
    expect(section.filled).toEqual(['Телефон'])
    expect(section.empty).toEqual(['Услуги №1', 'Преимущества №1'])
  })
})

describe('parseBrief: настоящий brief.md', () => {
  const sections = parseBrief(readFileSync(join(process.cwd(), 'brief.md'), 'utf8'))
  const find = (name: string) => sections.find((section) => section.name === name)!

  it('раздел «Контент» больше не сводится к одному полю', () => {
    const content = find('4. Контент')
    expect(content.filled.length + content.empty.length).toBeGreaterThan(1)
  })

  it('видит услуги, преимущества, FAQ, отзывы и кейсы', () => {
    const content = find('4. Контент')
    expect(content.empty).toContain('Услуги / товары №1')
    expect(content.empty).toContain('Преимущества (5–7 пунктов с пояснением) №1')
    expect(content.empty).toContain('Частые вопросы (5–10 штук с ответами) №1')
    expect(content.empty).toContain('Отзывы клиентов №1')
    expect(content.empty).toContain('Кейсы / портфолио №1')
  })

  it('в пустом шаблоне не заполнено ничего', () => {
    expect(sections.every((section) => section.filled.length === 0)).toBe(true)
  })
})

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

  it('пункт-заготовка «1. **Вопрос:**» без текста — не заполнен', () => {
    expect(list('1. **Вопрос:**').empty).toEqual(['Преимущества №1: Вопрос'])
  })

  it('тот же пункт с текстом — заполнен', () => {
    expect(list('1. **Вопрос:** Сколько стоит?').filled).toEqual(['Преимущества №1: Вопрос'])
  })
})

describe('parseBrief: FAQ — вопрос и ответ считаются отдельно', () => {
  const faq = (items: string) => one(`## Раздел\n**Частые вопросы:**\n${items}\n`)

  it('три вопроса с пустыми ответами дают 3 из 6', () => {
    const section = faq(
      '1. **Вопрос:** Сколько стоит?\n   **Ответ:**\n' +
        '2. **Вопрос:** Как долго?\n   **Ответ:**\n' +
        '3. **Вопрос:** Есть гарантия?\n   **Ответ:**',
    )
    expect(section.filled).toEqual([
      'Частые вопросы №1: Вопрос',
      'Частые вопросы №2: Вопрос',
      'Частые вопросы №3: Вопрос',
    ])
    expect(section.empty).toEqual([
      'Частые вопросы №1: Ответ',
      'Частые вопросы №2: Ответ',
      'Частые вопросы №3: Ответ',
    ])
  })

  it('вопрос вместе с ответом закрывают обе единицы', () => {
    const section = faq('1. **Вопрос:** Сколько стоит?\n   **Ответ:** От 100 000 ₸.')
    expect(section.filled).toEqual(['Частые вопросы №1: Вопрос', 'Частые вопросы №1: Ответ'])
    expect(section.empty).toEqual([])
  })

  it('пустой блок FAQ не заполнен целиком', () => {
    const section = faq('1. **Вопрос:**\n   **Ответ:**\n2. **Вопрос:**\n   **Ответ:**')
    expect(section.filled).toEqual([])
    expect(section.empty).toEqual([
      'Частые вопросы №1: Вопрос',
      'Частые вопросы №1: Ответ',
      'Частые вопросы №2: Вопрос',
      'Частые вопросы №2: Ответ',
    ])
  })

  it('ответ привязывается к своему вопросу, а не к предыдущему списку', () => {
    const section = one(
      '## Раздел\n**Преимущества:**\n1. Работаем 10 лет\n\n**Частые вопросы:**\n1. **Вопрос:** Сколько?\n   **Ответ:**\n',
    )
    expect(section.filled).toEqual(['Преимущества №1', 'Частые вопросы №1: Вопрос'])
    expect(section.empty).toEqual(['Частые вопросы №1: Ответ'])
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

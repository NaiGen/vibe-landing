import { afterEach, describe, expect, it } from 'vitest'
import { readTicks, writeTicks } from '@/lib/checklist-ticks'

/**
 * jsdom в шаблоне нет, и заводить его ради одного теста — лишняя
 * зависимость. Хранилище подменяется прямо в globalThis: readTicks
 * и writeTicks обращаются к нему через globalThis.localStorage
 * и ничего больше из браузера не трогают, так что node-окружения хватает.
 * Что галочка держится после перезагрузки, проверено в браузере отдельно.
 */
function fakeStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial))
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
    clear: () => data.clear(),
    key: (index: number) => [...data.keys()][index] ?? null,
    get length() {
      return data.size
    },
  } satisfies Storage
}

function install(value: unknown) {
  Object.defineProperty(globalThis, 'localStorage', { value, configurable: true })
}

/** Приватное окно Safari и «блокировать данные сайтов»: бросает на самом доступе. */
function installThrowing() {
  Object.defineProperty(globalThis, 'localStorage', {
    get() {
      throw new DOMException('storage is disabled')
    },
    configurable: true,
  })
}

afterEach(() => install(undefined))

describe('галочки чек-листа в localStorage', () => {
  it('записанное читается обратно', () => {
    install(fakeStorage())
    writeTicks({ 'Контакты::Телефон': true })
    expect(readTicks()).toEqual({ 'Контакты::Телефон': true })
  })

  it('снятая галочка не считается поставленной', () => {
    install(fakeStorage())
    writeTicks({ 'Контакты::Телефон': false })
    expect(readTicks()['Контакты::Телефон']).toBe(false)
  })

  it('пустое хранилище — пустой набор, а не падение', () => {
    install(fakeStorage())
    expect(readTicks()).toEqual({})
  })

  it('испорченное значение не роняет страницу', () => {
    install(fakeStorage({ 'landing:checklist': 'не json' }))
    expect(readTicks()).toEqual({})
  })

  it('чужой тип значения не роняет страницу', () => {
    install(fakeStorage({ 'landing:checklist': '["массив"]' }))
    expect(readTicks()).toEqual({})
  })

  it('хранилища нет вовсе — читается пустой набор, запись молчит', () => {
    install(undefined)
    expect(readTicks()).toEqual({})
    expect(() => writeTicks({ a: true })).not.toThrow()
  })

  it('хранилище запрещено браузером — тоже без падения', () => {
    installThrowing()
    expect(readTicks()).toEqual({})
    expect(() => writeTicks({ a: true })).not.toThrow()
  })
})

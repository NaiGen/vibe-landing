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

  /**
   * Чек-лист рендерится ДВУМЯ экземплярами списка — «собрать сейчас»
   * и «перед запуском», — и у каждого своя копия состояния, снятая
   * при монтировании. Пока запись клала в хранилище весь объект целиком,
   * второй экземпляр стирал галочку первого: кто нажал последним, тот
   * и переписал. На экране две галочки, после перезагрузки — одна.
   */
  it('галочка второго списка не стирает галочку первого', () => {
    install(fakeStorage())
    // Оба экземпляра смонтировались и сняли копию пустого хранилища.
    const later = readTicks()
    const now = readTicks()

    writeTicks({ ...later, 'SEO::Ключевые запросы': true })
    writeTicks({ ...now, 'О бизнесе::Название компании': true })

    expect(readTicks()).toEqual({
      'SEO::Ключевые запросы': true,
      'О бизнесе::Название компании': true,
    })
  })

  it('снятие галочки переживает слияние: false остаётся false', () => {
    install(fakeStorage())
    writeTicks({ 'SEO::Ключевые запросы': true })
    writeTicks({ 'SEO::Ключевые запросы': false })
    expect(readTicks()['SEO::Ключевые запросы']).toBe(false)
  })

  it('хранилище запрещено браузером — тоже без падения', () => {
    installThrowing()
    expect(readTicks()).toEqual({})
    expect(() => writeTicks({ a: true })).not.toThrow()
  })
})

import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseBrief } from '@/lib/brief'

/**
 * Тесты не парсера, а самого документа `brief.md`: что в нём есть и в какой
 * форме это записано. Отдельным файлом от `brief.test.ts` (тот про правила
 * разбора) — иначе они растут вместе и файл перестаёт читаться.
 *
 * Форма здесь важнее содержания: строка, оформленная дефисным подпунктом
 * без звёздочек, парсеру не видна, поэтому не попадает ни в `check-brief`,
 * ни в чек-лист первого экрана. Так однажды пропали фотографии и соцсети.
 */
describe('brief.md: что видит парсер', () => {
  const sections = parseBrief(readFileSync(join(process.cwd(), 'brief.md'), 'utf8'))
  const find = (name: string) => sections.find((section) => section.name === name)!
  const units = sections.reduce((sum, section) => sum + section.filled.length + section.empty.length, 0)

  it('раздел «Контент» больше не сводится к одному полю', () => {
    const content = find('4. Контент')
    expect(content.filled.length + content.empty.length).toBeGreaterThan(1)
  })

  it('видит услуги, преимущества, FAQ, отзывы и кейсы', () => {
    const content = find('4. Контент')
    expect(content.empty).toContain('Услуги / товары №1')
    expect(content.empty).toContain('Преимущества (5–7 пунктов с пояснением) №1')
    expect(content.empty).toContain('Частые вопросы (5–10 штук с ответами) №1: Вопрос')
    expect(content.empty).toContain('Частые вопросы (5–10 штук с ответами) №1: Ответ')
    expect(content.empty).toContain('Отзывы клиентов №1')
    expect(content.empty).toContain('Кейсы / портфолио №1')
  })

  // Фотографии — единственное в брифе, что нельзя надиктовать в чате,
  // и самая физическая позиция чек-листа. Пока они были дефисными
  // подпунктами, их не было ни в счётчике, ни на экране.
  it('видит фотографии, соцсети и страницы кроме главной', () => {
    expect(find('5. Визуал и референсы').empty).toContain('Фото команды и офиса')
    expect(find('5. Визуал и референсы').empty).toContain('Фото товаров или процесса работы')
    expect(find('6. Контакты').empty).toContain('Instagram')
    expect(find('6. Контакты').empty).toContain('YouTube')
    expect(find('6. Контакты').empty).toContain('TikTok')
    expect(find('3. Структура сайта').empty).toContain(
      'Страницы кроме главной (о компании, доставка — или «только главная»)',
    )
  })

  // Подпись пункта называет вещь, а не способ её записать: файл автор сайта
  // присылает Claude в чат, путь к нему записывает Claude.
  it('в подписях полей не осталось «путь к файлу»', () => {
    const names = sections.flatMap((section) => [...section.filled, ...section.empty])
    expect(names.filter((name) => name.includes('путь к файлу'))).toEqual([])
  })

  it('в пустом шаблоне не заполнено ничего', () => {
    expect(sections.every((section) => section.filled.length === 0)).toBe(true)
  })

  // Знаменатель `check-brief` — число, на которое опирается самопроверка
  // скила `/start`: после записи ответов оно обязано остаться прежним.
  // Изменилось — значит тронута структура брифа, а не только значения.
  it('единиц подсчёта ровно 70', () => {
    expect(units).toBe(70)
  })
})

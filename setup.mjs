#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'
import { PLACEHOLDER } from './lib/placeholders.ts'
import { formatKzPhoneDisplay, normalizeKzPhone } from './lib/phone.ts'

/**
 * Первичная настройка. Делает то же, что сделала бы модель,
 * но детерминированно и бесплатно.
 */

// На не-интерактивном вводе (пайп, скрипт, запуск моделью) rl.question()
// зависает намертво после первого вопроса: на non-TTY потоке readline
// эмитит все строки сразу, а не по мере вызовов question(), и хвост
// вопросов не получает ответа. Лучше явно отказаться, чем сжечь лимиты
// в бесконечном ожидании.
if (!stdin.isTTY) {
  console.log('\nЭтот скрипт нужно запускать руками в терминале — он ждёт ответы по одному.')
  console.log('Через пайп или из скрипта (в том числе от имени Claude) он зависнет.')
  console.log('Альтернатива: заполни lib/site.ts напрямую, без pnpm setup.\n')
  process.exit(1)
}

const rl = createInterface({ input: stdin, output: stdout })

const questions = [
  { key: 'name', text: 'Название компании', placeholder: PLACEHOLDER.name },
  { key: 'legalName', text: 'Юридическое лицо (например ТОО «Ромашка»)', placeholder: PLACEHOLDER.legalName },
  { key: 'bin', text: 'БИН / ИИН', placeholder: PLACEHOLDER.bin },
  { key: 'domain', text: 'Домен без https:// и без www (например romashka.kz)', placeholder: PLACEHOLDER.domain },
  { key: 'phone', text: 'Телефон в формате +7 700 123 45 67', placeholder: PLACEHOLDER.phoneDisplay },
]

console.log('\nНастройка проекта. Пустой ответ оставит заглушку.\n')

const answers = {}
for (const question of questions) {
  answers[question.key] = (await rl.question(`${question.text}: `)).trim()
}
rl.close()

const original = readFileSync('lib/site.ts', 'utf8')
let site = original

/**
 * Ответ уходит внутрь TS-строки в одинарных кавычках. Апостроф в названии
 * («D'Art Studio», «O'Key») и обратный слеш иначе рвут литерал, и ученик
 * получает стену ошибок tsc раньше, чем первый экран сайта.
 *
 * Замена функцией, а не строкой: в строке замены `$&` и `$'` — управляющие
 * последовательности replaceAll, функция их отключает.
 */
const toTsLiteral = (value) => () => value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")

if (answers.name) site = site.replaceAll(PLACEHOLDER.name, toTsLiteral(answers.name))
if (answers.legalName) site = site.replaceAll(PLACEHOLDER.legalName, toTsLiteral(answers.legalName))
if (answers.bin) site = site.replaceAll(PLACEHOLDER.bin, toTsLiteral(answers.bin))

let domain = ''
if (answers.domain) {
  // Нижний регистр — первым делом. Домены регистронезависимы, Romashka.KZ
  // и romashka.kz — один адрес, и в конфиг должен попадать один вид.
  // Без этого ответ «HTTPS://WWW.Romashka.KZ/» не подходил под шаблоны ниже
  // и уезжал в SITE.url целиком: url: 'https://HTTPS://WWW.Romashka.KZ'.
  domain = answers.domain
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/+$/, '')
  site = site.replaceAll(PLACEHOLDER.domain, toTsLiteral(domain))
}

if (answers.phone) {
  const display = formatKzPhoneDisplay(answers.phone)
  const raw = normalizeKzPhone(answers.phone)

  if (display && raw) {
    site = site.replaceAll(PLACEHOLDER.phoneDisplay, display).replaceAll(`+${PLACEHOLDER.whatsapp}`, raw)
    site = site.replaceAll(`number: '${PLACEHOLDER.whatsapp}'`, `number: '${raw.slice(1)}'`)
  } else {
    console.log('\n⚠️  Не разобрал номер как казахстанский — телефон в lib/site.ts не тронут, поправь вручную.\n')
  }
}

if (site !== original) writeFileSync('lib/site.ts', site)

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const packageName = domain
  .toLowerCase()
  .replace(/[^a-z0-9-]/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-+|-+$/g, '')

if (packageName && pkg.name !== packageName) {
  pkg.name = packageName
  writeFileSync('package.json', `${JSON.stringify(pkg, null, 2)}\n`)
}

console.log('\n✅ lib/site.ts заполнен. Дальше:')
console.log('   pnpm test        — проверить, что заглушек не осталось')
console.log('   pnpm dev         — запустить и открыть http://localhost:3000')
console.log('   заполни brief.md — и скажи Claude: /brand-init\n')

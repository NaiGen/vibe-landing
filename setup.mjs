#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'

/**
 * Первичная настройка. Делает то же, что сделала бы модель,
 * но детерминированно и бесплатно.
 */

const rl = createInterface({ input: stdin, output: stdout })

const questions = [
  { key: 'name', text: 'Название компании', placeholder: 'Пример Сервис' },
  { key: 'legalName', text: 'Юридическое лицо (например ТОО «Ромашка»)', placeholder: 'ТОО «Пример»' },
  { key: 'bin', text: 'БИН / ИИН', placeholder: '000000000000' },
  { key: 'domain', text: 'Домен без https:// и без www (например romashka.kz)', placeholder: 'example.kz' },
  { key: 'phone', text: 'Телефон в формате +7 700 123 45 67', placeholder: '+7 700 000 00 00' },
]

console.log('\nНастройка проекта. Пустой ответ оставит заглушку.\n')

const answers = {}
for (const question of questions) {
  answers[question.key] = (await rl.question(`${question.text}: `)).trim()
}
rl.close()

let site = readFileSync('lib/site.ts', 'utf8')

if (answers.name) site = site.replaceAll('Пример Сервис', answers.name)
if (answers.legalName) site = site.replaceAll('ТОО «Пример»', answers.legalName)
if (answers.bin) site = site.replaceAll('000000000000', answers.bin)

if (answers.domain) {
  const domain = answers.domain.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/+$/, '')
  site = site.replaceAll('example.kz', domain)
}

if (answers.phone) {
  const raw = `+${answers.phone.replace(/\D/g, '').replace(/^8/, '7')}`
  site = site.replaceAll('+7 700 000 00 00', answers.phone).replaceAll('+77000000000', raw)
  site = site.replaceAll("number: '77000000000'", `number: '${raw.slice(1)}'`)
}

writeFileSync('lib/site.ts', site)

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
if (answers.domain) pkg.name = answers.domain.replace(/\./g, '-')
writeFileSync('package.json', `${JSON.stringify(pkg, null, 2)}\n`)

console.log('\n✅ lib/site.ts заполнен. Дальше:')
console.log('   pnpm test        — проверить, что заглушек не осталось')
console.log('   pnpm dev         — запустить и открыть http://localhost:3000')
console.log('   заполни brief.md — и скажи Claude: /brand-init\n')

import { readBriefProgress } from '../lib/brief.ts'

const sections = readBriefProgress()

let total = 0
let done = 0

for (const { name, filled, empty } of sections) {
  total += filled.length + empty.length
  done += filled.length
  console.log(`${empty.length === 0 ? '✅' : '⬜'} ${name} — ${filled.length}/${filled.length + empty.length}`)
  for (const field of empty) console.log(`     не заполнено: ${field}`)
}

console.log(`\nИтого: ${done}/${total}`)
if (done < total) console.log('Заполни brief.md, потом скажи Claude: /brand-init')

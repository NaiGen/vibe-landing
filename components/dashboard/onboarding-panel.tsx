import { readChecklist } from '@/lib/checklist'
import { DASHBOARD } from '@/lib/content/dashboard'
import { PLACEHOLDER_LIST } from '@/lib/placeholders'
import { SITE } from '@/lib/site'
import { TestLeadButton } from '@/components/lead/test-lead-button'
import { ChecklistGroups } from '@/components/dashboard/checklist-groups'

/**
 * Первый экран форкнутого шаблона: чек-лист того, что собрать до начала
 * работы. Рендерится НАД содержимым главной, пока в `lib/site.ts`
 * остаётся хоть одна заглушка из `PLACEHOLDER_LIST`. Как только их
 * не остаётся — возвращает `null`, и главная выглядит как обычная главная.
 * Удалять руками нечего.
 *
 * Строже guard-теста, а не мягче: `remaining` сверяется со ВСЕМ
 * `PLACEHOLDER_LIST` (шесть записей), а не с подмножеством. Панель не имеет
 * права сказать «готово», пока `pnpm test` красный.
 *
 * Ученик видит этот экран на временном домене Vercel РАНЬШЕ, чем открывает
 * редактор: путь на самом деле такой — Use this template → Deploy → клон
 * в VS Code → разговор с Claude. Поэтому здесь нет ни одной команды, ни
 * одного пути к файлу и ни слова про терминал: это экран для человека,
 * который собирает материалы, а не запускает сборку.
 *
 * ОФОРМЛЕНИЕ — единственное исключение из правила «дизайна в шаблоне нет»,
 * и вот почему: экран исчезает вместе с заглушками, то есть до того, как
 * у сайта появится собственный дизайн, — а прочитать его должен человек,
 * которому читать пока нечего кроме него. Разрешено минимально: отступы,
 * читаемая ширина колонки, различимые группы, нормальные чекбоксы.
 * Классы живут ТОЛЬКО внутри `components/dashboard/*`; ни цветов,
 * ни новых токенов здесь не заводится.
 */
export function OnboardingPanel() {
  // Аннотация `string[]` обязательна: SITE закрыт `as const`, поля имеют
  // литеральные типы, и без расширения сравнение со строкой — ошибка TS2367
  // ровно с того момента, как ученик заполнит site.ts.
  const siteValues: string[] = [
    SITE.domain,
    SITE.primaryPhone.display,
    SITE.whatsapp.number,
    SITE.bin,
    SITE.name,
    SITE.legalName,
  ]
  const remaining = PLACEHOLDER_LIST.filter((placeholder) => siteValues.includes(placeholder.value))
  if (remaining.length === 0) return null

  const { now, later } = readChecklist()

  return (
    <section className="mx-auto max-w-2xl space-y-8 p-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">{DASHBOARD.title}</h2>
        <p>{DASHBOARD.intro}</p>
        <p className="text-sm opacity-70">{DASHBOARD.fromBriefNote}</p>
      </div>

      {now.length === 0 && later.length === 0 ? <p>{DASHBOARD.noBrief}</p> : null}

      <ChecklistGroups groups={now} />

      {later.length > 0 ? (
        <div className="space-y-3 border-t pt-6">
          <h2 className="text-xl font-semibold">{DASHBOARD.laterTitle}</h2>
          <p className="text-sm opacity-70">{DASHBOARD.laterNote}</p>
          <ChecklistGroups groups={later} />
        </div>
      ) : null}

      <div className="space-y-2 border-t pt-6">
        <h2 className="text-xl font-semibold">{DASHBOARD.leadsTitle}</h2>
        <p>{DASHBOARD.leadsText}</p>
        <TestLeadButton />
      </div>

      <p className="border-t pt-6">{DASHBOARD.next}</p>
    </section>
  )
}

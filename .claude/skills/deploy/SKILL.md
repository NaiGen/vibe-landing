---
name: deploy
description: Опубликовать сайт на Vercel и подключить домен. Использовать при запросах «задеплой», «опубликуй сайт», «выложи на хостинг», «подключи домен».
---

# Публикация на Vercel

1. Сначала прогони `/seo-check`. Не публикуй с красным guard-тестом.
2. Убедись, что всё закоммичено и запушено в GitHub.
3. Импортируй репозиторий в Vercel: New Project → Import Git Repository.
4. Переменные окружения в Vercel (Settings → Environment Variables):
   - `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` — если заявки идут в Telegram
   - `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_YM_ID`, `NEXT_PUBLIC_FB_PIXEL_ID` — если есть
   Напомни, что после добавления переменных нужен повторный деплой:
   переменные не подхватываются в уже собранный проект.
5. Домен: Settings → Domains.
   - Добавь **apex-домен** (`example.kz`) как основной.
   - Добавь `www.example.kz` и выбери **Redirect to example.kz**.
     Канонический адрес сайта — без `www`.
6. Проверь на бою:
   - `https://<домен>` открывается, сертификат валиден
   - `https://www.<домен>` редиректится на адрес без `www`
   - `/robots.txt` соответствует режиму `SITE.indexable`
   - форма отправляет заявку и она доходит
7. Если сайт публичный — добавь его в Google Search Console
   и отправь `sitemap.xml`.

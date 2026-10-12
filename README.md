# ERDCBB — интерактивный брендбук АО «КРДВ»

Полнофункциональная веб-версия фирменного руководства КРДВ: позиционирование, логотипы, дочерние общества, режимы, палитры, шрифты, носители, фотостиль и скачивание оригиналов.

**[Опубликованный сайт](https://imonsergey.github.io/ERDCBB/)**

## Локальный запуск

```bash
cd krdv-guidelines-prototype
npm ci
npm run dev
```

## Проверка

```bash
npm run check
npx playwright install chromium
npm run test:e2e
```

- `npm run check`: production build, проверки контента и ассетов, тесты Sites Worker.
- `npm run test:e2e`: Playwright Chromium, desktop и mobile, все 14 страниц, навигация, история, скролл, палитры и анимации.
- `GITHUB_PAGES=true npm run build`: production build с базовым URL /ERDCBB/.
- `npm run optimize:video`: отдельная команда обработки видео (не запускается при обычной сборке).

## Архитектура

- `src/App.jsx` — маршрутизация, оболочка, жизненный цикл, доступность меню.
- `src/components/Navigation.jsx` — навигационная система.
- `src/components/GuidelinePage.jsx` — универсальный рендерер разделов.
- `src/components/AssetLibraries.jsx` — библиотеки логотипов и исходников.
- `src/components/ContentBlocks.jsx` — типографика, палитры, спецификации и контент.
- `src/components/Hero.jsx` и `SmartVideo.jsx` — видео, анимация, отложенный шейдер.
- `src/data/pages.js` — источник страниц и маршрутов.
- `src/data/resources.js`, `palette.js`, `identity.js` — контентные каталоги.
- `src/lib/clipboard.js`, `typograf.js` — независимые утилиты.
- `src/styles/` — CSS по назначению, импорты в правильном порядке.
- `public/` — оригинальные файлы бренда, видео, постеры, шрифты.

Реализация — React 19 + Vite 6 + Motion + GSAP, статическая hash-маршрутизация, GitHub Pages и отдельная упаковка Sites. Пользовательские интерфейсы должны сохранять фирменный стиль, а анимации — уважать reduced motion.

## Публикация

Ветка `main` публикуется на GitHub Pages по существующему GitHub Actions workflow. Сейчас он выполняет сборку, но **не запускает полный набор проверок и E2E**. Перед merge необходимо выполнить `npm run check` и `npm run test:e2e` вручную или в CI. Подключение отдельного workflow качества требует разрешения GitHub `workflow`; пока такого разрешения нет. Прямой деплой без проверки в `main` не рекомендуется.

Текущая карта: [brandbook-map.md](krdv-guidelines-prototype/brandbook-map.md). Актуальные ограничения: [design-qa.md](krdv-guidelines-prototype/design-qa.md).

**Лицензии:** оригинальные шрифтовые файлы в публичном репозитории; необходимо документально подтвердить право на их открытую дистрибуцию. Не менять утверждённые фирменные знаки и правила без согласования.

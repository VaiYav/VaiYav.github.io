# Self-pitch — версии под этапы

> **Контекст:** первый звонок — сразу с AI Tech Lead (без рекрутера).
> Это не intro, это **знайомство** уровня "спiвбесiда-знайомство".
> Веди технически с первой минуты, без HR-формальностей.

## Версия 2-min (ВЕДУЩАЯ — для звонка с Tech Lead)

Структура: **контекст → 3 плоскости → почему вы**.

> **Контекст (10 сек).** Я Full-Stack Product Engineer, 8 лет. Последние 1.5 года живу на пересечении AI и продукта. Делю работу на три плоскости: продакт-инжиниринг, AI-интеграции, и AI-тулинг для других инженеров.
>
> **Продакт-инжиниринг (30 сек).** 4 года в Oboard — SaaS для OKR. Sеньор-фронт + feature owner: OKR-дашборд и аналитика от стейкхолдеров до прода, дизайн-система, embed в Monday/Salesforce/Jira/Confluence — 5 версий из одной кодбазы. Параллельно 3+ внутренних тулзы для QA, сэкономили ~40% manual work. Это и есть скилл который вы описываете в вакансии — внутренние тулзы для нетехнических команд.
>
> **AI-интеграции (40 сек).** С 2025 — Soulwise AI как Full-Stack Engineer. Астрология, 100k+ юзеров, web + Capacitor iOS/Android, NestJS + MongoDB. Построил RAG на Qdrant, multi-provider роутинг OpenAI/Claude/Gemini с fallback, prompt caching, batch API для генерации гороскопов на масштабе. Bundle ужал 250→160 KB, -36%. Параллельно консультирую 3 продакт-команды по AI-roadmap — выбор провайдеров, dependency-матрицы, integration playbooks. И solo SaaS My Zodiac AI: от 0 до 1500 платящих за 4 месяца, без команды.
>
> **AI-тулинг (20 сек).** speckit-product-forge — мой open-source. Расширение GitHub Spec Kit. 8 плагинов, 127 skills, 19 sub-agents для Claude Code. Это не "пробовал" — это мой production-workflow ежедневно.
>
> **Почему вы (20 сек).** Вы пишете "немає legacy, карт-бланш на стек, нетехнічні команди користувалися самостійно" — это ровно то, что я делаю последние полтора года. Хочу делать с большим масштабом и в команде где AI-first это норма, а не разговор. И — ваш свежий запуск с LLM-пайплайном на миллионы креативов мне резонирует, у меня прод-опыт с похожим паттерном.

**Time check:** репетируй ровно 2 минуты. Засеки. Меньше — звучит скомкано. Больше — Tech Lead начнёт прерывать.

## Версия 5-min (для финала с CTO / bar-raising)

Здесь добавляем глубину архитектуры и кейсы по STAR. Структура:
**Контекст → 3 кейса STAR → System design → Вопросы.**

### Контекст (30 сек)
Как выше — кто я, чем занимаюсь.

### Кейс 1: My Zodiac AI (90 сек) — proof end-to-end ownership

**Situation:** Хотел проверить, могу ли я в одиночку довести SaaS от 0 до денег.

**Task:** Астрология + AI. Web + Android. Платежи. Контент-генерация на масштабе.

**Action:**
- Стек: Nuxt 3 + NestJS + MongoDB + Redis + Qdrant + Capacitor.
- AI: multi-provider (OpenAI primary, Claude fallback, Gemini для длинного контекста), prompt caching, batch API для генерации гороскопов на большие когорты.
- RAG: embeddings на астрологические тексты в Qdrant, контекст в промпт для персонализации.
- Очереди: BullMQ для batch генерации.
- Деплой: Docker → VPS, GitHub Actions CI/CD.
- Платежи: Stripe + Google Play In-App.

**Result:** 1500 платящих юзеров за 4 месяца. CAC окупается с первого месяца. На Android — стабильные 4.5★.

### Кейс 2: Soulwise AI performance (60 сек)

**S:** Большой Nuxt app, 250 KB bundle, медленный LCP на мобиле в Африке/SEA.
**T:** Срезать bundle, починить TTFP, не сломать фичи.
**A:** Route-based code splitting + dynamic imports для i18n + tree-shaking аудит + lazy для heavy charts + перенос части на server components.
**R:** 250 → 160 KB (-36%), LCP -1.2s p75, conversion на free trial +8%.

### Кейс 3: AI Consulting (60 сек)

**S:** 3 разных клиента, product teams без AI-опыта.
**T:** Команда сама ведёт AI-фичи через 2-4 недели.
**A:** Dependency matrix (provider/infra/data/product), cost-modelling, integration playbook, code-review агент в CI.
**R:** Первая AI-фича в проде за 2-4 недели у каждого. AI-ревью снимало 30% нагрузки.

### System design на доске (90 сек)

Если попросят порисовать "LLM-пайплайн на миллионы креативов" — см. отдельно файл `_cheatsheets/10-system-design-ai.md`. Базовая схема:

```
Source → Queue → Workers → Cache → Cascading LLM (Haiku→Sonnet→o1)
  → Structured Output → Storage (Postgres + S3 + ClickHouse)
  → UI + Observability (Langfuse + cost dashboard)
```

С акцентом: cost guard, fallback, dedupe, eval с golden dataset.

### Вопрос к ним (30 сек)
"Какой у вас сейчас main bottleneck — стоимость токенов, latency, или качество? От ответа зависит что я бы делал в первый спринт."

## Версия 30-sec (резерв — если рекрутер всё-таки появится позже)

> "Меня зовут Валентин. 8 лет full-stack, 1.5 года на пересечении AI и продукта. Сейчас одновременно строю Soulwise AI (астрология, 100k+ юзеров, Full-Stack Engineer), консультирую 3 команды по AI-интеграциям, и веду свой open-source — speckit-product-forge с 127 skills и 19 sub-agents для Claude Code. Параллельно solo SaaS My Zodiac AI: 0 → 1500 платящих за 4 месяца. Под вашу вакансию мэтч плотный."

## Tips по подаче

1. **Не извиняйся за гэпы.** "Не делал в проде XGBoost, но понимаю принцип и закрою за спринт" — уверенно.
2. **Конкретика > общие слова.** "250 → 160 KB" сильнее "оптимизировал перформанс".
3. **Числа и пруфы.** GitHub-ссылки на speckit-product-forge — открытое доказательство. Бери ноут, при необходимости делись экраном.
4. **В конце каждого кейса — встречный вопрос им.** "А у вас как с этим?"
5. **Tone:** спокойный, не суетливый. Genesis ценит autonomy — "я знаю что делаю" вместо "я могу научиться".

## Anti-patterns

- ❌ "Я могу всё" — звучит фальшиво
- ❌ "Я хочу учиться" — позиция для тех, кто **уже** умеет
- ❌ Длинные истории про процесс. Они хотят **результат**
- ❌ Извинения за "я не делал X" — замени на "growth area + план как закрыть за спринт"
- ❌ Жаргон без контекста. Если кидаешь "RAG на Qdrant" — следом коротко: **зачем это бизнесу**

## Калибровка тона под Genesis culture (из 04-research.md)

Genesis ценят:
- Энергию ("горить")
- Команду ("мы с командой", не только "я solo")
- Рефлексию (что узнал, что бы сделал иначе)
- Стартап-mindset

Где в питче добавить:
- В кейсе Oboard сказать "мы с командой" — это правда, ты был feature owner с командой
- В Soulwise: "мы с продактом и дизайнером итерировали" — это и есть командная работа
- My Zodiac AI — solo, не маскируй (это твой proof autonomy), но добавь что **сейчас** хочешь работать в команде

## Если попросят "расскажи про самый сложный технический challenge"

**Заготовка:**
> "Соберу из Soulwise. Multi-provider routing с fallback — звучит просто, на бумаге одна страница. На практике вылезло: разные провайдеры возвращают разные форматы structured output (OpenAI strict mode vs Anthropic tool use vs Gemini function calling), у каждого свой rate limit и retry поведение, разные ошибки которые retryable/нет. Сделали слой адаптеров с унифицированной схемой ответа, idempotency keys на каждом вызове, и feature flag кто из провайдеров primary в каждый момент. Параллельно — cost-tracking per request с budget кэп per юзер. Закончили за неделю, но открыло мне что 'use Cloud LLM' — это не одна строка кода, это полноценный distributed systems проект."

## Если попросят "какой код ты пишешь регулярно"

**Заготовка:**
> "Сейчас 70% — TypeScript: Vue/Nuxt на фронте, NestJS на бэке. 20% Python — для ML тулинга и data scripts. 10% Shell / configs / Markdown — для своих speckit-skill'ов. По стилю — функциональный TS с strict mode, dependency injection через NestJS, тесты Vitest + Playwright. С AI ассистентами — Cursor для основной разработки, Claude Code для рефакторингов и большых задач, мои собственные skills для повторяющихся флоу."

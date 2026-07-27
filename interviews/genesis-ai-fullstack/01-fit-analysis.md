# Fit-анализ: Valentyn ↔ Genesis AI Full-Stack Engineer

Метод: каждое требование вакансии → конкретное доказательство из моего опыта → честная оценка фита.

## Сильные стороны (5/5 фит)

### 1. End-to-end ownership "от идеи до production-ready инструмента"

| Их формулировка | Моё доказательство |
|---|---|
| "Будувати AI-інструменти end-to-end" | **My Zodiac AI** — solo: web + Android (Capacitor) + бэк (NestJS) + AI (OpenAI/Claude/Gemini) + RAG (Qdrant) + платежи + деплой. 1500 юзеров за 4 месяца. |
| "Доводити внутрішні AI-прототипи до production-ready" | **Oboard**: 3+ внутренних тулзы для QA, -40% manual work. **AI Integration Consulting**: 3 клиента, end-to-end roadmaps. |
| "MVP без детально розписаного ТЗ за тиждень" | **SpecKit Product Forge** — моя open-source методология как раз про это: spec → AI скэффолдинг → MVP. |

### 2. AI-кодинг ассистенты как базовый стандарт

Самое редкое требование во всей вакансии. Я **автор** инструментария.

- **speckit-product-forge** (open-source): 8 плагинов, 127 skills, 19 sub-agents. Используется в проде.
- Cursor + Claude Code — 90%+ задач прохожу через AI-флоу.
- В резюме это уже подсвечено: "AI-first mindset" — для них это золото.

**Что показать:** GitHub репозиторий + один живой пример как я делаю задачу. Можно даже на тестовом завдании прямо showcase'ить.

### 3. Стек, который у них вероятно используется

| Их (вероятный) стек | Мой опыт |
|---|---|
| TypeScript / Node | ✅ 8 лет, NestJS прод |
| React/Next.js | ✅ Working tier, могу |
| Vue/Nuxt | ✅ Core, 8 лет |
| MongoDB / Postgres | ✅ Mongo прод, Postgres знаю |
| Redis / BullMQ | ✅ Прод опыт (Soulwise) |
| Docker / CI/CD | ✅ Прод, своя ci-pipeline-manager skill |
| OpenAI / Claude / Gemini | ✅ Все три в проде, multi-provider routing |
| Qdrant / Pinecone | ✅ Qdrant в проде (Soulwise) |

### 4. Внутренние тулзы для нетехнических команд

Это **корневая** обязанность роли.

- **Oboard**: построил тулзы для QA, дев-команды, аналитиков. Цикл: "хочу удобнее" → spec → AI scaffolding → ship.
- **AI Integration Consulting**: 3 клиента, каждому делал dependency matrix и playbook для их нетехнических команд.

## Средние стороны (3/5 фит, требует ramp-up)

### 5. Скрейпинг / API-интеграции / NLP-анализ / кластеризация

- **Скрейпинг**: делал на Playwright/Puppeteer, парсил для своих проектов. Не строил pipeline на миллионы запросов в день.
- **API-интеграции**: ежедневно. Слабых мест нет.
- **NLP-анализ**: делал через LLM (классификация, summarization, sentiment). Классический NLP (spaCy, NLTK) — на уровне понимания, не прод.
- **Кластеризация**: делал embedding-based кластеризацию через Qdrant + KMeans. Не делал большие production-системы с миллионами точек.

**Ответ на собесе:** "Я подходил к этим задачам через LLM-first (классификация, embeddings → кластеризация). Это быстрее на маленьких объёмах и хорошо работает для бизнес-задач. Знаю где грань с классическим ML — там где нужен низкий latency и большой объём, переключаюсь на sklearn/HDBSCAN/HuggingFace. С 2025 года вижу, что граница сдвигается в сторону LLM из-за дешевеющих токенов."

### 6. Генеративные пайплайны (массовая генерация контента)

- **Текст**: делал в проде (Soulwise — генерация гороскопов). Знаю prompt caching, structured outputs, batch API.
- **Изображения**: использовал Midjourney/DALL-E/Stable Diffusion для своих проектов. Не строил массовую систему через API.
- **Видео**: не делал в проде. Знаю Sora/Veo/Runway концептуально.

**Ответ на собесе:** "Текст — прод-опыт, со всеми оптимизациями стоимости (caching, batch, выбор провайдера). Изображения и видео — построил бы по тому же паттерну: provider abstraction → queue → cost guard → result store. Дайте задачу — за пару дней покажу архитектуру и PoC."

## Слабые стороны (1-2/5 фит — honest gaps)

### 7. Predictive ML (XGBoost, LightGBM, нейросети)

**Честно**: не моё ядро. Делал классификацию и регрессии через LLM (few-shot) и базовый sklearn для своих экспериментов. Не строил production-prediction систем на табличных данных.

**План закрыть гэп до bar-raising:**
1. Пройти 1 Kaggle-туториал на XGBoost (Titanic / Tabular Playground) — 1 вечер.
2. Прочитать "Practical Statistics for Data Scientists" 5-6 глав — 2 вечера.
3. Понять когда XGBoost vs LightGBM vs CatBoost (см. cheat sheet 04).
4. Сделать один pet-проект: предсказать что-то на публичных данных (например, прогноз CTR креативов из public Facebook Ad Library).

**Что говорить на собесе:** "Predictive ML на табличных данных — growth area. Я подхожу к таким задачам через LLM-классификацию и embedding-based методы, что хорошо работает на старте. Но я понимаю когда XGBoost даст +20% точности — там где есть устойчивые числовые фичи и большой dataset. Готов рампиться: один XGBoost-проект на тестовом могу прогнать."

### 8. LangGraph / агентные системы

**Честно**: строил equivalent на raw Anthropic/OpenAI SDK (multi-agent flows, tool use, routing). LangGraph специфично — оценивал, не деплоил.

**План закрыть гэп:**
1. Пройти LangGraph quickstart — 1 вечер.
2. Собрать minimal multi-agent flow: research agent → writer agent → critic agent.
3. Сравнить с моими raw SDK реализациями — что лучше / хуже.

**Что говорить:** "Концептуально zero gap — построил то же на raw SDK с роутингом, tool use, fallback. Framework-specific muscle memory закрывается за спринт. Если LangGraph — стандарт у вас, перейду."

### 9. Fine-tuning open-source моделей (LoRA, QLoRA)

**Честно**: не делал в проде. Знаю теорию, читал статьи.

**План:**
1. Прогнать один LoRA fine-tune на Colab T4 (например, Mistral 7B на инструкциях).
2. Посчитать стоимость train + inference vs OpenAI API на той же задаче.
3. Понять кейсы когда fine-tune оправдан (узкая задача, высокий volume, privacy).

**Что говорить:** "Fine-tuning делал на уровне Colab экспериментов, не в проде. У моих клиентов всегда LLM-API оказывался дешевле и быстрее в итерации, чем поддержка fine-tuned модели. Но я понимаю когда переключаться — когда задача узкая, volume огромный (>100M tokens/мес), и API становится дороже инфры. Готов закрыть за месяц прод-цикл."

### 10. Deep AWS / GCP

**Честно**: consumer-уровень (S3, Lambda, EC2). Не строил MLOps платформы.

**Что говорить:** "Деплоил приложения, использовал S3/Lambda — но не MLOps platform builder. Cloud-native mindset (stateless, queues, observability) есть из NestJS-прод опыта. Если у вас уже есть DevOps в команде — я пользователь. Если нет — рампился бы за пару месяцев до middle-уровня."

## Соответствие по обязательным требованиям

| Требование | Фит | Комментарий |
|---|---|---|
| 2-3+ года SWE / ML | ✅ 8 лет | overkill, в плюс |
| Full-stack (ML→backend→UI→deploy) | ✅ | core, daily |
| Дизайн систем, структуры данных, хороший код | ✅ | 4 года тех. лида на Oboard |
| AI-кодинг ассистенты постоянно | ✅✅✅ | автор open-source SpecKit |
| Проактивность, MVP за неделю без ТЗ | ✅ | My Zodiac AI — proof |

**Вывод по must-have:** 100% мэтч. Это моя позиция.

**По nice-to-have:** 60% мэтч, остальное — closable gaps. Они **сами** написали "nice-to-have" — значит это не отсев.

## Стратегия на этапы

| Этап | Главный месседж | Что показать | Чего бояться |
|---|---|---|---|
| Интро з рекрутером | "Я Full-Stack продакт-инженер, 8 лет, autor open-source AI-tooling, solo SaaS" | Резюме + GitHub | Спросят зарплату — иметь номер |
| Спiвбесiда-знайомство | Кейсы по STAR: My Zodiac AI / Soulwise / Oboard | Конкретные числа, скрины | Поверхностные ответы про AI без чисел |
| Тестове завдання | Тестовое = демо моего AI-флоу | Cursor/Claude Code live, SpecKit | Не успеть в срок |
| Bar-raising з CTO | System design AI-продукта end-to-end | Архитектура на доске | Глубокие вопросы по ClickHouse / LangGraph |

## Что нужно ещё до старта

- [ ] Подготовить **зарплатный номер** (USD/месяц или day-rate). Genesis обычно платит в верхнем рынке UA.
- [ ] Загуглить какие именно бренды в экосистеме Genesis (Headway, Promova, AmoMama, Solidgate, Hint, Boosters?)
- [ ] Освежить **5 ключевых проектов на GitHub** — закрепить, привести в порядок README
- [ ] Подготовить 60-сек демо My Zodiac AI (можно прислать ссылку на live + Android app)

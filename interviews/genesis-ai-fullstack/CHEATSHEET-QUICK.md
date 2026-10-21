# Quick cheat sheet — Genesis собес

> 1 страница. Освежить за 10 минут перед звонком. Все детали — в `_cheatsheets/`.
>
> ⚠️ **Контекст:** первый звонок — сразу с AI Tech Lead (без рекрутера). Это **не intro**, это **техническое знайомство**. От этого звонка зависит — пускают ли на тестовое (~25% воронки).
>
> 📋 **Перед звонком:**
> 1. Прочитать `05-notes-tech-lead-call.md` — конкретные вопросы которые спросят
> 2. Прочитать `04-genesis-research.md` — bar-raising детали, шаблон ответа про конфликты
> 3. Прочитать `02-self-pitch.md` — 2-min версия ВЕДУЩАЯ

## Контекст компании

- **Genesis** — украинская кофаундерская IT, паблішер неігрових застосунків
- **AI R&D Team** — невелика команда, **внутрішні** AI-продукти для бізнесов екосистеми
- Свежее: LLM-pipeline для миллионов креативов, ClickHouse для GitHub-данных, AI в образовании
- "Немає legacy, карт-бланш на стек"

## Я в 1 предложении

> "Full-Stack Product Engineer, 8 лет, делаю end-to-end AI-инструменты — от Soulwise AI (прод) до своего опен-сорс speckit-product-forge с 127 skill'ами для Claude Code, плюс solo SaaS My Zodiac AI (1500 платящих за 4 месяца)."

## Главные cards

| # | Тема | Релевантность | Мой уровень |
|---|---|---|---|
| 01 | LLM-pipelines (cost) | 🔴 Критично | ✅ Прод |
| 02 | RAG | 🟠 Важно | ✅ Прод |
| 03 | LangGraph агенты | 🟠 Важно | 🟡 Закрыть до bar-raising |
| 04 | Predictive ML | 🔴 Критично | 🔴 Главный гэп |
| 05 | Fine-tuning LoRA | 🟡 Nice | 🟡 Теория ОК, прода нет |
| 06 | Cloud AWS/GCP | 🟡 Nice | 🟡 Consumer level |
| 07 | Scraping pipelines | 🟠 Важно | ✅ Прод (Crawlee, Playwright) |
| 08 | Clustering / NLP | 🟠 Важно | ✅ Прод (embeddings + HDBSCAN) |
| 09 | Generative pipelines | 🟠 Важно | 🟡 Текст ОК, картинка/видео — растущая зона |
| 10 | System design | 🔴 Критично | ✅ |

## Ключевые числа (запомнить дословно)

**My Zodiac AI:** 1,500 платящих юзеров за 4 месяца, solo, web + Android.
**Soulwise AI:** 10k+ юзеров, бандл 250→160 KB (-36%), RAG на Qdrant.
**Oboard:** 4 года Feature Owner, 100% PR-ревью на фронте, embed в 4 платформы.
**speckit-product-forge:** 8 плагинов, 127 skill'ов, 19 sub-agents в open-source.
**AI Consulting:** 3 клиента, end-to-end roadmaps.

## Стоимостные эстимейты на собес

- **1M креативов через LLM**: cascading Haiku→Sonnet + caching + batch = **$5-7k**
- **1M текстов через GPT-4o-mini**: $0.30/M × N → дёшево
- **1M embeddings**: $0.02/M × 200 tokens × 1M = $4
- **1 изображение Imagen/DALL-E**: $0.03-0.08
- **30-сек видео Veo**: $15-30, через Kling/Hailuo: $1.5-4.5

## Архитектура которую часто рисуют

```
Source → Queue → Worker Pool → Cache → LLM Cascading → Validation → Storage
                                  ↓
                          Observability (Langfuse + Sentry + custom $ dashboard)
                                  ↓
                          Cost guard + kill switch
                                  ↓
                          Fallback provider routing
```

Always:
- Multi-provider (OpenAI primary, Claude fallback)
- Prompt caching на static
- Structured outputs
- Schema validation
- Rate limit per-domain
- Idempotency keys

## Гэпы — что говорить (1 фраза каждый)

| Гэп | Что сказать |
|---|---|
| Python deep / FastAPI | "Use for скриптов и ML-tooling, основной прод-бэкенд — NestJS. Паттерны переносимы. За спринт — на прод-уровне FastAPI." |
| LangGraph | "Концептуально zero gap — построил equivalent на raw Anthropic SDK. За спринт мигрирую." |
| XGBoost / LightGBM | "Прогонял на Kaggle-уровне. В проде решал классификацию через LLM + embeddings. Знаю когда переключаться. За спринт — production-ready." |
| LoRA fine-tuning | "Делал в Colab. В проде у клиентов API всегда оказывался выгоднее. Знаю кейсы когда self-host окупается (>100M tokens/мес)." |
| AWS / GCP deep | "Consumer-level: S3, Lambda, Cloud Run, EC2. Не строил MLOps платформы. Cloud-native mindset есть из NestJS-прод." |
| ClickHouse | "Не использовал в проде. Понимаю columnar model. Паттерны OLAP знаю из Mongo aggregations." |

## Вопросы to ASK обязательно

К любому этапу:
1. "Какой главный bottleneck сейчас — цена токенов / latency / качество?"
2. "Какой первый проект если я выхожу, и что значит 'успех' через 60 дней?"

Финал с CTO:
3. "Где граница managed API vs self-host у вас в проде?"
4. "Что у вас лежит в LLM-кост структуре — где основной перерасход?"
5. "Какой ваш approach к eval — golden dataset, LLM-judge, human?"

## STAR-кейсы (90 сек каждый)

### My Zodiac AI (proof end-to-end solo)
- **S:** Хотел проверить — могу ли solo сделать SaaS от 0 до денег
- **T:** Астрология + AI + платежи, web + Android, контент-генерация на масштабе
- **A:** Nuxt + NestJS + Mongo + Redis + Qdrant + Capacitor; multi-provider routing, prompt caching, batch API; BullMQ для генерации
- **R:** 1500 платящих за 4 месяца, CAC окупается с 1-го месяца, 4.5★ на Play Store

### Soulwise bundle перформанс
- **S:** Nuxt app 250 KB bundle, медленный LCP на мобиле в эмерджащих рынках
- **T:** Срезать bundle, починить LCP, не сломать фичи
- **A:** Route-based code splitting + dynamic imports i18n + tree-shaking + server components на heavy чарты
- **R:** 250→160 KB (-36%), LCP -1.2s, conversion +8%

### AI Consulting (внутренние команды)
- **S:** 3 клиента, product teams без AI-опыта
- **T:** Чтобы их команда сама делала AI-фичи за 2-4 недели
- **A:** Dependency matrix, cost-modelling, integration playbook, code-review агент в CI
- **R:** У каждой первая AI-фича в проде за 2-4 недели; AI code-review снимал 30% нагрузки

## Anti-patterns (не делать)

- ❌ "Я могу всё"
- ❌ "Я хочу учиться" (это позиция для тех кто **уже** умеет)
- ❌ Извинения за гэпы
- ❌ Buzzwords без чисел
- ❌ Не задавать встречных вопросов
- ❌ Длинные истории без R (Result)

## 5 минут до звонка

1. Откыр resume v2 (enterprise) в фоне — на случай если попросят
2. github.com/vaiyav открыть в табе
3. Свежий стакан воды, поход в туалет
4. Сделать 5 глубоких вдохов
5. Текст self-pitch'а перед глазами (но НЕ читать с листа)

## После звонка (в течение 30 минут)

- [ ] Заполнить notes-template в папке этапа
- [ ] Сделать post-interview-review
- [ ] Отправить thank-you письмо
- [ ] Обновить TODO по гэпам если узнал новое про их стек

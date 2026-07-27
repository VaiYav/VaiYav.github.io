# 01 · LLM пайплайны (cost-efficient)

> Релевантность к Genesis: **🔴 КРИТИЧНО**. Их свежий запуск — "кост-ефективний LLM-пайплайн для аналізу мільйонів рекламних креативів". На bar-raising стопудово будет system design на эту тему.

## Что и зачем

**LLM-пайплайн** — это система, которая на вход получает данные (тексты, изображения, документы), прогоняет через одну или несколько LLM, и на выходе даёт структурированный результат (классификация, извлечение фактов, summary, оценка).

Главная инженерная задача — **не качество промпта**, а:
1. **Стоимость на единицу обработки** ($ на 1k items)
2. **Latency** (p50/p95/p99)
3. **Надёжность** (что делать когда провайдер 5xx)
4. **Качество** (как мерить и как не регрессировать)

Если стоимость не контролировать — пайплайн на миллионы креативов сожрёт бюджет за неделю.

## Как устроено (типовая архитектура)

```
[Source]            S3 / Postgres / API / Webhook
     │
     ▼
[Ingest queue]      BullMQ / SQS / Kafka — гарантированная доставка
     │
     ▼
[Dedupe + cache]    Redis: hash(input + prompt_version) → result
     │ (cache miss)
     ▼
[Pre-processing]    OCR / image resize / text chunking
     │
     ▼
[Router]            выбор провайдера/модели по полю задачи и SLA
     │
     ▼
[LLM call]          с retry, timeout, structured output
     │
     ▼
[Validation]        JSON schema / pydantic / Zod
     │ (fail)
     ▼
[Fallback]          retry с другим промптом / другой моделью
     │
     ▼
[Storage]           Postgres (структурка) + S3 (raw response для аудита)
     │
     ▼
[Observability]     Langfuse / LangSmith / custom — стоимость, latency, качество
```

## Состояние рынка в 2025-2026

### Провайдеры и цены (примерные, на середину 2025)

| Модель | Input $/1M | Output $/1M | Сильна в |
|---|---|---|---|
| GPT-4o | $2.50 | $10 | universal, vision |
| GPT-4o-mini | $0.15 | $0.60 | дешёвая классификация |
| Claude 3.5 Sonnet | $3 | $15 | reasoning, code, длинный контекст |
| Claude 3.5 Haiku | $0.80 | $4 | дешёвая, быстрая |
| Gemini 1.5 Pro | $1.25 | $5 | дешевле GPT-4o, 2M контекст |
| Gemini 1.5 Flash | $0.075 | $0.30 | супер-дешёвая для batch |
| Llama 3.1 70B (self) | ~$0.30-0.60 | ~$0.30-0.60 | self-host для приватности |
| Mistral Large | $2 | $6 | европейский compliance |
| DeepSeek V3 / R1 | $0.27 / $0.55 | $1.10 / $2.19 | reasoning по цене Haiku |

**Тренд 2025-2026:** цены падают ~3-5x в год для top-tier, ~10x для open-source. Cost-aware дизайн нужен, но "дешевле сделать дешёвую модель + retry, чем сразу дорогую".

### Что популярно сейчас (Mid-2025)

1. **Prompt caching** (Anthropic + OpenAI) — кэш длинного системного промпта/контекста, экономит до 90% на input.
2. **Batch API** (OpenAI Batch, Anthropic Message Batches) — 50% скидка, latency до 24h. Идеально для backfill / nightly jobs.
3. **Structured Outputs** (OpenAI JSON Schema, Anthropic tool use) — гарантия что ответ парсится.
4. **Provider routing** (OpenRouter, Portkey, custom) — единая абстракция, fallback на лету.
5. **LLM-as-judge** для eval — отдельная дешёвая модель оценивает ответ основной.
6. **Reasoning models** (o1, o3, DeepSeek R1) — для задач где нужен chain-of-thought встроенный.

### Что устарело / не делать в 2026

- Использовать GPT-3.5-turbo — дешевле и лучше mini-модели.
- Хранить промпты в коде (без версионирования) — теряете возможность откатить регрессию.
- Делать SQL `JSON.parse(response)` без schema validation — будет ломаться.
- Платить за один провайдер 100% объёма без fallback — single point of failure.
- Делать `for item in items: await llm.call(item)` — должна быть concurrency + rate limit (см. ниже).

## Best practices

### 1. Cascading: дешёвая → дорогая модель

```
Step 1: Haiku/Flash классифицирует "это вообще релевантно?"
  → если нет: сразу drop, $0.001 на запрос
  → если да: Step 2

Step 2: Sonnet/GPT-4o делает детальный анализ
  → если confidence высокий: store
  → если низкий: Step 3

Step 3: Human-in-the-loop / o1-mini reasoning
```

**Экономия:** на больших объёмах 80-95% запросов решаются на Step 1.

### 2. Prompt caching правильно

Anthropic: ставь `cache_control: { type: "ephemeral" }` на static части (system prompt, few-shot examples, документация). Кэш живёт 5 минут (можно 1 час за extra).

```ts
// псевдокод
const response = await anthropic.messages.create({
  model: "claude-3-5-sonnet",
  system: [
    { type: "text", text: STATIC_INSTRUCTION, cache_control: { type: "ephemeral" } },
    { type: "text", text: STATIC_FEWSHOT,     cache_control: { type: "ephemeral" } },
  ],
  messages: [{ role: "user", content: DYNAMIC_INPUT }],
});
```

Effect: первый запрос пишет в кэш (10% доп. стоимости), следующие 5 минут читают из кэша (10% стоимости). При высокой concurrency экономия 80-90% на input.

### 3. Batch API

OpenAI Batch: загружаешь JSONL → ждёшь до 24h → получаешь JSONL. 50% дешевле.
Anthropic Batches: то же самое, до 24h, 50% off.

Используй когда:
- Backfill / one-off аналитика
- Nightly job (не real-time)
- Embeddings больших корпусов

НЕ используй когда:
- Юзер ждёт ответ в UI
- Идёт production-флоу

### 4. Structured Outputs

OpenAI: `response_format: { type: "json_schema", json_schema: {...} }` — модель **гарантированно** вернёт валидный JSON по схеме.
Anthropic: tool use с input schema — тот же эффект.

**Преимущество:** убираешь весь fragile JSON-parsing код и retries на bad outputs.

### 5. Concurrency control

Каждый провайдер имеет rate limits (RPM, TPM, RPD). Нельзя просто `Promise.all([100 calls])` — улетишь в 429.

Паттерны:
- **p-limit / pLimit(N)** — Node.js
- **asyncio.Semaphore(N)** — Python
- **BullMQ concurrency** — для очередей
- **Bottleneck** — sliding window rate limiter

**Best practice:** держи concurrency на 50-70% от лимита провайдера. Оставь buffer на пиковые retries.

### 6. Retry strategy

Не все ошибки retry-able:
- **429 (rate limit)** → exponential backoff с Retry-After header
- **500/502/503** → retry с backoff
- **Timeout** → retry, но проверь не дубликат ли с idempotency key
- **400 (bad request)** → НЕ retry, это твоя ошибка
- **Schema validation fail** → retry с другим промптом ("предыдущий ответ не валиден, верни строго по schema")

### 7. Observability — must-have

Минимум:
- На каждый LLM-call: provider, model, input_tokens, output_tokens, latency, cost, success/fail, prompt_version_hash
- Дашборд: $ за день/месяц по проектам, % errors, p95 latency
- Алерт когда $ > budget или error rate > 5%

Стек:
- **Langfuse** (open-source, self-host) — лучший для prompt versioning + traces
- **LangSmith** (LangChain) — если уже на LangChain
- **Helicone** (proxy-based) — самый простой setup
- **Custom** — Sentry + Postgres + Grafana

## Подводные камни / о чём спросят

### Q: "Как бы вы оценили стоимость на 1M креативов?"

**Структура ответа:**
1. Параметры: средний размер input (image + промпт), средний output (JSON c полями).
2. Cascading: ~80% решаются на Haiku ($0.001/call), ~20% на Sonnet ($0.05/call).
3. Считаем: 1M × 0.8 × $0.001 + 1M × 0.2 × $0.05 = $800 + $10,000 = **$10,800**.
4. С prompt caching: -50% на input (system + few-shot фиксированы) = **~$7,000**.
5. С batch API: -50% на не-realtime → если 70% можно ночью, ещё -$2,500.
6. **Итог: $4,500-7,000 на миллион креативов в первой версии**.
7. Дальше: fine-tuned open-source модель на классификации Step 1 → может убрать ещё 40%.

### Q: "Что если OpenAI лежит 4 часа?"

- Multi-provider роутинг включает fallback на Claude/Gemini.
- Очередь продолжает копиться, не теряем данные.
- SLA на бизнес-цели: для realtime UI деградируем (cached result + "обновится позже"), для backfill — просто ждём.
- Алерт идёт в Slack, человек принимает решение "пробовать другого провайдера vs ждать".

### Q: "Как версионируете промпты?"

- В git как файлы (markdown / yaml).
- Каждая prod-версия имеет hash (commit SHA или semantic v1.2.3).
- Хеш идёт в каждый trace → можем сказать "регрессия началась после v1.2 → откатили".
- Промпт-диффы делаем как code review.

### Q: "Как мерите качество?"

3 уровня:
1. **Schema-pass rate** — % ответов которые валидны (бесплатно, обязательно).
2. **LLM-as-judge** — дешёвая модель сравнивает выход с эталоном (10-20% sample).
3. **Human eval** — раз в 2 недели, 100 случайных, золотой стандарт.

Plus: **golden dataset** — 50-200 пар (input, ожидаемый output) которые прогоняем на каждый prompt-change → ловим регрессии.

### Q: "А если контекст не помещается?"

- Chunking + RAG (см. cheat sheet 02).
- Map-reduce: проходим по чанкам с дешёвой моделью → сводим summaries в дорогой.
- Streaming с rolling-context window.
- Gemini 1.5 Pro / Claude Sonnet long context — до 1-2M токенов, если не жалко денег.

## Что сказать на собесе про мой опыт

> "В Soulwise AI я построил multi-provider роутинг — OpenAI как primary, Claude fallback, Gemini Flash для batch-job по генерации гороскопов на 100k+ юзеров. Сделал prompt caching на system + персонажный контекст → экономия порядка 60% на input. Все промпты в git, версионированы, evaluation идёт через LLM-as-judge + nightly golden-set прогон. Cost guard в Redis: budget per user/day, kill switch если идёт перерасход.
>
> Под вашу задачу с миллионами креативов я бы начал с cascading — Haiku/Flash на быструю классификацию релевантности, Sonnet/GPT-4o на детальный разбор для прошедших. Batch API на не-realtime часть. Cost ~$5-7k на 1M креативов в v1, дальше fine-tuning на классификации может ужать ещё в 2 раза."

## Дополнительное чтение

- Anthropic docs: prompt caching, batch API
- OpenAI cookbook: structured outputs, batch processing
- Eugene Yan's blog (eugeneyan.com) — practical patterns
- Hamel Husain — eval-driven dev
- Simon Willison — daily LLM news

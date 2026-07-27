# 10 · System Design AI-продуктов

> Релевантность к Genesis: **🔴 КРИТИЧНО**. Финал с CTO почти всегда — system design на доске. Это твоя точка проверки senior-уровня.

## Универсальный фреймворк ответа на system design

5 шагов, тратишь 30-45 минут:

1. **Clarify (5 мин)** — задай 5-10 вопросов, не бросайся сразу рисовать
2. **High-level (5 мин)** — нарисуй коробки, поток данных
3. **Deep-dive в 1-2 компонента (15 мин)** — обычно интервьюер укажет
4. **Trade-offs (10 мин)** — что выбираем и почему, что НЕ выбираем
5. **Wrap-up (5 мин)** — резюмируй, скажи что бы улучшил

### Clarify-вопросы (золото)

- **Scale**: сколько пользователей / документов / запросов?
- **Latency**: realtime (UI) или batch (nightly)?
- **Cost**: какой бюджет на единицу?
- **Quality**: какие SLA?
- **Multitenancy**: один tenant или много?
- **Compliance**: GDPR/HIPAA/SOC2?
- **Team**: одна команда поддерживает или несколько?
- **Existing**: что уже есть в инфре?

## Типичные задачи на собесах

### 1. "Спроектируйте chatbot/RAG-систему для документов"

**Components:**
```
[Ingestion]
  Documents (PDF/HTML/Word) → Unstructured.io → chunker → embedder → vector DB
  
[Query]
  User query → cache check → query rewriting → hybrid search → reranker
            → LLM с контекстом → response + citations → stream to user
            → log to Langfuse

[Storage]
  - Postgres: docs metadata, chats, users
  - Qdrant: vectors
  - Redis: query cache, conversation state
  - S3: raw documents

[Auth] OAuth → JWT → middleware
[Multi-tenancy] tenant_id в каждом payload, фильтр в vector search
```

**Trade-offs:**
- Embedding model: text-embedding-3-small (cheap) vs Voyage-3 (quality). Старт со small.
- Hybrid (BM25 + vector) или только vector. На юр.документах — обязательно hybrid.
- Streaming или await complete. UX лучше streaming.
- Conversation memory: full history (дорого) vs summarization (контекст теряется). Решение: rolling window + summary.

### 2. "Спроектируйте LLM-пайплайн для анализа миллионов креативов"

См. cheat sheet 01 — точный кейс Genesis.

**Дополнительно:**

```
[Source]              S3 inbound bucket / API webhook
   ↓
[Dedup]               hash(image) → skip seen creatives
   ↓
[Queue]               BullMQ / SQS — priority levels (urgent / batch)
   ↓
[Workers] (autoscale)
   ↓
[Cascading LLM]
   step 1: Haiku/Flash — is_relevant? — fast & cheap
   step 2: Sonnet/GPT-4o — детальный анализ (relevant subset only)
   step 3: o1-mini reasoning — для low-confidence outliers
   ↓
[Structured Output]   pydantic / Zod validation
   ↓
[Storage]
   Postgres: structured data (ad_id, advertiser, themes, sentiment, ...)
   S3: raw responses (audit trail)
   ClickHouse: aggregated analytics
   ↓
[UI]                  Vue/Nuxt dashboard, filters, export
[Notifications]       Webhook → Slack on anomalies
[Observability]       Langfuse + Datadog + custom cost dashboard
```

**Числа (1M в день):**
- Step 1 cost: 1M × $0.0005 = $500
- Step 2 cost: 200k × $0.05 = $10,000
- Step 3 cost: 5k × $0.10 = $500
- Total: ~$11k/day = ~$330k/month
- С prompt caching + batch API: ~$150k/month
- С fine-tuned 7B на step 1: ~$80k/month

### 3. "Спроектируйте predictive систему для CTR креативов"

**Components:**
```
[Training Pipeline]                    [Inference Pipeline]
                                            
Historical data         →   Feature       Live creative
(creative, ctr, ...)        engineering   (image+text+context)
       ↓                                       ↓
   Feature store                          Feature lookup
   (Tecton / Feast /                      (Redis cache)
   custom on Redis)                            ↓
       ↓                                  Model server (vLLM/Triton/FastAPI)
   Training (Airflow)                          ↓
       ↓                                  Predicted CTR
   Model registry (MLflow)                     ↓
       ↓                                  Decision logic 
   Champion/challenger                    (ranking, threshold)
   eval                                        ↓
       ↓                                  Serve / log
   Deploy → S3 / Replicate
                          ←     Monitoring (drift, perf)     →
```

**Trade-offs:**
- Model: LightGBM (baseline, быстро) → NN на embeddings (если quality bottleneck)
- Features: live computed vs precomputed in feature store
- Refresh: weekly retrain vs trigger-based on drift
- Cold start (новый креатив): explore через uniform → exploit после N impressions

### 4. "Спроектируйте agentic систему для автоматизации внутренних процессов"

**Example:** "Automate weekly competitor analysis report"

```
[Trigger]          cron (Mon 9am)
   ↓
[Orchestrator]     LangGraph state machine
   ↓
[Research Agent]   ───── Tools ─────
                   - search_web (Brave / Tavily)
                   - read_url (firecrawl)
                   - search_internal_db
   ↓
[Analyzer Agent]   ───── Tools ─────
                   - compute_metrics
                   - compare_to_baseline
                   - llm_summary
   ↓
[Writer Agent]     ───── Tools ─────
                   - generate_report (template)
                   - create_charts
   ↓
[Reviewer Agent]   (LLM-judge): factual? readable? branded?
                   loop back to Writer if fail
   ↓
[Distribute]       Slack post + email + Notion page
```

**Trade-offs:**
- Persistence: Postgres checkpointer (resume after crash)
- Cost guard: max $X per run
- Human-in-the-loop: pause for approval before sending to leadership
- Eval: weekly human review on 1-2 reports, compute success rate

## Универсальные компоненты в AI-системах

### 1. Очереди

- **BullMQ** (Redis) — Node, гибкие, retry, scheduled
- **Celery** (Redis/RabbitMQ) — Python, классика
- **SQS** — AWS managed
- **Temporal** — workflow engine с durability (longer-running)
- **Inngest / Trigger.dev** — modern alternatives

### 2. Vector DB
См. cheat sheet 02. Qdrant default.

### 3. Object storage
S3 / GCS / R2. R2 рекомендую за zero egress.

### 4. Кэш
Redis. Для AI:
- Query cache (hash → response)
- Embedding cache
- Session state
- Distributed lock

### 5. Observability stack для AI
- **Langfuse** — LLM-specific, open-source
- **Datadog / New Relic** — APM в целом
- **Sentry** — errors
- **Prometheus + Grafana** — custom metrics
- **OpenTelemetry / OpenLLMetry** — стандарт

### 6. Feature flags
- **GrowthBook** (open-source) — мой выбор
- **LaunchDarkly** — enterprise
- **Unleash** — open-source

Зачем для AI:
- Gradual rollout новых моделей
- A/B test prompt-changes
- Kill switch для broken pipelines
- Per-user toggles для beta features

### 7. Eval framework
- **LangSmith** / **Langfuse** — встроенные eval
- **RAGAS** — RAG-specific
- **OpenAI evals** — простой framework
- **DeepEval** — pytest-like для LLM
- **Promptfoo** — CLI-based testing

## Trade-offs которые упомянуть

### Build vs Buy
- API (OpenAI, Anthropic) — fast, expensive on scale
- Self-host (Flux, Llama) — slow start, dешевле > 200k volume
- Managed open-source (Together, Replicate) — компромисс

### Synchronous vs Async
- UI → sync streaming (хорошо ощущается)
- Heavy LLM → async + push notification
- Batch → fully async с status polling

### Sql vs NoSQL
- Метаданные / транзакции → Postgres
- Логи / event stream → ClickHouse / OpenSearch
- Vectors → Qdrant / pgvector
- Кэш / session → Redis

### Monolith vs Microservices
- Small team (< 5 eng) → modular monolith (NestJS modules)
- 10+ → microservices с чёткими bounded contexts

### Eager vs Lazy
- Embeddings: eager на ingest (один раз), lazy на query (с кэшем)
- Image gen: lazy on demand с queue
- Predictions: hybrid (precompute for active users)

## Что они оценивают

Хорошие сигналы:
- ✅ Уточняющие вопросы перед рисованием
- ✅ Сначала простой ответ, потом deep-dive
- ✅ Trade-offs обсуждаются явно
- ✅ Числа: cost, latency, throughput
- ✅ Знание граничных случаев
- ✅ "Я бы начал с X, потом по мере роста перешёл к Y"
- ✅ Понимание team / org factors

Красные флаги:
- ❌ Сразу "kubernetes + microservices + kafka" для MVP
- ❌ Игнор cost
- ❌ Нет упоминания observability/monitoring
- ❌ Нет понимания failure modes (что если LLM лёг? кто chargeback?)
- ❌ Buzzwords без сути (CQRS, event sourcing на каждом углу)

## Чек-лист "не забыть упомянуть"

На любом design обязательно:
- [ ] **Authentication / Authorization** (даже одной фразой)
- [ ] **Rate limiting / Cost guard**
- [ ] **Caching** уровни
- [ ] **Retries / Idempotency**
- [ ] **Observability** (logs/metrics/traces)
- [ ] **Failure modes** (что если X лёг)
- [ ] **Data privacy** (GDPR/PII)
- [ ] **Versioning** (модель, промпт, schema)
- [ ] **Eval / Quality** strategy
- [ ] **Deploy / Rollback**

## Мой опыт — кейсы для финала

### Кейс A: "Расскажите про самую сложную AI-систему которую построили"

**Soulwise AI personalization:**
- Multi-tenant: 100k+ users, каждый со своим natal chart
- RAG: Qdrant индекс на астрологических текстах + per-user данные
- Multi-provider LLM: OpenAI primary, Claude fallback, Gemini для длинного контекста
- Generation pipeline: ежедневные гороскопы для всех юзеров через batch API
- Cost guard: budget per tier (free/paid)
- Monitoring: Langfuse + Sentry + custom Grafana

**Числа:** 100k+ users, ~$3k/month на LLM, p95 query latency 2 sec.

### Кейс B: "speckit-product-forge архитектура"

- Плагины: 8 шт. в нативной структуре Claude Code
- Skills: 127, каждая markdown + Python scripts
- Sub-agents: 19, каждый с своим system prompt + toolkit
- State: файловая система в .specify/ (можно git versioned)
- Eval: golden tasks по каждой skill
- Distribution: open-source GitHub

**Trade-offs:**
- File-based state vs DB → выбрал файлы для git-friendly
- Один большой skill vs много маленьких → много маленьких для composability
- Опенсорс vs SaaS → опенсорс ради adoption и community

## Дополнительные ресурсы

- **High Scalability** (highscalability.com) — классические system design кейсы
- **Eugene Yan** (eugeneyan.com) — ML system design
- **Chip Huyen** (huyenchip.com) — "Designing Machine Learning Systems" книга, **must read**
- **The Pragmatic Engineer** newsletter — современные практики
- **Hamel Husain** (hamel.dev) — eval-driven dev
- **Latent Space** podcast

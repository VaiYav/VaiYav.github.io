# 02 · RAG архитектура

> Релевантность к Genesis: **🟠 ВАЖНО**. У меня есть прод-опыт (Qdrant в Soulwise), это сильная зона. На bar-raising могут попросить нарисовать.

## Что и зачем

**RAG (Retrieval-Augmented Generation)** — паттерн где перед запросом к LLM мы достаём релевантный контекст из внешнего источника (документы, БД) и подмешиваем в промпт.

**Зачем нужно:**
1. **Свежие данные** — LLM не знает что было вчера. RAG достаёт актуальное.
2. **Приватные данные** — LLM не знает твоей компании. RAG даёт доступ.
3. **Меньше галлюцинаций** — модель отвечает по конкретному контексту.
4. **Дешевле fine-tuning** — добавил документ в индекс, не переобучая.

**Когда RAG НЕ нужен:**
- Задача чисто на reasoning без фактов (математика, код).
- База маленькая (< 10k токенов) → проще всё засунуть в long-context.
- Нужна точность 100% → RAG имеет recall < 100%, fine-tune может быть лучше.

## Как устроено

```
[Indexing (offline)]
Documents → Chunker → Embedder → Vector DB + metadata
                                      ↑
                                      └── (optional) BM25 / keyword index

[Query (online)]
User query → Embedder → Vector DB search → Top-K chunks
                            +
                       BM25 search → Top-K chunks
                            ↓
                       Hybrid merge (RRF / score fusion)
                            ↓
                       Re-ranker (cross-encoder) → Top-N
                            ↓
                       LLM with system prompt + Top-N chunks → Answer
                            ↓
                       (optional) Citations / source attribution
```

## Состояние рынка в 2025-2026

### Vector DB

| База | Сильна в | Цена | Когда брать |
|---|---|---|---|
| **Qdrant** | Self-host, open-source, простая, payload filtering | Free self-host / managed от $25 | Дефолт для production, мой выбор |
| **Pinecone** | Managed, серверлесс, простой API | Платный, ~$70+/мес | Когда не хочешь возиться с инфрой |
| **Weaviate** | GraphQL, multimodal, гибридный встроенный | Free OSS / managed | Если нужны сразу гибрид + multimodal |
| **Milvus / Zilliz** | Самая большая в мире, до миллиардов векторов | Free OSS / managed | Огромные масштабы |
| **pgvector** | Постгрес-extension | бесплатно | Если уже Postgres, объёмы < 10M |
| **Chroma** | Простая для прототипов | Free | Только для PoC, не для прода |
| **Turso + libSQL vector** | SQLite + vector | Cheap | Edge / маленькие приложения |

**Тренд:** pgvector активно догоняет специализированные базы для < 10M векторов. Для миллиардов — Qdrant / Milvus.

### Embedding модели

| Модель | Размерность | $/1M | Качество |
|---|---|---|---|
| OpenAI text-embedding-3-large | 3072 (можно ужать) | $0.13 | Очень высокое |
| OpenAI text-embedding-3-small | 1536 | $0.02 | Хорошее, дёшево |
| Cohere embed-v3 | 1024 | $0.10 | Сильна в multilingual |
| Voyage AI voyage-3 | 1024 | $0.12 | SOTA на бенчах в 2025 |
| **Open-source: BGE-large-en-v1.5** | 1024 | self-host | Очень сильна для open |
| **Open-source: nomic-embed-text** | 768 | self-host | 8k контекст, дёшево |
| **Jina embeddings v3** | 1024 | $0.02 | Multilingual, дёшево |

**Best practice 2025:** не дефолтить OpenAI — Voyage и Cohere часто лучше на доменных задачах. Для бюджета — Jina или self-host BGE.

### Re-rankers

После vector search достаём top-50, потом cross-encoder реранкер сужает до top-5.

- **Cohere rerank-v3** — managed, $1/1k запросов, лучший по бенчам
- **Jina reranker v2** — managed, дешевле
- **BGE-reranker-large** — open-source, self-host
- **mxbai-rerank** — новая open-source SOTA

**Эффект:** реранкер обычно даёт +10-20% на recall@5, окупает себя на любой серьёзной задаче.

## Best practices

### 1. Chunking

**Ошибка новичков:** разбить по 500 токенов фиксированно.

**Правильно:**
- **Semantic chunking** — разбиваем по структурным границам (заголовки, абзацы).
- **Sliding window с overlap** 10-20% — чтобы предложение на границе не терялось.
- **Размер chunk:** 200-800 токенов в зависимости от типа документа.
- **Hierarchical chunking** для длинных документов: parent chunk (большой) + child chunks (маленькие). Ищем по детям, в промпт даём родителя.

**Tooling:**
- LangChain: `RecursiveCharacterTextSplitter`, `MarkdownHeaderTextSplitter`
- LlamaIndex: `SemanticSplitterNodeParser`
- Unstructured.io для PDF / HTML / docs

### 2. Hybrid search (BM25 + Vector)

Только vector search ловит **семантику**, но проваливается на:
- Аббревиатурах, кодовых названиях
- Числах, артикулах
- Редких именах

**BM25 (классика, lexical)** наоборот сильна на exact match.

**Гибрид:** ищем обоими, объединяем через **Reciprocal Rank Fusion (RRF)**:
```
score(doc) = Σ over methods of 1/(k + rank_method(doc))
```
k обычно = 60. Бесплатный +15-30% к recall.

Тулзы: Qdrant 1.10+ нативно поддерживает hybrid, Weaviate тоже, Elasticsearch давно.

### 3. Metadata filtering

В Qdrant/Pinecone каждый чанк имеет payload (JSON-метаданные). Фильтруем по:
- `tenant_id` (multi-tenancy)
- `language`, `country`
- `created_at` (по времени)
- `doc_type`
- `category`

**Важно:** фильтр применяется ДО vector search → не теряем top-K из-за нерелевантных доменов.

### 4. Re-ranking

```
Vector search: top-50 за 10ms
Cross-encoder rerank: top-5 за 50ms (50 пар × 1ms на пару)
Total: 60ms, качество выше в 1.5-2 раза
```

Используй всегда, если бюджет позволяет $1 на 1000 запросов.

### 5. Citations / Source attribution

В промпте говорим:
```
Use the following context. Cite source by [doc_id:chunk_id] after each claim.
```

Это даёт пользователю trust + дебаггинг.

### 6. Query rewriting / HyDE

**HyDE (Hypothetical Document Embeddings):** генерируем "ответ на запрос" дешёвой моделью, эмбеддим **ответ**, ищем по нему. Часто работает лучше т.к. embedding-пространство для запросов и ответов разные.

**Query rewriting:** "Сколько стоит X?" → "стоимость цена X price cost доллар USD" — LLM расширяет вариантами.

### 7. Evaluation

**RAGAS** — open-source библиотека метрик RAG:
- **Faithfulness** — ответ опирается на контекст
- **Answer relevancy** — ответ отвечает на вопрос
- **Context precision** — релевантные чанки наверху
- **Context recall** — все нужные чанки достались

**Golden dataset:** 50-200 пар (вопрос → правильный ответ + правильные источники).

## Подводные камни

### 1. "Chunk слишком маленький"
Если 200 токенов — теряется контекст между ними. Решение: hierarchical chunking или больший overlap.

### 2. "Слишком много шума в контексте"
LLM путается. Решение: re-ranker + жёсткое top-3 вместо top-20.

### 3. "Embedder не понимает домен"
Дефолтный OpenAI плох на юридических / медицинских текстах. Решение: fine-tune embedder или взять доменно-обученную (BioBERT, LegalBERT).

### 4. "Multi-hop questions"
"Кто был CEO компании которую купил Microsoft в 2024?" — нужно 2 шага поиска. Решение: agentic RAG (LLM сам решает делать ли ещё поиск).

### 5. "Stale data"
Документ обновился — индекс нет. Решение: на каждое изменение в источнике пускаем reindex через очередь.

### 6. "Vector drift"
Поменяли embedder → весь индекс несовместим. Решение: храним version embedder в payload, при rolling переиндексируем фоном.

## О чём спросят на собесе

### Q: "Когда vs не RAG?"
- RAG: свежие/приватные данные, нужны источники.
- Long-context: маленькая база (< 100k токенов).
- Fine-tune: задача узкая, нужен низкий latency, не меняется домен.

### Q: "Какие провалы RAG в проде?"
- Многоэтапные вопросы → agentic RAG.
- Numerical answers ("сколько") → BM25 нужен сильно.
- Свежесть → нужен freshness boost (мокроразмер boost on recency).

### Q: "Как меряете качество RAG?"
RAGAS + golden dataset + human eval раз в 2 недели.

### Q: "Стоимость RAG?"
- Indexing: $0.02 / 1k chunks × 1M docs × 5 chunks = $100 one-time
- Query: embed query ($0.00002) + vector search (almost free) + rerank ($0.001) + LLM ($0.005) = ~$0.007 / query
- На 100k queries/day: $700/day = $21k/мес. Можно ужать до $5-10k оптимизациями.

## Мой опыт (что сказать)

> "В Soulwise AI я построил RAG на Qdrant для персонализации гороскопов: индекс на астрологических текстах + натальных данных юзера. Semantic chunking, OpenAI text-embedding-3-small для embeddings, hybrid search через payload фильтрацию по знаку зодиака. Reranker не ставил — на этой задаче top-K было достаточно. Cost guard: один query ≈ $0.003 включая LLM. У вас на креативах я бы пошёл с похожей архитектурой, но добавил cross-encoder реранкер — там precision важнее recall."

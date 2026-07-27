# 08 · Кластеризация и NLP

> Релевантность к Genesis: **🟠 ВАЖНО**. Прямо в обязанностях: "кластеризація, NLP-аналіз". У них наверняка кластеризация креативов по темам, NLP отзывов, sentiment, topic discovery.

## Что и зачем

**NLP** — задачи на текст: классификация, извлечение сущностей, sentiment, summarization, поиск, переводы, генерация.

**Кластеризация** — unsupervised: без labels группируем данные в кластеры. На текстах обычно через embeddings.

В 2025-2026 границы размылись: 70% классических NLP-задач делается через **LLM прямо** (zero/few-shot), а кластеризация делается на **embeddings** (text-embedding-3, BGE, Voyage).

## Когда классика NLP vs LLM

| Задача | Классика | LLM | Рекомендация |
|---|---|---|---|
| Classification (3-10 категорий) | sklearn + TF-IDF / BERT | Few-shot prompt | **LLM** на старте, sklearn на масштабе |
| Named Entity Recognition (NER) | spaCy / HuggingFace | Structured output | **LLM** для гибкости, spaCy для скорости |
| Sentiment | классификаторы | Prompt | **LLM**, разница в качестве заметная |
| Topic modeling | LDA / BERTopic | Embeddings + clustering | **BERTopic** в 2025 — стандарт |
| Summarization | TextRank, BART | Prompt | **LLM** доминирует |
| Translation | seq2seq | GPT/Claude/Gemini | **LLM** для нишевых; DeepL для прода |
| Embeddings / Semantic search | word2vec, BERT | text-embedding-3 / BGE | **Embedding-modules** |
| Text generation | GPT-2/3, T5 | GPT-4/Claude/Gemini | **LLM** очевидно |

## Embeddings — основа всего

### Что это

Embedding — вектор `R^d`, где `d ∈ [128, 4096]`. Семантически близкие тексты имеют близкие векторы (cosine similarity).

### Модели

См. cheat sheet 02 (RAG). Топ:
- **text-embedding-3-small/large** (OpenAI)
- **voyage-3** (Voyage AI) — SOTA 2025
- **cohere embed v3** — multilingual
- **BGE-large-en-v1.5** — open-source SOTA
- **nomic-embed-text** — 8k context
- **Jina embeddings v3** — multilingual, дёшево

### Когда что выбирать

- **Multilingual** (включая UA, RU) — Cohere v3 / Jina v3 / BGE-M3
- **Самые точные** — Voyage-3 или text-embedding-3-large
- **Дешёвые** — Jina-v3 ($0.02) или self-host
- **Domain-specific** (medical, legal) — fine-tune base embedding на доменных парах

## Кластеризация на embeddings

### Алгоритмы

| Алгоритм | Сильна в | Когда брать |
|---|---|---|
| **K-Means** | Простой, быстрый | Когда знаешь K (число кластеров) |
| **DBSCAN** | Кластеры произвольной формы, шум | Неравномерная плотность |
| **HDBSCAN** | hierarchical density-based, лучше DBSCAN | Дефолт в 2025 для embeddings |
| **GMM** | Вероятностные кластеры | Soft clustering |
| **Spectral** | Графовые структуры | Маленькие dataset'ы |
| **Hierarchical** | Дерево кластеров | Нужна иерархия |

**HDBSCAN** в 2025 — практически дефолт. Особенно на embeddings.

### Pipeline кластеризации embeddings

```python
import umap, hdbscan
from sentence_transformers import SentenceTransformer

# 1. Embed
model = SentenceTransformer("BAAI/bge-large-en-v1.5")
embeddings = model.encode(texts, normalize_embeddings=True)

# 2. Reduce dimensionality (HDBSCAN плохо работает > 50 dim)
reducer = umap.UMAP(n_components=10, metric="cosine", min_dist=0.0)
reduced = reducer.fit_transform(embeddings)

# 3. Cluster
clusterer = hdbscan.HDBSCAN(min_cluster_size=10, metric="euclidean")
clusters = clusterer.fit_predict(reduced)
```

Шаги:
1. **Embed** — высокая размерность для качества
2. **UMAP** — снижаем до 5-50 dim, сохраняем кластерную структуру
3. **HDBSCAN** — кластеризуем

### Topic Modeling в 2025

**BERTopic** — стандарт. Использует embedding + UMAP + HDBSCAN + c-TF-IDF для labels.

```python
from bertopic import BERTopic
topic_model = BERTopic(embedding_model="all-MiniLM-L6-v2")
topics, probs = topic_model.fit_transform(texts)
topic_model.get_topic_info()
```

Bonus: можно дать LLM описать topic по top-words → автогенерация human-readable labels.

### Старые методы (для контекста)

- **LDA** — Latent Dirichlet Allocation. Bag-of-words, нет семантики, **не используем больше**.
- **NMF** — Non-negative Matrix Factorization. Иногда ок для интерпретируемости.
- **TF-IDF + KMeans** — baseline, всё ещё работает для коротких документов.

## Классификация: классика и LLM

### Когда LLM (zero/few-shot)

```python
prompt = """
Classify the following ad creative into one of: 
[lifestyle, finance, gaming, health, education, ecommerce]

Creative: "{text}"
Label:"""
```

Pros: 0 labeled data, гибкость по классам, описание в промпте.
Cons: дорого на масштабе, latency.

**Cost guard**: если volume > 10k/day — переключаемся на классический классификатор.

### Когда классика

**Training set:**
1. LLM размечает 10k примеров (или ручная разметка)
2. Тренируем sklearn / fine-tune BERT
3. Inference 100-1000x дешевле LLM

```python
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

pipe = Pipeline([
    ("tfidf", TfidfVectorizer(ngram_range=(1, 2), max_features=10000)),
    ("clf", LogisticRegression(max_iter=1000)),
])
pipe.fit(X_train, y_train)
preds = pipe.predict(X_test)
```

Или поверх embeddings (часто лучше):
```python
from sklearn.linear_model import LogisticRegression
X_emb = model.encode(X_train)
clf = LogisticRegression(max_iter=1000)
clf.fit(X_emb, y_train)
```

Embeddings + Logistic Regression — крепкий baseline в 2025.

### Distillation паттерн

1. LLM делает predictions на 100k unlabeled (cost = $100)
2. Тренируем DistilBERT на этих pseudo-labels
3. Inference в 100x дешевле, точность 90-95% от LLM

## NER (Named Entity Recognition)

- **spaCy** — быстро, простые сущности (PERSON, ORG, LOC). Не требует обучения.
- **Hugging Face NER** — bert-base-NER, dslim, более качественно.
- **GLiNER** — zero-shot NER, описываешь типы текстом.
- **LLM Structured Output** — для гибкости (custom entities). Anthropic tool use идеально.

## Sentiment

- **VADER** — классика для социальных сетей (учитывает emoji, slang)
- **HuggingFace pipelines** — distilbert-sentiment, прод-readi
- **LLM** — для нюансированных эмоций (sarcasm, mixed)

## Подводные камни

### 1. Multilingual проблемы
Не каждый embedding знает украинский/русский. Тестируй на своих данных. Для UA — Cohere v3, Jina v3 уверенно.

### 2. Cluster collapse
Все точки в один кластер. Решение: меньше min_cluster_size, проверь UMAP параметры, нормализуй embeddings.

### 3. Слишком мелкая зернистость
"500 кластеров на 1000 точек". Решение: больше min_cluster_size, меньше n_components в UMAP.

### 4. Cosine vs Euclidean
Embeddings почти всегда `normalize_embeddings=True` → euclidean ≈ cosine. Но в высокой размерности cosine стабильнее.

### 5. Imbalanced classes
60% positive, 40% negative — ok. 99% / 1% — accuracy лжёт. Используй F1/PR-AUC. Class weights.

### 6. Topic drift
Со временем тематика меняется. Решение: периодическая переразметка, monitoring distribution shift.

## О чём спросят на собесе

### Q: "Как бы сгруппировали 1M креативов по темам?"
1. Embed все через text-embedding-3-small (или CLIP если важна картинка тоже) — $200
2. UMAP → 10 dim
3. HDBSCAN с min_cluster_size=100
4. Для каждого кластера: top creatives по centrality → LLM генерит описание ("Sport supplements with motivational text")
5. Сохраняем в Postgres: creative_id → cluster_id + cluster_desc
6. UI: фильтр и поиск по cluster_desc

Cost ~$200 (embeddings) + ~$10 (LLM для labels) + время.

### Q: "Sentiment 1M отзывов в реальном времени?"
1. Если real-time: HuggingFace distilbert pipeline на GPU → 500/sec → 50 min на 1M. ~$5 GPU/час.
2. Batch: OpenAI batch API → $300 за 1M.
3. На горячую: LLM streaming. Дорого.

### Q: "Как мерите качество кластеризации?"
- **Внутренние метрики** (без labels): silhouette score, Davies-Bouldin, Calinski-Harabasz
- **Внешние** (с labels): ARI (Adjusted Rand Index), NMI
- **Качественные** — глянь top-N кластеров глазами, спроси LLM "опиши тему"

### Q: "Когда LLM vs sklearn classification?"
- LLM: до 10k items/day, новые категории часто, нет labeled data
- Sklearn: > 10k/day, стабильные категории, есть labels

### Q: "Embeddings vs TF-IDF?"
- TF-IDF: быстрый, понятный, не понимает синонимы ("car" vs "automobile" — разные)
- Embeddings: семантика, multilingual, multimodal, требуют compute/cost

## Мой опыт + что сказать

> "Кластеризация в проде делал embedding-based: text-embedding-3-small → UMAP → HDBSCAN. В Soulwise сегментирую юзерский контент по темам. NLP в основном через LLM — sentiment, классификация, summarization идут с OpenAI/Claude через structured output. Где volume растёт — distillation в DistilBERT или logistic regression поверх embeddings.
>
> Под Genesis: я бы сделал кластеризацию креативов на CLIP-embeddings (картинка + текст вместе) + HDBSCAN. Topic labels через BERTopic с LLM-описанием. Прогнозируемая стоимость: 1M креативов — ~$200 на embeddings + ~$20 на label generation. Performance — за ночь готово."

## Stack которую советую начать

- **sentence-transformers** / **OpenAI embeddings API** — embeddings
- **UMAP-learn** — dimensionality reduction
- **HDBSCAN** — clustering
- **BERTopic** — topic modeling
- **spaCy** — fast NER
- **GLiNER** — zero-shot NER
- **scikit-learn** — классические классификаторы
- **VADER** или **distilbert-sentiment** — sentiment baseline
- **Hugging Face datasets / transformers** — общий toolkit

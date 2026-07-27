# 07 · Скрейпинг пайплайны

> Релевантность к Genesis: **🟠 ВАЖНО**. Прямо в обязанностях: "налаштовувати пайплайни збору й обробки даних: гнучкий скрейпінг, інтеграції з API". У них наверняка скрейпят Facebook Ad Library, AppStore listings, конкурентов.

## Что и зачем

**Web scraping** — автоматизированный сбор данных с сайтов. Для AI-задач это foundation: без данных нет ML.

Типичные источники в контексте Genesis-продуктов:
- **Facebook/TikTok/Google Ads libraries** — креативы конкурентов
- **App Store / Play Store** — listings, отзывы, рейтинги
- **Reddit / Twitter / Discord** — sentiment, user research
- **GitHub** — code, issues, trending repos (их ClickHouse-пайплайн!)
- **News / Blogs** — content discovery

## Архитектура production-скрейпера

```
[Scheduler]            cron / Airflow / Temporal — что когда скрейпить
     ↓
[Queue]                URLs to fetch: Redis / SQS
     ↓
[Worker pool]          конкурентность с rate limit per domain
     ↓
[Fetcher]              httpx / playwright / curl_cffi
     ↓
[Anti-bot bypass]      proxy rotation + headers + TLS fingerprint
     ↓
[Parser]               selectolax / BeautifulSoup / lxml / cheerio
     ↓
[Validator]            pydantic / zod — структурируем
     ↓
[Dedupe]               hash content → skip seen
     ↓
[Storage]              S3 (raw HTML) + Postgres (structured)
     ↓
[Downstream]           ML / LLM / Analytics
```

## Состояние рынка в 2025-2026

### Стек для Python

| Инструмент | Когда |
|---|---|
| **httpx** | async HTTP client, дефолт |
| **curl_cffi** | TLS-fingerprint impersonation (обходит Cloudflare) |
| **Playwright** | JS rendering, headless browser |
| **Crawl4AI** | AI-aware scraping, output в Markdown для LLM |
| **Scrapy** | классика, для огромных проектов с pipelines |
| **selectolax** | HTML parsing, в разы быстрее BS4 |
| **trafilatura** | extract main content / text из HTML |

### Стек для Node.js / TS

| Инструмент | Когда |
|---|---|
| **fetch / undici** | базовое async HTTP |
| **got-scraping** | better defaults для скрейпинга |
| **Playwright** | JS-heavy сайты |
| **Crawlee** (от Apify) | full framework Node/TS, лучший в 2025 |
| **cheerio** | jQuery-like parsing |
| **JSDOM** | full DOM emulation |

**Мой выбор** для TS: **Crawlee** — отличный framework с queue, retry, proxy rotation, dataset storage встроенными.

### LLM-first парсинг

Новый паттерн 2024-2025: вместо CSS-селекторов даём LLM HTML → структурированный JSON.

- **Firecrawl** — managed, HTML → markdown + extract по schema
- **Crawl4AI** — open-source, AI-aware
- **Browse AI / Browse** — no-code варианты
- **Apify Actors with AI** — managed scraper'ы

Pros: устойчиво к изменениям сайтов. Cons: дороже, медленнее.

**Hybrid pattern:** CSS-селекторы primary (быстро, дёшево), LLM-fallback если HTML изменился.

### Anti-bot bypass

Уровни защиты:
1. **Rate limit per IP** → solve: residential proxies
2. **User-Agent / headers** → solve: realistic headers
3. **TLS fingerprint** → solve: curl_cffi или Playwright
4. **JS challenges (Cloudflare)** → solve: Playwright stealth + cf-clearance cookies
5. **CAPTCHA** → solve: 2captcha / Anti-Captcha API
6. **Behavioral detection** → solve: human-like delays + mouse moves

**Прокси-сервисы:**
- **Bright Data** (Luminati) — дорого, лучшее качество
- **Smartproxy / Oxylabs** — средняя цена
- **IPRoyal / Webshare** — бюджет
- **Apify Proxy** — для Apify Actors

**Цены 2025:** $5-15 per GB residential, $0.5-1 per GB datacenter.

## Best practices

### 1. Respectful scraping

- **robots.txt** — читай, не игнорируй слепо
- **Rate limit** — 1-2 req/sec на домен, медленнее для маленьких сайтов
- **Identify yourself** — User-Agent с контактом, чтобы можно было связаться
- **Avoid hours of peak load** — ночью
- **API первый** — если есть официальный, используй его

### 2. Идемпотентность

Скрейп можно перезапустить — дедупликация:
- Hash URL+timestamp → не парсим повторно
- Content hash → не пишем дубль в БД

### 3. Структурируй с pydantic / zod

```python
from pydantic import BaseModel

class Creative(BaseModel):
    ad_id: str
    advertiser: str
    image_url: HttpUrl
    body_text: str
    cta: str
    languages: list[str]
    created_at: datetime
```

LLM или парсер возвращает раw → валидируем → пишем в БД.

### 4. Раздельный storage

- **Raw HTML / images** → S3 (cheap, можно перепарсить если schema поменялась)
- **Structured data** → Postgres
- **Embeddings** → vector DB
- **Logs scrape attempts** → отдельная table (success rate per source)

### 5. Monitoring

Что считать:
- Success rate per source
- Bandwidth used (для биллинга прокси)
- New items per day (sudden drop = что-то сломалось)
- Errors by type (429 = rate limit, 403 = banned, parse_error = HTML изменился)

Алерты:
- Success rate < 80% на источнике
- 0 new items за день
- Спайк parse_errors

### 6. JS rendering — только когда надо

Headless browser дорого:
- 10x больше CPU
- 5x больше памяти
- Медленнее

Эвристика: **сначала httpx**. Если в response пусто/нет нужных полей → переключаемся на Playwright.

### 7. Sitemap > crawling

Если есть sitemap.xml — это явный список URL'ов от владельца. Парси его вместо bfs-краулинга.

### 8. Concurrency design

Per-source rate limiter (не global):
```python
limiter = AsyncLimiter(max_rate=1, time_period=1)  # 1 req/sec
async with limiter:
    response = await client.get(url)
```

Crawlee делает это нативно через `RequestQueue` и `maxRequestsPerMinute`.

### 9. Cookies / sessions

Залогиненные источники — поддерживай session:
- Сохраняй cookies в Redis по proxy_id
- Re-login если 401
- Keep cookies fresh с heartbeat requests

### 10. Legal awareness

- **Public data** — обычно ok scraping
- **Login-required** — обычно нарушение ToS
- **PII** — GDPR / CCPA риски
- **Copyright** — нельзя массово рекскать защищённое
- **hiQ vs LinkedIn** (US, 2019/2022) — public scraping частично легализовано, но не панацея

В Genesis-контексте Facebook Ad Library — публичные данные, ok. Конкурентов directly из их web app — спорно.

## Подводные камни

### 1. "Сайт начал блокировать"
Не делай больше запросов с того же IP. Включи proxy rotation, замедли rate.

### 2. "HTML изменился"
Тесты для парсера на golden HTML samples + monitor parse_error rate.

### 3. "Дубли в БД"
URL может иметь варианты (с/без trailing slash, www, query params). Нормализуй URL перед dedupe.

### 4. "Слишком медленно"
Async + larger concurrency на разных доменах. Не путать с rate limit per domain.

### 5. "Costs exploded"
Прокси и compute. Spot instances + scheduled (а не 24/7) + кэширование.

### 6. "PDF / images / videos"
Бинарный контент: храни в S3, ссылки в БД, метаданные через ML (OCR / image classification).

## О чём спросят на собесе

### Q: "Как бы скрейпили Facebook Ad Library?"
1. **Sitemap первый** — нет, FB Ad Library нет sitemap, но есть search API
2. Используем FB Graph API (oauth, бесплатно с rate limit)
3. Если нужны массовые креативы — Playwright + auth + careful pagination
4. Прокси (residential) для bypass rate limits
5. Бэкенд: queue + workers + S3 для creatives + Postgres для metadata
6. LLM-обработка асинхронно

### Q: "Что такое robots.txt и обязательно ли его соблюдать?"
Файл с правилами для крaулеров. Юридически — не закон, но игнорировать = invite of trouble (DMCA, IP ban). Best practice — соблюдать.

### Q: "Как обходить Cloudflare?"
1. Playwright + stealth plugin
2. curl_cffi с TLS fingerprint браузера
3. Residential proxies
4. Cf-clearance cookies через challenge solver
5. Best — найти источник данных без CF (API, mobile app endpoints)

### Q: "Когда LLM-парсинг лучше CSS?"
- Сайт часто меняет DOM
- Структура разнообразная (10 разных layout'ов)
- Нужно извлекать смысл (sentiment, topic) сразу
- НО — медленнее и дороже на масштабе

### Q: "Anti-pattern в scraping?"
- 1000 потоков на 1 IP → instant ban
- Игнор robots.txt + 0 rate limit
- Хранить raw HTML в БД (вместо S3) → раздуть БД
- Парсер без тестов → silent breakage

## Мой опыт + что сказать

> "Скрейпинг делал на проектах поменьше — Playwright + cheerio для своих pet-проектов, Crawlee для нескольких клиентских инструментов. Не строил пайплайны на миллионы запросов в день, но архитектуру понимаю: очередь + worker pool + proxy rotation + structured storage.
>
> Для Genesis: я бы начал с Crawlee (TS-стек у меня сильный) или Scrapy если команда на Python. Очередь BullMQ, прокси через Smartproxy (или Bright Data если бюджет). Anti-bot первого уровня (TLS fingerprint, headers, rate limit) — почти всегда достаточно. Cloudflare — Playwright stealth + cf-clearance.
>
> Под публичные источники (Facebook Ad Library, App Store, Reddit) — есть либо официальные API, либо хорошо изученные пути обхода. У меня в speckit-product-forge есть skill для market-researcher агента которая делает это за меня — могу адаптировать под ваш домен."

## Tooling stack который имеет смысл рекомендовать

- **Crawlee** (TS) или **Scrapy** (Python) — framework
- **Playwright** для JS-heavy
- **curl_cffi** для anti-bot
- **Smartproxy/Bright Data** для прокси
- **Firecrawl** для LLM-first парсинга если нужно быстро MVP
- **Postgres + S3** для storage
- **BullMQ / SQS** для очередей
- **Sentry + Datadog/Grafana** для мониторинга

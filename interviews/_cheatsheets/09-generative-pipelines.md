# 09 · Генеративные пайплайны: текст, изображения, видео

> Релевантность к Genesis: **🟠 ВАЖНО**. Их прямая обязанность №3: "розробляти генеративні пайплайни: кост-ефективні рішення для масової генерації контенту (тексти, зображення, відео) під бізнес-задачі".

## Что и зачем

**Генеративный пайплайн** — система массовой генерации контента под бизнес-задачу: маркетинговые тексты, креативы для рекламы, превью видео, локализованный контент.

Не путать с "просто чат-бот". Здесь акцент на:
1. **Объём** — сотни тысяч артефактов
2. **Стоимость** — $ per unit
3. **Качество и consistency** — фильтрация плохих результатов
4. **Брендинг** — стиль/тон должен совпадать

## Архитектура генеративного пайплайна

```
[Brief / Input]                бизнес-вход (тема, аудитория, формат)
       ↓
[Template + variables]         spec для генерации (промпт + переменные)
       ↓
[Generator]                    LLM / image model / video model
       ↓
[Quality filter]               LLM-as-judge / image quality / brand consistency
       ↓ (pass / fail)
[Variants]                     N генераций, выбираем best
       ↓
[Post-processing]              upscale / format / add brand elements
       ↓
[Human review (optional)]      для high-stakes
       ↓
[Storage + serve]              CDN + DB
       ↓
[Performance feedback]         CTR / engagement → обратно в систему для отбора
```

## Текст

### Provider stack (см. cheat sheet 01)

Главное:
- **Batch API** для не-realtime — 50% дешевле
- **Prompt caching** для повторяющихся system / examples
- **Cascading** — дешёвая модель отсеивает, дорогая дорабатывает
- **Structured output** — гарантия что JSON парсится

### Паттерны для маркетинг-текстов

1. **Brand voice prompt** — system prompt с тоном бренда + примеры (few-shot)
2. **Variant generation** — генерим 5 вариантов, ранжируем LLM-judge по предполагаемому CTR
3. **A/B testing pipeline** — каждый вариант в trafic split, после собираем data → новый ranking
4. **Localization** — переводим/адаптируем, не дословно. Sonnet/GPT-4o хорошо работают.

### Eval текста на масштабе

- **LLM-as-judge** — pairwise comparison (Variant A vs Variant B)
- **Перплексия** для consistency
- **Embedding similarity** к brand reference texts
- **Heuristic checks** — длина, banned words, CTA presence

## Изображения

### Модели (2025-2026)

| Модель | Провайдер | Стиль | $/изображение |
|---|---|---|---|
| **GPT-4o Image / DALL-E 4** | OpenAI | универсальная, фотореалистичная | $0.04-0.08 |
| **Imagen 3 / Imagen 4** | Google | фотореалистичная, типография | $0.02-0.04 |
| **Midjourney v6 / v7** | Midjourney | art, aesthetics | $0.02-0.05 |
| **Flux.1 / Flux.1.1** | Black Forest Labs | open-source SOTA, фото | self-host или $0.025 |
| **Stable Diffusion 3 / 3.5** | Stability AI | open-source, кастомизация | self-host |
| **Ideogram 2** | Ideogram | типография в картинке | $0.02 |
| **Recraft v3** | Recraft | дизайн, иллюстрации | $0.04 |

**Что для маркетинга:**
- Фотореалистичная реклама → Imagen 3, GPT-4o Image, Flux.1.1 Pro
- Иллюстрации/арт → Midjourney, Recraft
- С текстом на картинке → Ideogram, GPT-4o Image
- Контроль и tweaking → Flux + ControlNet (self-host)
- Кастомные стили — Flux + LoRA дообучение

### Pipeline image generation

```
[Brief]                "Spring promo banner for fitness app, motivational text"
   ↓
[Prompt engineering]   build prompt с reference style, aspect ratio, negative prompts
   ↓
[Generate N variants]  N=4-8, разные seeds
   ↓
[Quality filter]       NSFW classifier + LLM-judge (matches brief?)
   ↓
[Brand check]          aspect ratio + brand colors + safe zones
   ↓
[Upscale]              Real-ESRGAN если нужно
   ↓
[Composite]            добавить logo, headline через PIL / Sharp
   ↓
[Approved variants]    в S3 + CDN
```

### Стоимость на 1M изображений

- API (Imagen 3): 1M × $0.03 = **$30k**
- Self-host Flux на 4× A100: ~$10/hour × 24 × 30 = $7,200, ~50 images/sec = ~120M / месяц
- **Self-host окупается** при > 200k/month volume

### Best practices для image gen

1. **Seed control** — для воспроизводимости и iteration
2. **Negative prompts** — "no text, no watermarks, no faces" — резко повышает качество
3. **Reference images** — img2img или IP-Adapter для consistency
4. **Aspect ratio в промпте + параметре** — модель не всегда соблюдает
5. **Brand safety filter** — Cloud Vision API или собственный CLIP-classifier на нежелательный контент
6. **LoRA для бренда** — учим модель твоему style на 20-100 ref images

## Видео

В 2025-2026 видео-генерация ещё дорогая, но рабочая.

### Модели

| Модель | Длина | Качество | Цена/секунда |
|---|---|---|---|
| **Sora** (OpenAI) | до 20 сек | очень высокое | ~$0.50-1.00 |
| **Veo 2 / Veo 3** (Google) | до 8 сек | SOTA, физика | ~$0.40-0.80 |
| **Runway Gen-3 / Gen-4** | 5-10 сек | хорошее | $0.10-0.30 |
| **Kling 1.5 / 2** (китайская) | 5-10 сек | впечатляющее, дешёвое | $0.05-0.15 |
| **Pika 2 / 2.1** | 5 сек | art-стилизация | $0.10-0.20 |
| **Luma Dream Machine** | 5 сек | продвинутая физика | $0.10-0.20 |
| **HeyGen / Synthesia** | до минут | AI-аватары (talking head) | $0.05-0.20 |
| **Hailuo (MiniMax)** | 6 сек | дешёвое, доступное | $0.05-0.10 |

### Pipeline видео

```
[Storyboard]            LLM генерирует scene-by-scene описание
   ↓
[Image generation]      key frames per scene
   ↓
[Video gen]             text-to-video или image-to-video из ключевых кадров
   ↓
[Stitching]             FFmpeg склейка сцен
   ↓
[Audio]                 ElevenLabs voiceover + suno music
   ↓
[Captions]              Whisper для transcript + burn-in
   ↓
[Final encoding]        H.264/H.265 + preview
```

### Аналитика стоимости — 30-сек ролик

- 6 сцен × 5 сек × $0.30 = $9 video
- Image key-frames (если img2vid): 6 × $0.04 = $0.24
- Voiceover ElevenLabs: 30 сек × $0.10/min = $0.05
- Music Suno: $0 (бесплатные кредиты) или $0.20
- **Итого: ~$10 на ролик**, против $100-1000 для человеческого.

Окупается на масштабе.

## Best practices для генеративных пайплайнов

### 1. Структурированный prompt

Не "make me a banner". Чёткая структура:
```yaml
subject: fit woman doing yoga
style: cinematic, golden hour
mood: peaceful, aspirational
composition: centred subject, rule of thirds
aspect: 16:9
negative: no faces close-up, no text, no watermark
brand_elements: red accent color
```

LLM преобразует структурированный input в финальный image prompt.

### 2. Auto-prompting

Юзер пишет "promo for new fitness course" → LLM генерит 5 вариантов промпта → image model по каждому → отбор → лучший.

### 3. Failed generation rate

В image-генерации 20-40% результатов не годятся (anatomy issues, плохая композиция). Закладывай в стоимость и pipeline.

### 4. Feature pipelines

Для повторяющихся брифов держи pipeline templates:
- "Onboarding screen image"
- "Push notification banner"
- "Email header image"

Каждый — отдельная функция с параметрами.

### 5. Performance-driven ranking

Собирай performance метрики (CTR, conversion) → feedback loop:
- Топ-перформеры маркируем → используем как reference style для следующих
- Боттом — банируем стиль

### 6. Brand consistency

LoRA training на 30-100 ref images вашего бренда → Flux dreambooth → выход стабильно в стиле.

### 7. Legal / IP

- **Copyright**: Midjourney и DALL-E генерации в US — пока серая зона, нельзя зарегистрировать как авторское
- **Лица**: не генерировать конкретных людей без согласия
- **Brand**: не копировать логотипы конкурентов
- **NSFW**: всегда классификатор на выходе

## Подводные камни

### 1. "Кажется хорошо, но при пересмотре через день — нет"
Решение: peer review + cooldown 24h перед выпуском.

### 2. Стоимость взрывается
1 ролик = $10. 1000 роликов = $10k. Включай budget caps и pre-approval flow.

### 3. Consistency проблема
Каждая генерация другая. Решение: seeds + reference images + brand LoRA.

### 4. Latency для realtime
Sora — 30+ сек. Не для интерактива. Для UI — batch + push notify когда готово.

### 5. Hallucinations в текстовых деталях
Картинки часто с криво-написанным текстом. Решение: Ideogram / GPT-4o Image (умеют типографию).

## О чём спросят на собесе

### Q: "Как массово генерировали бы 100k маркетинговых баннеров?"
1. Кластеризация аудитории (10-50 сегментов)
2. На сегмент — 5-10 brief templates
3. Auto-prompt expansion через LLM
4. Image gen: Flux self-host если volume > 200k/мес, иначе Imagen 3 API
5. NSFW + brand safety filter
6. Composite logo / CTA / text overlay
7. A/B testing с feedback
8. Cost: 100k × $0.03 + $5k composite/QA = $8k. С self-host: $3k.

### Q: "Где self-host vs API для image-моделей?"
- API: < 50k/month, нет ML-команды
- Self-host: > 200k/month, нужна кастомизация (LoRA), privacy. Flux.1-dev — лучший open-source.

### Q: "Кост на видео-генерацию?"
- API (Veo, Sora): $0.40-1.00 / sec → 30-sec ролик ~$15-30
- API дешёвые (Kling, Hailuo): $0.05-0.15 → $1.5-4.5 / 30-sec
- Self-host: возможно, но качество ниже SOTA

### Q: "Как обеспечиваете брендовый стиль?"
- LoRA / DreamBooth fine-tune на reference images
- IP-Adapter для img2img с reference
- Post-processing: brand colors / fonts через PIL/Sharp
- Eval: CLIP similarity с brand reference

## Мой опыт + что сказать

> "В Soulwise делал массовую генерацию текстов гороскопов на 100k+ юзеров — multi-provider, batch API, prompt caching. На картинках — для своих pet-проектов использовал Midjourney и DALL-E, не строил pipeline на API на больших объёмах.
>
> Под Genesis: для текстов готов сходу. Для изображений архитектуру понимаю, но прод pipeline на масштабе — это первый месяц работы. Видео — концептуально знаю, в проде не строил, потребуется пара спринтов на полноценный pipeline.
>
> Подход: всегда начинаю с API (быстрая итерация, нет ML-инфры), считаю экономику, на 200k+/месяц переключаюсь на self-host. Параллельно — feedback loop на performance, чтобы pipeline становился умнее со временем."

## Что ещё освежить до собеса

- [ ] Прочитать [Flux.1 dev model card](https://huggingface.co/black-forest-labs/FLUX.1-dev)
- [ ] Глянуть один туториал по Veo 3 (Google AI Studio)
- [ ] Посчитать экономику генерации креатива на их предполагаемых объёмах (если узнаю)

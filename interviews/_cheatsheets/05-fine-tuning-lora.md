# 05 · Fine-tuning open-source моделей (LoRA, QLoRA, DPO)

> Релевантность к Genesis: **🟡 ГЭП**. В nice-to-have. На bar-raising стоит знать терминологию и когда оправдан fine-tune. Прогонять не обязательно, но один эксперимент в Colab — большой плюс.

## Что и зачем

**Fine-tuning** — обновляем веса предобученной LLM на нашем датасете. Результат: модель специализирована на узкую задачу, обычно лучше базовой на ней.

**LoRA (Low-Rank Adaptation)** — вместо обновления всех 70B параметров обновляем маленькие low-rank матрицы (≈0.1-1% параметров). Дешевле в разы, не сильно теряет в качестве.

**QLoRA** — то же что LoRA, но базовая модель в 4-bit (NF4) квантизации. Можно тренировать 70B на одной 24GB GPU.

### Когда fine-tune оправдан

| Условие | Fine-tune | API + prompt |
|---|---|---|
| Volume < 1M tokens/day | ❌ | ✅ |
| Volume > 100M tokens/day | ✅ | ❌ дорого |
| Задача узкая, стабильная | ✅ | ✅ обе работают |
| Задача меняется часто | ❌ | ✅ |
| Нужен latency < 50ms | ✅ self-host | ❌ API: 500ms+ |
| Privacy / on-premise | ✅ | ❌ |
| Domain super-specific (медицина, legal) | ✅ | ⚠️ можно через RAG |
| Нет ML-команды | ❌ | ✅ |

**Правило большого пальца:** прежде чем fine-tune, попробуй:
1. Better prompt
2. Few-shot examples в промпте
3. RAG
4. Chain-of-thought / structured output
5. Cascading (дешёвая → дорогая модель)

В 80% случаев одно из выше решит задачу.

## Как устроено

### LoRA mathematically

Для каждого linear layer `W ∈ R^(d×d)` (например, attention projections):
```
forward: y = Wx
с LoRA: y = Wx + (BA)x, где A ∈ R^(r×d), B ∈ R^(d×r), r << d (обычно r=4..64)
```
Тренируем только A и B. W заморожен.

Параметры:
- **r (rank)** — выше = больше capacity, чаще r=8 / r=16
- **alpha** — масштаб LoRA вклада, чаще alpha = 2r
- **target_modules** — какие слои адаптировать (обычно q_proj, k_proj, v_proj, o_proj)
- **dropout** — 0.0-0.1

### QLoRA

То же что LoRA + базовая модель в 4-bit NF4 quantization → fits в 24GB VRAM для 7B-13B, в 80GB для 70B.

### Pipeline

```
1. Базовая модель        Llama 3.1 8B / Mistral 7B / Qwen 2.5 7B / Gemma 2 9B
   ↓
2. Подготовка датасета   instruction-tuning format (Alpaca / ShareGPT / ChatML)
   ↓
3. SFT (Supervised FT)   с LoRA, 1-3 эпохи, lr 1e-4 - 5e-4
   ↓
4. (optional) DPO/RLHF   если нужна preference alignment
   ↓
5. Merge LoRA            merge_and_unload() → веса сливаем в одну модель
   ↓
6. Quantize for inference GGUF (llama.cpp) / AWQ / GPTQ
   ↓
7. Deploy                vLLM / TGI / Ollama / llama.cpp
```

## Состояние рынка в 2025-2026

### Базовые модели (open-source)

| Модель | Размер | Сильна в | Лицензия |
|---|---|---|---|
| **Llama 3.1 / 3.3** (Meta) | 8B / 70B / 405B | Универсальная | Llama license (можно коммерч.) |
| **Mistral / Mixtral** | 7B / 8x7B / 8x22B | Европейская, без US compliance | Apache 2.0 (open) / Mistral для больших |
| **Qwen 2.5 / 3** (Alibaba) | 0.5B - 72B | Multilingual, в т.ч. UA/RU | Apache 2.0 |
| **Gemma 2 / 3** (Google) | 2B / 9B / 27B | Compact, быстрая | Gemma license |
| **Phi 3 / 4** (Microsoft) | 3.8B / 14B | Маленькая, быстрая | MIT |
| **DeepSeek V3** | 671B (MoE) | Reasoning, дешёвый inference | Permissive |
| **Yi 1.5 / Aquila** | 6B - 34B | Китайские альтернативы | Permissive |

**В 2025-2026:** 7B-13B модели достигают уровня GPT-3.5 / Sonnet на узких задачах после хорошего fine-tune.

### Тренинг tooling

- **Hugging Face TRL** (Transformers Reinforcement Learning) — `SFTTrainer`, `DPOTrainer`. Стандарт.
- **PEFT** — LoRA/QLoRA от HuggingFace, интегрирован с TRL
- **bitsandbytes** — 4-bit / 8-bit quantization для QLoRA
- **Axolotl** — yaml-config обёртка над TRL, очень популярна
- **Unsloth** — 2x быстрее тренировка, простая API
- **LLaMA-Factory** — UI + config based, для не-ML-инженеров
- **Together AI / Replicate / Fireworks** — managed fine-tuning через API

### Inference engines

- **vLLM** — стандарт для серверного inference, PagedAttention, continuous batching
- **TGI** (HuggingFace) — production-ready, prometheus метрики
- **TensorRT-LLM** (NVIDIA) — лучший latency на GPU
- **llama.cpp / Ollama** — CPU + GPU, локальный inference, GGUF format
- **MLX** (Apple) — для M-серии Mac
- **SGLang** — конкурент vLLM, иногда быстрее

### Хостинг

- **Self-host на A100/H100** — Lambda Labs, Runpod, CoreWeave
- **Replicate** — pay-per-call, ваш fine-tuned образ
- **Together AI** — serverless inference вашей модели
- **AWS Bedrock / Anthropic / OpenAI** — fine-tune через их API (Llama/Mistral на Bedrock)
- **Fireworks** — fast serverless inference

## Best practices

### 1. Сначала проверь что без fine-tune не работает

Это правило: до fine-tune — 30 итераций промпта, few-shot, RAG. Часто решает.

### 2. Датасет важнее модели

1k высококачественных примеров > 100k шумных. Чисти, дедублицируй, отсортируй.

Хорошие dataset patterns:
- 70% — типичные case
- 20% — edge cases  
- 10% — adversarial / hard negatives

### 3. Эвалюация перед, во время, после

- Baseline: базовая модель + промпт на 200 hold-out примерах. Запиши метрику.
- Тренируй с eval каждые N шагов на этом же hold-out.
- После: сравни с baseline. Если +5% — окупается, если +1% — наверное нет.

### 4. Параметры LoRA для старта

```python
from peft import LoraConfig
peft_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM",
)
```

Hyperparams:
- learning_rate: 1e-4 to 5e-4 для LoRA, ниже для DPO
- batch_size: эффективный 32-128 через gradient accumulation
- epochs: 1-3, больше = overfitting
- warmup_ratio: 0.03
- weight_decay: 0.0 (для LoRA) или 0.01
- max_seq_length: насколько влезает в VRAM

### 5. SFT → DPO для alignment

После SFT можно добавить DPO (Direct Preference Optimization) — учим модель предпочитать "хорошие" ответы. Нужен датасет (prompt, chosen, rejected).

DPO стабильнее чем RLHF, проще тренировать, часто +10-20% на human eval.

### 6. Merge + quantize для prod

```python
model.merge_and_unload()  # LoRA веса → в основные
model.save_pretrained("merged_model")
# Затем quantize:
# - GGUF через llama.cpp для CPU/локально
# - AWQ через autoawq для GPU inference
# - GPTQ ещё вариант
```

### 7. Catastrophic forgetting

После fine-tune модель может "забыть" общие способности. Mitigation:
- Подмешать 10-20% general-domain данных в трейн
- Continued pretraining перед SFT (если есть огромный domain corpus)
- LoRA вместо full fine-tune (LoRA менее агрессивна)

## Подводные камни

### 1. Underestimate the dataset effort
80% времени fine-tune — это data labeling/cleaning, не само обучение.

### 2. Overfit to format, not content
Модель учится "формату" ответа, но не реальной задаче. Тест: переформулируй input — должна работать.

### 3. Сравнение с GPT-4 на маленьком тесте
"Наш fine-tune 7B бьёт GPT-4 на 50 примерах" — закроют сразу. Нужны сотни примеров, разные domains.

### 4. Игнор inference cost
Fine-tune прошёл, теперь нужно держать GPU. Может оказаться что API дешевле для твоего volume.

### 5. Privacy через fine-tune не работает
Модель может выучить и потом регургитировать данные. Для приватности — фильтр на выходе или DP-training.

## О чём спросят на собесе

### Q: "Когда fine-tune vs prompt?"
Volume + узкость + privacy → fine-tune. Иначе prompt+RAG.

### Q: "Что такое LoRA / QLoRA?"
LoRA: тренируем low-rank матрицы вместо всех весов, ~1% параметров. QLoRA: + 4-bit базовая модель → tren на consumer GPU.

### Q: "Какие гиперпараметры важны?"
r/alpha для LoRA, learning rate, epochs, batch size. Target modules.

### Q: "Как мерите успех fine-tune?"
Hold-out eval set, golden examples, human eval, business metric.

### Q: "DPO vs RLHF?"
DPO простее, без reward model, преимущественно используется сейчас. RLHF (PPO) сложнее, нужен только для специфических задач.

### Q: "Self-host vs API fine-tune?"
- Self-host: контроль, privacy, кастомизация, но нужна ML-команда и infra ($)
- API (Bedrock/Together): managed, быстрее запустить, но lock-in

### Q: "Распространённые ошибки?"
Слишком high lr → divergence. Слишком много epochs → overfit. Слабый eval → "вроде работает".

## Мой опыт + честный ответ

> "Fine-tuning делал на уровне Colab экспериментов — прогонял QLoRA на Mistral 7B для классификации, на одной T4. В production не деплоил.
>
> У моих клиентов мы каждый раз начинали с prompt+RAG, и в 100% случаев это решало задачу дешевле и быстрее чем fine-tune. Главный barrier к fine-tune: поддержка модели (versioning, inference infra, retraining). При нынешних ценах API (Haiku $0.80/M input, Flash $0.075) брейкэвен с self-host для большинства задач не наступает.
>
> Если бы у вас была задача "классификация креативов на 100M+/мес" — посчитал бы экономику: API = $80k/мес (Haiku), self-host fine-tuned 7B на 4 H100 = $20k/мес инфра + ML-инженер. Если volume стабилен — fine-tune окупается за 2-3 месяца. Готов закрыть полный цикл за месяц production-готовности."

## Закрыть гэп (1 вечер)

- [ ] Прогнать [Unsloth quickstart](https://github.com/unslothai/unsloth) на Colab T4: Llama-3.1-8B + LoRA + dataset из HF (Alpaca-cleaned), 1 эпоха.
- [ ] Посчитать стоимость train (Colab Pro $10/мес) vs inference (Replicate $0.05/req)
- [ ] Сохранить notebook на GitHub
- [ ] Прочитать [Sebastian Raschka — LoRA from scratch](https://magazine.sebastianraschka.com/p/lora-and-dora-from-scratch-implementations) (теория)

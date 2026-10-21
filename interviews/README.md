# Interviews — рабочая папка

Здесь живут все материалы по подготовке к собеседованиям, конспекты звонков и пост-интервью разборы.

## Структура

```
interviews/
├── README.md                          # этот файл
├── robeauty-head-of-it/               # RoBeauty · Head of IT
│   ├── index.html                     # ⚡ quick cheat sheet
│   ├── company.html                   # разбор компании, рынка, стека
│   ├── role.html                      # роль, питч, вопросы, STAR
│   ├── agents.html                    # AI-агент playbook
│   └── style.css
├── genesis-ai-fullstack/              # Genesis · AI Full-Stack Engineer
│   ├── 00-vacancy.md                  # текст вакансии + разбор требований
│   ├── 01-fit-analysis.md             # мэтч моего опыта с вакансией + гэпы
│   ├── 02-self-pitch.md               # 30s / 2min / 5min питч о себе
│   ├── 03-questions-to-ask.md         # мои вопросы к ним (по этапам)
│   ├── 04-genesis-research.md         # ВНЕШНИЙ ресёрч: bar-raising, отзывы, тактики
│   ├── 05-notes-tech-lead-call.md     # 🎯 ПЕРВЫЙ ЗВОНОК с AI Tech Lead — конкретные вопросы
│   ├── 06-test-task.md                # тестовое задание (TBD)
│   ├── 07-notes-bar-raising.md        # заметки: финал с CTO (TBD)
│   ├── 99-followup.md                 # follow-up письма (TBD)
│   ├── evidence-ledger.md              # каноничные факты и честные gap-ответы
│   ├── mock-interview.md               # прогон по шести блокам интервью
│   └── CHEATSHEET-QUICK.md            # ⚡ 1-страничник перед каждым звонком
├── _cheatsheets/                      # тематические шит-шиты (универсальные)
│   ├── 00-index.md
│   ├── 01-llm-pipelines.md            # кост-эффективные LLM пайплайны
│   ├── 02-rag-architecture.md         # RAG, vector DBs, hybrid search
│   ├── 03-agentic-workflows.md        # LangGraph, агенты, tool use
│   ├── 04-predictive-ml.md            # XGBoost, LightGBM, нейросети
│   ├── 05-fine-tuning-lora.md         # LoRA, QLoRA, RLHF/DPO
│   ├── 06-cloud-infra.md              # AWS, GCP, Vercel, Docker, IaC
│   ├── 07-scraping-pipelines.md       # Playwright, Crawlee, anti-bot
│   ├── 08-clustering-nlp.md           # embeddings, кластеризация, topic modeling
│   ├── 09-generative-pipelines.md     # текст, изображения, видео
│   └── 10-system-design-ai.md         # как проектируют AI продукты
└── _templates/
    ├── notes-template.md              # шаблон для конспекта звонка
    ├── post-interview-review.md       # шаблон разбора после интервью
    └── thank-you-email.md             # шаблон follow-up
```

## Принципы работы

1. **Каждый звонок — отдельный файл** в папке вакансии. Заполняем по шаблону `_templates/notes-template.md`.
2. **После каждого звонка** — пост-разбор (`post-interview-review.md`): что зашло, что не зашло, что доучить.
3. **Cheat sheets** — это не зубрёжка, а способ быстро освежить тему. Каждый содержит:
   - "Что это и зачем" — суть в 2 абзацах
   - "Как устроено" — архитектура и компоненты
   - "Как делают в 2025-2026" — текущие best practices
   - "Подводные камни" — то, о чём спросят на собесе
   - "Что сказать на собесе" — мой реальный опыт по теме
4. **Честно про гэпы**: где не знаю — пишем "growth area" и план как закроем за спринт.

## Следующие шаги

- [ ] Обновлять 02-self-pitch.md после каждого звонка по фактическому feedback
- [ ] Закрыть LangGraph: пройти туториал и собрать minimal agent (см. cheat sheet 03)
- [ ] Освежить XGBoost: один Kaggle-like notebook (см. cheat sheet 04)
- [ ] LoRA: прогнать один fine-tune на колабе (см. cheat sheet 05)

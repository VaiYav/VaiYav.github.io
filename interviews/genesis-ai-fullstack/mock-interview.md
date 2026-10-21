# Genesis — mock interview

## Introduction — meeting the interviewers

**Ціль:** 60–120 секунд: хто я → три робочі площини → один доказ → чому Genesis.

Не читати весь стек. Закінчити фразою, яка відкриває deep dive: production AI, внутрішні інструменти або MVP без детального ТЗ.

## Technical background

Відповідати за схемою: технологія → задача → рішення → trade-off → результат.

Пріоритет: TypeScript/NestJS, Vue/React, Python/FastAPI, MongoDB/PostgreSQL, Redis/BullMQ, Docker/CI, Qdrant, LLM providers, testing та AI coding assistants.

## Deep dive

### Soulwise AI — primary production case

Пояснити контекст продукту, власну роль, Qdrant/RAG, multi-provider routing, fallback, Capacitor і вимірюваний результат 250→160 KB. Не змішувати в одну історію всі можливі AI-патерни.

### My Zodiac AI — end-to-end ownership

Пояснити, як з нуля обмежив scope, зв’язав продукт, backend, AI, payments і Android та дійшов до 1500 платних користувачів за 4 місяці.

### Oboard — teamwork and product ownership

Пояснити роботу зі стейкхолдерами, feature ownership, інтеграції та внутрішні інструменти для QA/dev-команд.

## Practical questions

- LLM pipeline на мільйони креативів: ingest → queue → workers → model routing → structured output → storage → eval/observability.
- Надійність: timeout, retry лише для transient errors, fallback, idempotency, DLQ і kill switch.
- Cost/quality/latency: спочатку baseline та метрики, потім caching, routing, batching, token budgets і повторна eval.
- RAG: chunking, embeddings, metadata filters, retrieval metrics, reranking, citations і golden set.
- Agent: state machine, bounded tools, max steps, human approval, persistence та traceability.
- Predictive ML: baseline, leakage, train/validation split, offline metrics, drift і online business metric.
- AI-assisted prototype → production: contract, auth, validation, tests, observability, security review та rollback.

## Q&A

1. Який AI-інструмент зараз має найбільший бізнес-ефект?
2. Що означає production-ready у вашому AI R&D процесі?
3. Який головний bottleneck: cost, latency, quality, data або adoption?
4. Як ви тестуєте prompt/model changes до релізу?
5. Який перший deliverable очікується від цієї ролі за 30–60 днів?

## Next steps

Наприкінці уточнити формат наступного етапу, тестове завдання, критерії оцінювання, timeline та контактну особу для feedback.

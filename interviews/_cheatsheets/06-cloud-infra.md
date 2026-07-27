# 06 · Cloud-инфраструктура (AWS, GCP, Vercel, Docker)

> Релевантность к Genesis: **🟡 ГЭП**. У меня consumer-уровень. Не пытаться играть deep expert — честно сказать "deploy / consumer level, готов рампиться". Знать терминологию.

## Что и зачем

Cloud-инфра для AI-проекта решает 4 задачи:
1. **Compute** — где крутится код (CPU, GPU, serverless)
2. **Storage** — где лежат данные (object, block, vector, relational)
3. **Network / Edge** — как доставляем юзеру (CDN, edge функции, регионы)
4. **Observability** — что куда мониторим

Для AI:
- GPU compute для inference / training
- Vector DBs / object storage для эмбеддингов и raw data
- Очереди для асинхронных LLM-вызовов
- Secrets management для API keys

## AWS — главное

### Compute

| Сервис | Для чего |
|---|---|
| **EC2** | VM, base | старо но работает; для постоянной нагрузки |
| **ECS / EKS** | Контейнеры (Docker / Kubernetes) | для микросервисов |
| **Lambda** | Serverless functions | event-driven, до 15 мин |
| **Fargate** | Serverless containers | без managing EC2 |
| **Batch** | Batch jobs (long-running) | для ETL |
| **EC2 P5 (H100), P4 (A100)** | GPU instances | дорого, но top для ML |
| **Inferentia / Trainium** | AWS custom AI чипы | дешевле для inference |
| **Bedrock** | Managed foundation models | Anthropic Claude, Llama, etc — без managing |
| **SageMaker** | End-to-end ML platform | training, hosting, AutoML |

### Storage

- **S3** — object storage, стандарт. Tiers: Standard, IA, Glacier.
- **EBS** — block storage для EC2
- **EFS** — NFS shared filesystem
- **RDS** — managed Postgres / MySQL / Aurora
- **DynamoDB** — NoSQL key-value, serverless
- **OpenSearch** (Elasticsearch fork) — search + vector hybrid
- **MemoryDB / ElastiCache** — Redis managed

### Networking

- **CloudFront** — CDN
- **Route 53** — DNS
- **API Gateway** — REST/WS gateway
- **VPC, subnets, security groups** — networking primitives

### Observability

- **CloudWatch** — logs, metrics, alarms
- **X-Ray** — tracing
- **CloudTrail** — audit log

### Secrets / IaC

- **Secrets Manager / SSM Parameter Store** — секреты
- **IAM** — permissions, roles
- **CloudFormation / CDK / Terraform** — IaC

### Cost-killers (где переплачивают)

- **NAT Gateway** — $32/мес + traffic, легко улетает в $500+
- **Data egress** — $0.09/GB исходящий из AWS, копит огромные счета
- **idle EC2** — забыли выключить → $400/мес
- **CloudWatch Logs** — без retention быстро растёт
- **EBS unused volumes** — копятся

## GCP — главное

### Compute
- **Compute Engine** — аналог EC2
- **Cloud Run** — serverless containers (мой любимый для prod web apps, простота как у Vercel)
- **Cloud Functions** — Lambda аналог
- **GKE** — Kubernetes managed
- **Vertex AI** — ML platform (training, hosting, AutoML, AI Studio)
- **TPU v5e/v5p** — Google AI чипы

### Storage
- **Cloud Storage** — S3 аналог
- **Cloud SQL** — RDS аналог
- **Spanner** — глобальный SQL
- **BigQuery** — OLAP / analytics SQL warehouse (мощно!)
- **Firestore** — NoSQL document
- **Bigtable** — wide-column, для огромных объёмов

### Сильные стороны GCP
- **BigQuery** — лучший data warehouse на рынке для аналитики (час сравним с ClickHouse у Genesis)
- **Vertex AI** — единый ML hub, в т.ч. fine-tune Gemini
- **Cloud Run** — серверлесс containers с лучшим DX
- **Anthos** — гибрид облака

## Vercel — главное

Best для frontend + edge functions:
- Next.js / Nuxt / SvelteKit — first-class
- Edge functions на 200+ локаций
- Image optimization out of the box
- Превью на каждый PR
- v0.dev — AI generation UI

**Когда брать:** frontend + лёгкий API. **Когда НЕ брать:** тяжёлый backend, ML inference (тогда Cloud Run / Fly.io).

## Docker — базовое

### Best practices

1. **Multi-stage builds** — отдельный build stage, runtime тонкий
2. **Layer caching** — package.json/poetry.lock копируем РАНЬШЕ кода → npm install кэшируется
3. **.dockerignore** — не пихай node_modules, .git, .env в context
4. **Non-root user** — security
5. **Health checks** — HEALTHCHECK инструкция
6. **One process per container** — supervisor — анти-паттерн
7. **Distroless / alpine** — маленькие base images

### Пример хорошего Dockerfile

```dockerfile
# Stage 1: deps
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Stage 2: builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 3: runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system app && adduser --system app -G app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
USER app
EXPOSE 3000
HEALTHCHECK CMD curl -f http://localhost:3000/api/health || exit 1
CMD ["node", ".next/standalone/server.js"]
```

## Docker Compose vs Kubernetes

- **Docker Compose** — для dev окружения, маленьких прод (1 VM, 5-10 сервисов)
- **Kubernetes** — > 10 сервисов, нужен autoscaling, multi-region

**Реальность 2025-2026:** многие отказываются от k8s в пользу managed (ECS, Cloud Run, Fly.io) если можно. K8s сложен в operability.

## IaC (Infrastructure as Code)

- **Terraform** — стандарт, multi-cloud
- **Pulumi** — same in real code (TS/Python/Go)
- **AWS CDK** — TS/Python обёртка над CloudFormation
- **OpenTofu** — open-source fork Terraform (после смены лицензии HashiCorp в 2023)

**В 2025-2026:** Terraform/OpenTofu всё ещё доминирует. Pulumi растёт. CDK популярна в AWS shops.

## Cost optimization для AI workloads

1. **Spot / preemptible instances** для training — 60-90% дешевле
2. **Auto-scale to zero** для inference — Cloud Run / Lambda
3. **Reserved instances** для всегда-on прод (1-3 года, 30-72% off)
4. **Inferentia / TPU / custom чипы** дешевле GPU для inference
5. **Quantization (INT8, INT4)** — модель в 2-4x меньше, дешевле compute
6. **Batching** — несколько запросов на 1 forward pass
7. **Cache** — Redis между inference запросами
8. **CDN для static assets** — не платить за S3 egress

## Что популярно в 2025-2026

- **Fly.io** — простой деплой контейнеров близко к юзерам
- **Modal** — Python serverless для AI / GPU без managing
- **Replicate** — managed inference для open-source моделей
- **Together AI / Fireworks** — fast serverless inference fine-tuned моделей
- **Banana / Beam** — GPU serverless inference
- **Cloudflare Workers / R2** — edge compute + S3-compatible без egress costs
- **Railway / Render** — простой PaaS, как Heroku

## Подводные камни

### 1. Vendor lock-in
Если в каждом сервисе AWS-specific API — миграция = переписать. Решение: abstraction layer.

### 2. Network egress
0.09 за GB исходящий — для AI inference с большими payloads съест бюджет. Решение: Cloudflare R2 (zero egress) или регион вместе с юзерами.

### 3. Cold starts на serverless
Lambda с GPU инициализируется 30+ сек. Решение: provisioned concurrency или Cloud Run with min instances.

### 4. Hidden costs
NAT Gateway, CloudWatch Logs, EBS snapshots — могут добавить 30-50% к биллу.

### 5. Region selection
Один регион = single point of failure. Multi-region — дорого + сложно. Компромисс: один primary + S3 cross-region replication.

## О чём спросят на собесе

### Q: "Где бы хостили LLM-пайплайн на миллион креативов?"
- Compute: Cloud Run + autoscale 0→100, или ECS Fargate
- Очередь: SQS / Cloud Tasks / BullMQ-on-Redis
- Storage: S3 + Postgres
- Vector: managed Qdrant / pgvector
- LLM: API (OpenAI/Anthropic), не self-host для MVP
- Observability: Langfuse self-host + CloudWatch

### Q: "Когда self-host LLM vs API?"
Volume > 100M tokens/day, узкая задача, privacy. Иначе API.

### Q: "AWS vs GCP — что выбрать?"
- AWS — больше сервисов, лучшая enterprise поддержка
- GCP — BigQuery + Vertex AI + Cloud Run проще
- Лучший выбор — тот в котором уже есть expertise команды

### Q: "Что такое IaC и зачем?"
Описать инфру кодом. Воспроизводимо, в git, code review, dev/staging/prod из одного template. Решает "у меня всё работает".

## Мой опыт + честный ответ

> "На уровне consumer — деплоил приложения на AWS (S3, Lambda, EC2), GCP (Cloud Run, Cloud SQL для своих проектов). Не строил MLOps платформы, не управлял Kubernetes-кластерами для команды. Cloud-native mindset есть из NestJS-production: stateless сервисы, очереди, queue-based concurrency, observability.
>
> Daily — Docker, GitHub Actions для CI/CD, docker-compose для dev. У меня даже своя skill ci-pipeline-manager в speckit для оптимизации workflow.
>
> Под Genesis: для MVP пошёл бы с тем что уже знаю — Cloud Run + managed Postgres + Qdrant Cloud + Cloudflare R2 для S3-compatible storage без egress costs. Если масштаб потребует — рампился бы на k8s/EKS за месяц. Готов работать с DevOps командой если она есть, или брать на себя DevOps работы для маленькой команды."

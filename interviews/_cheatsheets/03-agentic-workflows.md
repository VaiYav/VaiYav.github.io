# 03 · Агентные системы и LangGraph

> Релевантность к Genesis: **🟠 ВАЖНО**. У них в nice-to-have "складні AI-агенти (Agentic workflows, LangGraph)". Концептуально я делал, но LangGraph специфично — нужно закрыть туториалом до bar-raising.

## Что и зачем

**AI Agent** — система где LLM не просто отвечает, а **выбирает действия**: вызывает инструменты, ищет в БД, пишет файл, делает HTTP-запрос. На основе результатов решает что делать дальше.

**Простой LLM-call** = детерминированный flow (input → prompt → output).
**Agent** = LLM в цикле "наблюдение → размышление → действие → результат → ...".

**Когда нужно:**
- Задача требует серию шагов с ветвлениями ("если найдено X — делай Y, иначе Z")
- Нужны live данные (search, DB)
- Multi-step task (исследование, написание отчёта)
- Human-in-the-loop (юзер подтверждает критические шаги)

**Когда НЕ нужно:**
- Простая трансформация (text → JSON) — агент тут только усложнит.
- Latency критичен — агент = N × LLM-calls.
- Detective predictive task — XGBoost дешевле и быстрее.

## Как устроено (основные паттерны)

### 1. ReAct (Reason + Act)

Простейший агент. Цикл:
```
Thought: "Чтобы ответить на вопрос, мне нужно найти X"
Action: search("X")
Observation: <результат>
Thought: "Теперь нужно..."
Action: ...
...
Final Answer: ...
```

### 2. Tool Use / Function Calling

LLM вместо текста возвращает структурированный вызов инструмента:
```json
{
  "tool": "search_web",
  "args": { "query": "Genesis IT company Ukraine" }
}
```
Код выполняет инструмент, отдаёт результат назад в контекст, LLM продолжает.

### 3. Planner-Executor

Один LLM **планирует** (создаёт TODO-список), другой (или тот же) **выполняет** каждый шаг.

### 4. Multi-Agent (специализированные агенты)

```
Researcher Agent → Writer Agent → Critic Agent → Finalizer Agent
```
Каждый агент имеет **свой** prompt, тулсы, иногда модель.

### 5. Reflection / Self-correction

После генерации ответа агент проверяет себя (или второй агент проверяет), при необходимости переписывает.

## Состояние рынка в 2025-2026

### Фреймворки

| Фреймворк | Сильна в | Когда брать |
|---|---|---|
| **LangGraph** (LangChain) | Production agents, граф состояний, persistence | Дефолт когда хочешь complex flow с retries и checkpoints |
| **OpenAI Agents SDK** (2025) | Простота, нативно с OpenAI | Когда стэк только OpenAI |
| **Claude Agent SDK / MCP** (Anthropic) | Tool use через MCP, Claude-first | Когда работаешь с Claude и нужны переиспользуемые тулсы |
| **CrewAI** | Multi-agent с ролями (manager, worker) | Когда нужны "роли" агентов |
| **AutoGen** (Microsoft) | Conversational multi-agent | Research, не очень production |
| **Pydantic AI** | Типизированный, lightweight | Когда любишь Pydantic, не хочешь LangChain |
| **Mastra** | TypeScript-first | Node.js/TS стек |
| **DSPy** | Programmatic prompting, оптимизация | Когда нужно systematically оптимизировать промпты |

**Мой выбор по умолчанию:** LangGraph для Python, Mastra или raw SDK для TypeScript.

### MCP (Model Context Protocol)

Anthropic-стандарт (2024 → 2025 стал индустрия-wide). Описывает как **сервер инструментов** общается с **LLM-клиентом**. Преимущество: один MCP-сервер работает с Claude, Cursor, ChatGPT, OpenAI Agents — везде.

Растёт быстро. Genesis скорее всего использует MCP-server'а для тулс внутри своих агентов.

## Best practices

### 1. Начинай простее, чем кажется нужно

Многие задачи решаются "1 LLM-call со structured output" вместо агента. Перед агентом всегда вопрос: "это нельзя свести к функции?"

### 2. Граф состояний > линейный цикл

LangGraph модель: nodes (шаги) + edges (переходы). State разделяется между nodes.

```python
from langgraph.graph import StateGraph, END

class State(TypedDict):
    messages: list
    research_done: bool
    draft: str | None

graph = StateGraph(State)
graph.add_node("research", research_node)
graph.add_node("write", write_node)
graph.add_node("critique", critique_node)

graph.add_edge("research", "write")
graph.add_conditional_edges(
    "critique",
    lambda state: "write" if needs_revision(state) else END,
    {"write": "write", END: END}
)
graph.set_entry_point("research")
app = graph.compile(checkpointer=PostgresSaver(...))
```

Почему граф, не цикл:
- Checkpoints — можно откатить на любой шаг
- Параллельные node — research одновременно из 3 источников
- Human-in-the-loop — pause на node, ждать апрув
- Resume после crash — state в БД

### 3. Tool design

Хорошие инструменты:
- **Atomic** — один тул = одна функция (search vs filter vs sort = 3 разных)
- **Idempotent** — повторный вызов с теми же args = тот же результат
- **Self-describing** — description в schema, чтобы LLM понял когда вызвать
- **Constrained** — args через schema, не "any string"

Плохие:
- "do_everything" — LLM не знает когда вызывать
- "execute_python(code)" — мощно, но опасно (sandbox required)

### 4. Memory

Агент должен помнить контекст между шагами:
- **Short-term**: messages array в контексте (последние N)
- **Long-term**: vector DB с прошлыми interactions
- **Summary**: периодически просим LLM суммаризировать в один абзац

LangGraph: `MessagesState` + checkpointer (Postgres/SQLite/Redis) — out of the box.

### 5. Cost guard для агентов

Агент может зациклиться и сжечь $100 на одном таске. Защита:
- **Max iterations** — после N циклов force stop
- **Max tokens cumulative** — kill switch
- **Timeout** — wall-clock limit
- **Budget per task** — $0.50 max → throw

### 6. Observability

Без traces агент = чёрный ящик.

- **LangSmith** (LangChain) — нативно для LangGraph
- **Langfuse** — open-source альтернатива, любой фреймворк
- **Logfire** (Pydantic) — для Pydantic AI
- **OpenLLMetry** (OpenTelemetry для LLM) — стандарт

Минимум: каждый node fixates input/output, tool calls, latency, cost.

### 7. Evaluation агентов

Сложнее чем eval простых LLM-calls. Метрики:
- **Task success rate** — выполнил ли финальную цель
- **Step efficiency** — сколько шагов сделал vs минимум
- **Tool accuracy** — правильно ли выбирал тулсы
- **Cost per task** — финальная стоимость

Tooling: **LangSmith evaluators**, **DeepEval**, custom.

## Подводные камни

### 1. Бесконечные циклы
LLM может "решить" что нужен ещё один шаг. Защита: max_iterations + termination condition.

### 2. Tool selection hallucinations
LLM зовёт несуществующий тул или с неверными args. Защита: strict schema validation + reflection.

### 3. Context window overflow
После 20 итераций history переполняется. Защита: sliding window + summarization.

### 4. Race conditions в multi-agent
Два агента пишут в один state одновременно. Защита: один writer per node, agents общаются через messages.

### 5. Brittleness
Маленькое изменение в промпте → агент ломается на edge case. Защита: large golden test set.

## О чём спросят на собесе

### Q: "Когда LangGraph vs raw LLM-call?"
- Raw call: 1-2 шага, детерминированный flow.
- LangGraph: > 2 шага, ветвления, persistence, retries, human-in-the-loop.

### Q: "Как останавливать агент в бесконечности?"
- Max iterations
- LLM-as-judge "достаточно ли информации"
- Budget cap
- Конкретный termination signal в state

### Q: "Multi-agent vs один с тулсами?"
- Multi-agent: разные роли требуют РАЗНЫЕ системные промпты / разные модели (исследователь vs writer)
- Один с тулсами: одна "персона", разные действия

В реальности 80% задач лучше решаются "один агент с хорошими тулсами" чем "5 агентов которые болтают". Multi-agent дороже и сложнее дебажить.

### Q: "Как тестируете агента?"
- Unit-тесты на отдельные node (как обычные функции)
- Integration: golden tasks с известным outcome
- Eval: success rate на 100 разных задач

### Q: "MCP — что это и почему важно?"
- Открытый стандарт от Anthropic 2024
- Инструмент описан раз — работает в Claude/Cursor/OpenAI/прочих
- Растёт быстро в 2025-2026 как "USB-C для LLM tools"

## Мой опыт (что сказать)

> "Агентов делал на raw SDK Anthropic — например, в speckit-product-forge 19 sub-agents которые выполняют разные роли в SDD flow: research, plan, scaffold, test, ship. Каждый имеет свой системный промпт, свой набор tools (через MCP в Claude Code), свою модель — Haiku для простых, Sonnet для сложных. State persistence через файловую систему (вся история в .specify/).
>
> LangGraph specifically я не деплоил, но концептуально zero gap — я строил то же самое на нативных Anthropic tool-use. Конкретно к LangGraph мне нравится их checkpointing в Postgres и graph visualization. За спринт могу мигрировать существующие агенты или построить новый в LangGraph под вашу задачу.
>
> Если делать агент-инспектор креативов: 3 node — image_analyzer (Vision API), brand_extractor (LLM с tools для поиска в DB), aggregator. Persistence в Postgres. Eval на 100 ручно-размеченных. Cost guard на $0.20 per креатив."

## Закрыть гэп до bar-raising

- [ ] LangGraph quickstart (1 час): https://langchain-ai.github.io/langgraph/tutorials/introduction/
- [ ] Собрать minimal 3-node graph: researcher → writer → critic
- [ ] Прогнать через LangSmith, посмотреть traces
- [ ] Перенести один из моих sub-agents из speckit в LangGraph (proof of concept)
- [ ] Понять MCP server — собрать свой простой (file_search.py) и подключить к Claude Code

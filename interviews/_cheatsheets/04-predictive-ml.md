# 04 · Predictive ML — XGBoost, LightGBM, нейросети

> Релевантность к Genesis: **🔴 КРИТИЧНО + МОЙ ГЛАВНЫЙ ГЭП**. В nice-to-have явно: "практика побудови предиктивних ML-моделей (XGBoost, LightGBM, нейромережі)". Они будут считать креативы / прогнозировать CTR / LTV / churn. Закрыть как теорию обязательно, прогнать 1 практический notebook.

## Что и зачем

**Predictive ML** — задача "по данным X предскажи Y". Классические сценарии в Genesis-контексте:

| Задача | X (features) | Y (target) | Модель |
|---|---|---|---|
| Прогноз CTR креатива | характеристики креатива (текст, цвет, объекты, аудит) | вероятность клика | LightGBM / XGBoost |
| Прогноз LTV юзера | first-week behavior, source, device | $ за 90 дней | XGBoost, NN |
| Churn prediction | history активности | вероятность отвалиться | LightGBM |
| Конверсия в подписку | behaviour в trial | binary | XGBoost / Logistic |
| Embedding креатива → vector | image | dense vector | CNN / CLIP |
| Categorization | text/image | category | классификация |

## Как устроено (типовой ML-пайплайн)

```
[Raw data]
   ↓
[Cleaning]            убираем NaN, дубли, аномалии
   ↓
[Feature engineering] категоризация, encoding, transforms, aggregations
   ↓
[Train/Val/Test split] 70/15/15 или по времени (для temporal)
   ↓
[Model training]      cross-validation, hyperparameter tuning
   ↓
[Evaluation]          AUC, F1, RMSE, business metric
   ↓
[Deploy]              joblib/onnx → REST API / batch
   ↓
[Monitor]             drift, perf, retraining trigger
```

## Состояние рынка в 2025-2026

### Gradient Boosting (Король табличных данных)

**Когда:** табличные данные (Excel-like), < 10M строк, < 1000 фичей. До сих пор побеждает нейросети на 80% табличных задач.

| Библиотека | Сильна в | Когда брать |
|---|---|---|
| **XGBoost** | Классика, отличная документация, GPU | Дефолт |
| **LightGBM** (Microsoft) | Быстрее XGBoost, лучше на больших данных, leaf-wise growth | Когда > 1M строк, скорость важна |
| **CatBoost** (Yandex) | Лучшая работа с категориальными, ordered boosting (меньше leakage) | Когда много категориальных переменных |

**API почти одинаковый:**
```python
import lightgbm as lgb

model = lgb.LGBMClassifier(
    n_estimators=500,
    learning_rate=0.05,
    max_depth=6,
    num_leaves=31,
    min_child_samples=20,
    reg_alpha=0.1,
    reg_lambda=0.1,
    random_state=42,
)
model.fit(X_train, y_train, eval_set=[(X_val, y_val)], callbacks=[lgb.early_stopping(50)])
pred = model.predict_proba(X_test)[:, 1]
```

### Нейросети для табличных

В 2024-2025 догоняют, но не победили:
- **TabNet**, **TabTransformer**, **FT-Transformer**, **SAINT**, **Trompt** — академически интересно
- **TabPFN** — prior-fitted, работает без тренировки на маленьких данных
- **Реальность:** на 90% табличных задач XGBoost быстрее и точнее, ML-инженер выберет boosting

### Глубокое обучение (где побеждает)

- **Изображения** — CNN (ResNet, EfficientNet) или Vision Transformers (ViT, CLIP, DINOv2)
- **Текст** — BERT-семья для классификации, T5/BART для seq2seq, ⇒ **LLM для большинства задач в 2025**
- **Audio** — Whisper, Wav2Vec
- **Video** — VideoMAE, custom
- **Sequence** — TCN, Transformer, для time series: TimeGPT, Chronos, Lag-Llama
- **Multimodal** — CLIP, ImageBind, Flamingo

### Frameworks

- **PyTorch** — стандарт de facto, гибкий, исследования
- **JAX / Flax** — Google, для super-large-scale
- **TensorFlow / Keras** — поддерживается, но рынок уходит в PyTorch
- **Hugging Face Transformers** — обёртка над PyTorch, must-have для NLP/CV transfer learning
- **scikit-learn** — для классики (Logistic, Random Forest, KMeans, PCA), great pipelines

### AutoML / Low-code

Если задача типовая:
- **AutoGluon** (Amazon) — лучший AutoML по бенчам 2024-2025
- **H2O AutoML**
- **PyCaret** — простой API
- **Vertex AI AutoML** (GCP), **SageMaker Autopilot** (AWS)

**Когда использовать:** baseline за 2 часа без ручной работы. Получаешь "сколько вообще можно выжать?"

## Best practices

### 1. Feature engineering > tuning

Хорошие фичи дают +20% качества. Тюнинг hyperparams — +5%.

Типичные приёмы:
- **Target encoding** для категориальных
- **Aggregation features** — mean/std/count по группе
- **Time-based** — день недели, месяц, время с последнего события
- **Interaction features** — A × B, A / B
- **Polynomial features** для нелинейных эффектов
- **Embedding features** — для текста/картинок (CLIP embedding → tabular фича)

### 2. Cross-validation правильно

- **Stratified K-fold** для классификации с несбалансированными классами
- **Time series split** для temporal данных — НЕ обычный random!
- **Group K-fold** если есть зависимые наблюдения (один user → много строк)

### 3. Hyperparameter tuning

- **Optuna** — стандарт de facto, Bayesian optimization
- **Hyperopt** — старее, всё ещё работает
- **Ray Tune** — для распределённого
- **GridSearch** — только для финального fine-tune узкого диапазона

Optuna пример:
```python
def objective(trial):
    params = {
        "learning_rate": trial.suggest_float("lr", 0.01, 0.3, log=True),
        "max_depth": trial.suggest_int("max_depth", 3, 10),
        "num_leaves": trial.suggest_int("num_leaves", 16, 256),
        "min_child_samples": trial.suggest_int("mcs", 5, 100),
    }
    model = lgb.LGBMClassifier(**params, n_estimators=500)
    model.fit(X_tr, y_tr, eval_set=[(X_va, y_va)], callbacks=[lgb.early_stopping(50)])
    return roc_auc_score(y_va, model.predict_proba(X_va)[:, 1])

study = optuna.create_study(direction="maximize")
study.optimize(objective, n_trials=50)
```

### 4. Calibration

Для probability-prediction (CTR, churn) — модель часто выдаёт **uncalibrated** вероятности. Калибровка через `CalibratedClassifierCV` или Platt scaling.

### 5. Class imbalance

Если 1% positives:
- **Class weights** в модели — простейший вариант
- **SMOTE** — синтетический oversampling
- **Focal loss** для глубокого обучения
- **Threshold tuning** — не 0.5, а оптимизируем под F1 / Precision@K

### 6. Explainability

В проде требуется. Тулзы:
- **SHAP** — стандарт. Per-prediction feature importance.
- **LIME** — старее, всё ещё ОК
- **Feature importance** встроенный в XGBoost/LightGBM — глобальный

```python
import shap
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)
shap.summary_plot(shap_values, X_test)
```

### 7. Drift monitoring

В проде модель деградирует. Мониторим:
- **Data drift** — распределение входов меняется
- **Concept drift** — связь X→Y меняется
- **Prediction drift** — выходные вероятности уезжают

Tooling: **Evidently AI**, **WhyLabs**, **Arize**.

### 8. Retraining strategy

- **Time-based** — раз в неделю/месяц переобучаем на свежих данных
- **Trigger-based** — drift detected → retrain
- **Champion/Challenger** — старая модель vs новая, A/B сравниваем

## Подводные камни

### 1. Data leakage
Самый частый кулак. Признаки которые есть только постфактум попадают в фичи. Пример: "первая покупка" попала в фичи для прогноза "купит или нет".

Защита: time-aware split, аудит фичей "может ли это быть известно в момент prediction?"

### 2. Train/serve skew
Препроцессинг на train отличается от serve. Решение: **scikit-learn Pipeline** или **DVC + MLflow** для воспроизводимости.

### 3. Overfitting
Высокий train acc, низкий val. Решение:
- Early stopping
- Regularization (reg_alpha, reg_lambda)
- Меньше глубина / меньше деревьев
- Кросс-валидация

### 4. AUC лжёт при imbalance
AUC может быть 0.95 при бесполезной модели. Смотри **PR-AUC** (Precision-Recall) для несбалансированных классов.

### 5. Тюнинг без cross-val
Подбираешь параметры по val → переобучаешься на val. Решение: nested CV или отдельный hold-out.

### 6. Игнорирование business metric
ML-метрика (AUC) != business metric ($ revenue). Всегда переводи в деньги: "AUC +0.02 = $X revenue lift".

## О чём спросят на собесе

### Q: "XGBoost vs LightGBM vs CatBoost — когда что?"
- XGBoost: дефолт, отличный, GPU support
- LightGBM: > 1M строк, scale важна, чуть точнее
- CatBoost: много категориальных, не хочешь возиться с encoding

### Q: "Как бы предсказали CTR креатива?"
1. Features: image embeddings (CLIP) + text (caption embedding) + платформа + время + тематика
2. Target: исторический CTR (или log(CTR+1) для регрессии)
3. Model: LightGBM, baseline; если много данных — добавить NN-head на embeddings
4. Eval: PR-AUC + business metric (uplift при таргетинге top-10%)
5. Cold start: для новых форматов — пара недель explore (uniform), потом эксплоит

### Q: "Как бы прогнозировали LTV?"
- Frame as **regression** (predict $ revenue в N дней)
- Features: early behaviour first 24h-7d
- Survival analysis может быть лучше (LTV = integral от retention)
- Tool: XGBoost regression, или **lifetimes** library (BG/NBD model — классика для LTV)

### Q: "Когда NN vs boosting?"
- Tabular < 1M, всё бесcпорно — boosting
- Tabular > 10M + GPU — TabNet или Transformer
- Картинки/видео/текст в фичах — NN (или предобработка через предобуч NN, потом boosting на эмбеддингах)

### Q: "Что такое SHAP?"
Game-theoretic attribution: какой вклад внесла каждая фича в конкретный prediction. Сумма SHAP = разница между prediction и base. Глобально + локально.

### Q: "Где у LLM преимущество, где у классики?"
- **LLM выигрывает:** zero/few-shot, unstructured input, длинный хвост edge cases, redact PII, требует reasoning
- **Boosting выигрывает:** табличные структурированные, < 100ms inference, дешевизна inference (миллиарды predictions), точность на узкой задаче

## Мой опыт + честный ответ

> "Predictive ML на табличных данных — мой growth area. В проде я подходил к классификации через LLM (few-shot, structured output) и embedding-based методы — это хорошо работает на старте: setup за день, нет ML-инфры. В Soulwise и в личных проектах делал embedding-based clustering и классификацию.
>
> XGBoost / LightGBM использовал в Kaggle-формате для своих экспериментов, не в проде. Понимаю когда переключаться: когда есть устойчивые числовые фичи, миллион+ примеров, и нужен inference 1ms — boosting незаменим.
>
> Под вашу задачу (например, прогноз CTR креатива): я бы начал с baseline на LightGBM с embedding-фичами (CLIP для изображения, BGE для текста). Параллельно — LLM-based explainer "почему этот креатив хороший". Затем тюнинг через Optuna, eval на retained set, SHAP для interpretability. Закрыть production-цикл за 2-3 спринта."

## Закрыть гэп (план на 2-3 вечера)

- [ ] Прогнать 1 Kaggle Tabular Playground (например, Spaceship Titanic) — собрать XGBoost + LightGBM, сравнить.
- [ ] Прочитать "Hands-On Gradient Boosting with XGBoost" (1 глава теории, 1 практическая).
- [ ] Прогнать Optuna tuning на этом же датасете.
- [ ] SHAP на финальной модели.
- [ ] Сделать notebook на github в моих проектах — будет доказательство для собеса.
- [ ] Опционально: Facebook Ad Library scrape → predict CTR на реальных креативах.

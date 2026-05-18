---
title: 머신러닝 문제 풀이
date: '2026-05-09'
---
## 목차

- [ML 엔지니어 업무 영역](#ml-엔지니어-업무-영역)
- [예상 문제 20선](#예상-문제-20선)
  - **A. 분류/회귀 (Tabular ML)**
    - [문제 1. 쿠키런 게임로그 기반 이탈 유저 예측](#문제-1-쿠키런-게임로그-기반-이탈-유저-예측)
    - [문제 4. 쿠키런 IAP 매출 예측 (LTV30)](#문제-4-쿠키런-iap-매출-예측-ltv30)
    - [문제 5. 매크로 어뷰징 유저 탐지](#문제-5-매크로-어뷰징-유저-탐지)
  - **B. 추천 시스템**
    - [문제 6. 쿠키런: 킹덤 쿠키 추천 시스템](#문제-6-쿠키런-킹덤-쿠키-추천-시스템)
  - **C. 시계열 예측**
    - [문제 7. 일별 DAU 예측](#문제-7-일별-dau-예측)
  - **D. 강화학습**
    - [문제 2. 쿠키 던전 그리드 환경 + PPO/REINFORCE](#문제-2-쿠키-던전-그리드-환경--ppo-reinforce)
    - [문제 8. 오븐브레이크 자동 점프 DQN](#문제-8-오븐브레이크-자동-점프-dqn)
    - [문제 9. 3-매치 퍼즐 자동 난이도 평가](#문제-9-3-매치-퍼즐-자동-난이도-평가)
  - **E. LLM / NLP 응용**
    - [문제 3. LLM 기반 게임 텍스트 번역 파이프라인](#문제-3-llm-기반-게임-텍스트-번역-파이프라인)
    - [문제 10. 게임 내 채팅 욕설/스팸 필터](#문제-10-게임-내-채팅-욕설스팸-필터)
    - [문제 11. 게임 스토리 자동 요약 봇](#문제-11-게임-스토리-자동-요약-봇)
    - [문제 12. 유저 문의 자동 분류 + 라우팅](#문제-12-유저-문의-자동-분류--라우팅)
  - **F. 컴퓨터 비전 / 생성형 AI**
    - [문제 13. 쿠키 캐릭터 자동 검수](#문제-13-쿠키-캐릭터-자동-검수)
    - [문제 14. 쿠키 풍 더미 이미지 생성기](#문제-14-쿠키-풍-더미-이미지-생성기)
  - **G. A/B 테스트 / 실험 분석**
    - [문제 15. 신규 결제 UI A/B 테스트 분석](#문제-15-신규-결제-ui-ab-테스트-분석)
  - **H. MLOps / 시스템 설계**
    - [문제 16. 매크로 탐지 모델 서빙 시스템 설계](#문제-16-매크로-탐지-모델-서빙-시스템-설계)
    - [문제 17. 실시간 학습 데이터 라벨링 파이프라인](#문제-17-실시간-학습-데이터-라벨링-파이프라인)
  - **I. 데이터 엔지니어링 + ML**
    - [문제 18. 게임 이벤트 로그 funnel 분석](#문제-18-게임-이벤트-로그-funnel-분석)
  - **J. 클러스터링 / 세그멘테이션**
    - [문제 19. 쿠키런 유저 페르소나 클러스터링](#문제-19-쿠키런-유저-페르소나-클러스터링)
  - **K. 평가 / 검증**
    - [문제 20. 신구 번역 모델 비교 평가 시스템](#문제-20-신구-번역-모델-비교-평가-시스템)
- [면접 준비 체크리스트](#면접-준비-체크리스트)


## ML 엔지니어 업무 영역

데브시스터즈 ML 엔지니어 채용 공고에 명시된 실제 업무 영역:

| 영역 | 구체적 프로젝트 |
|------|-------------|
| LLM 번역 | 다국어 서비스를 위한 게임 텍스트 자동 번역 |
| 강화학습 | 신규 스테이지 자동 플레이테스트 봇 (PPO 기반) |
| 생성형 AI | 쿠키런 스타일 컨셉 이미지 생성 봇 |
| ML 예측 | 마케팅 성과 예측 모델 (LTV, ROAS) |
| MLOps | 모델 프로덕션 배포 및 지속적 성능 개선 |

이 영역에서 출제될 가능성이 높은 문제 유형을 다음 섹션에서 다룬다.

---

# 예상 문제 20선

## A. 분류/회귀 (Tabular ML)

---

### 문제 1. 쿠키런 게임로그 기반 이탈 유저 예측

**카테고리**: 이진 분류, Tabular ML
**예상 시간**: 90분

#### 문제 설명

```
용감한 쿠키 데이터팀은 최근 신규 유저들이 첫 7일 이내에 게임을 떠나는 비율이
높다는 점을 알아냈다. 데이터팀은 게임 첫날 행동 로그를 보고 '7일 이내 이탈
여부'를 예측하는 모델을 만들어, 위험군에게 푸시 알림으로 보상을 줄지 결정
하는 시스템을 만들고자 한다.

train.csv 와 test.csv 가 주어진다. 각 행은 한 유저의 첫 24시간 데이터이며,
컬럼은 다음과 같다.

  user_id, signup_country, install_source, device_tier,
  session_count_1d, total_playtime_min_1d, max_stage_reached_1d,
  death_count_1d, in_app_purchase_krw_1d, friend_invite_count_1d,
  ...총 28개 피처, label(0/1, train 에만 존재)

요구사항
1. EDA를 수행하고 feature engineering 을 진행한다.
2. 이탈 여부를 예측하는 모델을 학습한다.
3. test.csv 에 대해 예측을 수행하고 submission.csv 로 저장한다.
4. 평가 지표는 ROC-AUC 이지만, 실제 비즈니스에서 어떤 지표가 더 적절할지
   의견도 함께 작성한다.
```

#### 접근 방법

1. 이진 분류이지만 비즈니스 목적은 *Top K% Precision* → AUC + PR Curve 함께 사용
2. 클래스 불균형 가능성 높음 → `class_weight='balanced'` 또는 stratified sampling
3. 28개 피처 규모 + 표 데이터 → **LightGBM** 이 가장 적합 (학습 빠름, 결측치 자체 처리, 해석성 좋음)
4. Target encoding 시 fold-aware encoding 으로 leakage 방지

#### 풀이 코드

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import roc_auc_score, average_precision_score
import lightgbm as lgb

# ============================================================
# 1. 데이터 로드 및 EDA
# ============================================================
train = pd.read_csv("train.csv")
test = pd.read_csv("test.csv")

print("shape:", train.shape, test.shape)
print("label dist:", train["label"].value_counts(normalize=True))
print("missing:", train.isna().sum().sum())

# 클래스 불균형 확인 (예: 85:15 가정)
# 분포 시각화 (시간 있으면)
# train.hist(figsize=(20,15)); plt.show()

# ============================================================
# 2. Feature Engineering
# ============================================================
def make_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    # 시간 기반 파생
    df["playtime_per_session"] = (
        df["total_playtime_min_1d"] / (df["session_count_1d"] + 1)
    )
    df["stages_per_min"] = (
        df["max_stage_reached_1d"] / (df["total_playtime_min_1d"] + 1)
    )
    df["death_rate"] = (
        df["death_count_1d"] / (df["max_stage_reached_1d"] + 1)
    )
    # 결제 이진 플래그
    df["has_paid"] = (df["in_app_purchase_krw_1d"] > 0).astype(int)
    # 결제액 로그 변환 (zero-inflated long-tail 대응)
    df["log_iap"] = np.log1p(df["in_app_purchase_krw_1d"])
    return df

train = make_features(train)
test = make_features(test)

# 범주형 변수: LightGBM 의 categorical_feature 활용
cat_cols = ["signup_country", "install_source", "device_tier"]
for c in cat_cols:
    train[c] = train[c].astype("category")
    test[c] = test[c].astype("category")
    # train, test 카테고리 일치 보정
    test[c] = test[c].cat.set_categories(train[c].cat.categories)

drop_cols = ["user_id", "label"]
feat_cols = [c for c in train.columns if c not in drop_cols]

X, y = train[feat_cols], train["label"]
X_test = test[feat_cols]

# ============================================================
# 3. 5-Fold CV 학습
# ============================================================
skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
oof = np.zeros(len(X))
test_pred = np.zeros(len(X_test))

for fold, (tr_idx, va_idx) in enumerate(skf.split(X, y)):
    X_tr, X_va = X.iloc[tr_idx], X.iloc[va_idx]
    y_tr, y_va = y.iloc[tr_idx], y.iloc[va_idx]

    model = lgb.LGBMClassifier(
        n_estimators=3000,
        learning_rate=0.03,
        num_leaves=63,
        min_child_samples=50,
        reg_alpha=0.1,
        reg_lambda=0.1,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )
    model.fit(
        X_tr, y_tr,
        eval_set=[(X_va, y_va)],
        eval_metric="auc",
        categorical_feature=cat_cols,
        callbacks=[lgb.early_stopping(100), lgb.log_evaluation(0)],
    )
    oof[va_idx] = model.predict_proba(X_va)[:, 1]
    test_pred += model.predict_proba(X_test)[:, 1] / 5

    print(f"Fold {fold} AUC: {roc_auc_score(y_va, oof[va_idx]):.4f}")

print(f"\nOOF AUC: {roc_auc_score(y, oof):.4f}")
print(f"OOF PR-AUC: {average_precision_score(y, oof):.4f}")

# ============================================================
# 4. Top K% Precision 분석 (비즈니스 지표)
# ============================================================
def precision_at_top_k(y_true, y_score, k_percent):
    n = len(y_true)
    top_k = int(n * k_percent / 100)
    idx = np.argsort(y_score)[::-1][:top_k]
    return y_true.iloc[idx].mean()

for k in [5, 10, 20, 30]:
    p = precision_at_top_k(y, oof, k)
    print(f"Precision@Top {k}%: {p:.4f}")

# ============================================================
# 5. 제출 파일 생성
# ============================================================
submission = pd.DataFrame({
    "user_id": test["user_id"],
    "churn_prob": test_pred,
})
submission.to_csv("submission.csv", index=False)
print("submission.csv saved.")
```

#### 트레이드오프 및 후속 질문

- **"왜 LightGBM 인가요?"** → 학습 빠름, 결측치 자체 처리, 범주형 변수 native 지원, 28개 피처 규모에 딥러닝은 오버킬.
- **"운영 시 모니터링은?"** → PSI(Population Stability Index)로 feature drift, prediction 분포 변화 알람, 매주 batch 재학습.
- **"신작 게임에 cold start 적용?"** → 첫 일주일은 단순 휴리스틱, 데이터 쌓이면 transfer learning.

---

### 문제 4. 쿠키런 IAP 매출 예측 (LTV30)

**카테고리**: 회귀, Tabular ML, Zero-Inflated
**예상 시간**: 90분

#### 문제 설명

```
마케팅팀은 신규 광고 캠페인 집행 전, 유입 유저의 30일 누적 결제액(LTV30)을
예측하고 싶다. 다음과 같은 데이터가 주어진다.

users.csv: user_id, install_date, country, os, ad_creative_id,
           ad_network, campaign_id, ...
events_d1.csv: user_id, event_name, event_value, ts (D+0~D+1 데이터)
ltv30_train.csv: user_id, ltv30_krw (학습용 정답)

D+1 데이터만으로 LTV30 을 예측하라.
평가 지표는 MAE 또는 RMSLE 둘 중 적합하다고 판단되는 것을 선택해 설명.
```

#### 접근 방법

- LTV30 은 **zero-inflated long-tail** 분포: 0이 80%+, 상위 1%가 매출 50%+
- 평가지표 권고: **RMSLE** — MAE 는 long-tail 에서 큰 값에 둔감, RMSE 는 outlier 에 과민
- 두 가지 모델링 선택지:
  - **2-stage**: (1) 결제 여부 분류 → (2) 결제 유저만 회귀
  - **Tweedie regression**: LightGBM 의 `objective='tweedie'` 단일 모델
- 여기서는 Tweedie 로 단순화

#### 풀이 코드

```python
import numpy as np
import pandas as pd
from sklearn.model_selection import KFold
from sklearn.metrics import mean_squared_log_error
import lightgbm as lgb

# ============================================================
# 1. 데이터 로드 + 이벤트 집계
# ============================================================
users = pd.read_csv("users.csv", parse_dates=["install_date"])
events = pd.read_csv("events_d1.csv", parse_dates=["ts"])
ltv = pd.read_csv("ltv30_train.csv")

# 이벤트 집계 (D+1)
event_agg = events.groupby("user_id").agg(
    n_events=("event_name", "count"),
    n_purchase=("event_name", lambda x: (x == "purchase").sum()),
    sum_purchase_d1=("event_value", lambda x: x[events.loc[x.index, "event_name"] == "purchase"].sum()),
    n_session=("event_name", lambda x: (x == "session_start").sum()),
    n_battle=("event_name", lambda x: (x == "battle_complete").sum()),
).reset_index()

# 첫 결제까지 시간 (분 단위)
first_purchase = events[events["event_name"] == "purchase"].groupby("user_id")["ts"].min()
first_event = events.groupby("user_id")["ts"].min()
time_to_first_pay = ((first_purchase - first_event).dt.total_seconds() / 60).rename("min_to_first_pay")

df = users.merge(event_agg, on="user_id", how="left")
df = df.merge(time_to_first_pay, on="user_id", how="left")
df = df.fillna({"n_events": 0, "n_purchase": 0, "sum_purchase_d1": 0,
                "n_session": 0, "n_battle": 0, "min_to_first_pay": -1})

# 학습용
train = df.merge(ltv, on="user_id", how="inner")
test = df[~df["user_id"].isin(ltv["user_id"])]

# ============================================================
# 2. 분포 확인
# ============================================================
print("LTV30 분포:")
print(train["ltv30_krw"].describe())
print(f"0 비율: {(train['ltv30_krw'] == 0).mean():.2%}")
print(f"상위 1% 매출 비중: "
      f"{train['ltv30_krw'].nlargest(int(len(train)*0.01)).sum() / train['ltv30_krw'].sum():.2%}")

# ============================================================
# 3. Feature Engineering
# ============================================================
def make_features(df):
    df = df.copy()
    df["events_per_session"] = df["n_events"] / (df["n_session"] + 1)
    df["paid_d1"] = (df["sum_purchase_d1"] > 0).astype(int)
    df["log_purchase_d1"] = np.log1p(df["sum_purchase_d1"])
    df["weekday"] = df["install_date"].dt.weekday
    return df

train = make_features(train)
test = make_features(test)

cat_cols = ["country", "os", "ad_network", "campaign_id", "ad_creative_id"]
for c in cat_cols:
    train[c] = train[c].astype("category")
    test[c] = test[c].astype("category")
    test[c] = test[c].cat.set_categories(train[c].cat.categories)

drop_cols = ["user_id", "install_date", "ltv30_krw"]
feat_cols = [c for c in train.columns if c not in drop_cols]

X = train[feat_cols]
y = train["ltv30_krw"]
X_test = test[feat_cols]

# ============================================================
# 4. Tweedie 회귀 (zero-inflated 에 적합)
# ============================================================
kf = KFold(n_splits=5, shuffle=True, random_state=42)
oof = np.zeros(len(X))
test_pred = np.zeros(len(X_test))

for fold, (tr_idx, va_idx) in enumerate(kf.split(X)):
    model = lgb.LGBMRegressor(
        objective="tweedie",
        tweedie_variance_power=1.5,  # 1.0(Poisson) ~ 2.0(Gamma) 사이
        n_estimators=3000,
        learning_rate=0.03,
        num_leaves=63,
        min_child_samples=100,
        reg_alpha=0.1,
        reg_lambda=0.1,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(
        X.iloc[tr_idx], y.iloc[tr_idx],
        eval_set=[(X.iloc[va_idx], y.iloc[va_idx])],
        categorical_feature=cat_cols,
        callbacks=[lgb.early_stopping(100), lgb.log_evaluation(0)],
    )
    pred = model.predict(X.iloc[va_idx])
    pred = np.clip(pred, 0, None)  # 음수 예측 방지
    oof[va_idx] = pred
    test_pred += np.clip(model.predict(X_test), 0, None) / 5

# RMSLE 계산
rmsle = np.sqrt(mean_squared_log_error(y, oof))
print(f"OOF RMSLE: {rmsle:.4f}")
print(f"OOF MAE:   {np.mean(np.abs(y - oof)):.0f} KRW")

# ============================================================
# 5. 캠페인별 ROAS 시뮬레이션
# ============================================================
test["pred_ltv30"] = test_pred
roas = test.groupby("campaign_id", observed=True)["pred_ltv30"].agg(["mean", "count"])
print("\n캠페인별 예상 LTV30 평균:")
print(roas.sort_values("mean", ascending=False).head(10))
```

#### 트레이드오프 및 후속 질문

- **"왜 RMSLE 인가요?"** → 작은 값과 큰 값의 상대 오차를 균등하게 평가, long-tail 분포에 적합.
- **"새 광고 채널이 들어오면?"** → `ad_network` 가 unseen category → frequency encoding 또는 unseen 처리 로직.
- **"매일 재학습 vs 주간 재학습?"** → 캠페인 라이프사이클(보통 1~2주)에 맞춰 주 1~2회, 트래픽 변동 큰 날 즉시 재학습.

---

### 문제 5. 매크로 어뷰징 유저 탐지

**카테고리**: 이상 탐지, 극단적 불균형, 신규 패턴 대응
**예상 시간**: 90분

#### 문제 설명

```
새 패치 후 자동 매크로로 보이는 비정상 점수 폭증이 다수 관측됐다.
정상 유저와 매크로 유저를 자동 분류하는 시스템을 만들어라.

train.csv: user_id, session_id, 50개의 행동 특징, label(0/1)
  특징 예: 평균 입력 간격, 입력 간격 표준편차, 동일 패턴 반복 횟수,
          야간 플레이 비율, 점수 증가 곡선 기울기 등

조건
1. 라벨 데이터가 4,000개뿐이고 매크로 라벨은 200개(5%).
2. 운영팀이 false positive 를 매우 싫어한다.
3. 매일 새로운 패턴이 등장할 수 있다.
```

#### 접근 방법

- **하이브리드 접근**: supervised 분류기 + unsupervised anomaly score 앙상블
  - Supervised: LightGBM with `class_weight='balanced'`
  - Unsupervised: Isolation Forest (라벨 없이도 학습 가능, 신규 패턴 대응)
- **FP 최소화**: Precision target 95% 에 맞춰 threshold 조정
- **운영팀 활용성**: 출력은 확률 + 그 외 메타데이터

#### 풀이 코드

```python
import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedKFold
from sklearn.ensemble import IsolationForest
from sklearn.metrics import precision_recall_curve, roc_auc_score
import lightgbm as lgb

# ============================================================
# 1. 데이터 로드
# ============================================================
train = pd.read_csv("train.csv")
feat_cols = [c for c in train.columns if c not in ["user_id", "session_id", "label"]]
X, y = train[feat_cols], train["label"]

print(f"매크로 비율: {y.mean():.2%}")

# ============================================================
# 2. Supervised LightGBM (5-fold CV)
# ============================================================
skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
oof_sup = np.zeros(len(X))

for tr_idx, va_idx in skf.split(X, y):
    model = lgb.LGBMClassifier(
        n_estimators=2000, learning_rate=0.03, num_leaves=31,
        min_child_samples=20, class_weight="balanced",
        random_state=42, n_jobs=-1,
    )
    model.fit(
        X.iloc[tr_idx], y.iloc[tr_idx],
        eval_set=[(X.iloc[va_idx], y.iloc[va_idx])],
        eval_metric="auc",
        callbacks=[lgb.early_stopping(100), lgb.log_evaluation(0)],
    )
    oof_sup[va_idx] = model.predict_proba(X.iloc[va_idx])[:, 1]

print(f"Supervised AUC: {roc_auc_score(y, oof_sup):.4f}")

# ============================================================
# 3. Unsupervised Isolation Forest
# ============================================================
iso = IsolationForest(
    n_estimators=200, contamination=0.05,
    random_state=42, n_jobs=-1,
)
iso.fit(X)
# anomaly score: 낮을수록 정상, 높을수록 이상
anomaly_score = -iso.score_samples(X)
# 0~1 로 정규화
anomaly_score = (anomaly_score - anomaly_score.min()) / (
    anomaly_score.max() - anomaly_score.min()
)
print(f"Unsupervised AUC: {roc_auc_score(y, anomaly_score):.4f}")

# ============================================================
# 4. 앙상블 (가중 평균)
# ============================================================
ensemble_score = 0.7 * oof_sup + 0.3 * anomaly_score
print(f"Ensemble AUC: {roc_auc_score(y, ensemble_score):.4f}")

# ============================================================
# 5. Precision 95% 보장 threshold 찾기
# ============================================================
precisions, recalls, thresholds = precision_recall_curve(y, ensemble_score)

# precision >= 0.95 를 만족하는 threshold 중 recall 가장 큰 것
mask = precisions[:-1] >= 0.95
if mask.any():
    best_idx = np.argmax(recalls[:-1] * mask)
    chosen_threshold = thresholds[best_idx]
    print(f"Precision 95% 보장 threshold: {chosen_threshold:.4f}")
    print(f"  → 이 임계값에서 Recall: {recalls[best_idx]:.4f}")
else:
    print("⚠️  Precision 95% 도달 불가. 모델 개선 또는 추가 라벨링 필요.")
    chosen_threshold = 0.9

# ============================================================
# 6. 운영용 출력 함수
# ============================================================
def predict_with_action(X_new, model, iso, threshold):
    """매크로 탐지 + 운영 액션 추천."""
    p_sup = model.predict_proba(X_new)[:, 1]
    p_iso = -iso.score_samples(X_new)
    p_iso = (p_iso - p_iso.min()) / (p_iso.max() - p_iso.min() + 1e-9)
    score = 0.7 * p_sup + 0.3 * p_iso

    action = np.where(
        score >= threshold, "auto_block",
        np.where(score >= 0.5, "manual_review", "ok")
    )
    return pd.DataFrame({
        "macro_score": score,
        "supervised_score": p_sup,
        "anomaly_score": p_iso,
        "action": action,
    })
```

#### 트레이드오프 및 후속 질문

- **"라벨 4,000개로 부족하면 어떻게 확장?"** → Active learning: 모델이 0.4~0.6 으로 헷갈리는 케이스 우선 라벨링 큐로.
- **"매크로 제작자가 우회하면?"** → 매주 새 데이터로 retraining, feature 다양화 (단일 feature 의존 회피).
- **"unsupervised 점수가 갑자기 분포 변화하면?"** → drift alert → 새로운 매크로 패턴 등장 가능성, 운영자 알림.

---

## B. 추천 시스템

---

### 문제 6. 쿠키런: 킹덤 쿠키 추천 시스템

**카테고리**: 추천 시스템, Item-Item Embedding, Beam Search
**예상 시간**: 90분

#### 문제 설명

```
쿠키런: 킹덤에는 200종 이상의 쿠키가 있다. 유저가 새 덱을 구성할 때 추천해
주는 시스템을 만들고자 한다.

데이터
- battles.parquet: user_id, deck (cookie_id 5개), opponent_deck, win/loss, ts
- cookies.csv: cookie_id, rarity, role, attack_type, ...
- users.csv: user_id, level, league_tier, owned_cookies(list)

요구사항
1. 유저가 보유한 쿠키 내에서, 현재 메타에서 가장 승률이 높을 것으로
   예상되는 5장 덱을 추천.
2. 추천 이유를 자연어로 한 줄 설명.
3. 콜드스타트 유저(전투 기록 < 10) 도 처리.
```

#### 접근 방법

- **Item2Vec**: 같은 덱에 함께 사용된 쿠키 임베딩을 word2vec 스타일로 학습
- **Deck Win Rate Predictor**: 덱(5장)이 주어졌을 때 승률 예측하는 모델
- **추천 = Beam Search**: 보유한 쿠키 중 5장 조합을 탐색 (C(200,5) ≈ 25억 → 전수 불가)
- **콜드스타트**: 레벨/리그 기반 segment 의 평균 메타 덱 fallback

#### 풀이 코드

```python
import numpy as np
import pandas as pd
from gensim.models import Word2Vec
from collections import Counter
import lightgbm as lgb

# ============================================================
# 1. 데이터 로드
# ============================================================
battles = pd.read_parquet("battles.parquet")
cookies = pd.read_csv("cookies.csv")
users = pd.read_csv("users.csv")

# 최근 30일 데이터만 (메타 반영)
battles["ts"] = pd.to_datetime(battles["ts"])
recent = battles[battles["ts"] >= battles["ts"].max() - pd.Timedelta(days=30)]

# ============================================================
# 2. Item2Vec: 덱 = 문장, 쿠키 = 단어
# ============================================================
decks = [list(map(str, deck)) for deck in recent["deck"].tolist()]
w2v = Word2Vec(
    sentences=decks,
    vector_size=64,
    window=5,        # 한 덱 = 5명이므로 전원 같은 context
    min_count=5,
    workers=4,
    sg=1,            # skip-gram 이 item-item 에 더 적합
    epochs=20,
)

def cookie_emb(cid: int) -> np.ndarray:
    key = str(cid)
    if key in w2v.wv:
        return w2v.wv[key]
    return np.zeros(64)

# ============================================================
# 3. 덱 승률 예측 모델
# ============================================================
# Feature: 5명 쿠키의 임베딩 평균 + 통계 + 메타 정보
def deck_features(deck, opponent_deck=None):
    embs = np.stack([cookie_emb(c) for c in deck])
    feats = np.concatenate([
        embs.mean(axis=0),    # mean pooling
        embs.max(axis=0),     # max pooling
        embs.std(axis=0),     # diversity
    ])
    if opponent_deck is not None:
        op_embs = np.stack([cookie_emb(c) for c in opponent_deck])
        feats = np.concatenate([feats, op_embs.mean(axis=0)])
    return feats

# 학습 데이터 구축
X_battle = np.stack([
    deck_features(d, od) for d, od in zip(recent["deck"], recent["opponent_deck"])
])
y_battle = (recent["win"] == True).astype(int).values

# 학습/검증 split (시간순)
split = int(len(X_battle) * 0.8)
X_tr, X_va = X_battle[:split], X_battle[split:]
y_tr, y_va = y_battle[:split], y_battle[split:]

winrate_model = lgb.LGBMClassifier(
    n_estimators=1000, learning_rate=0.05, num_leaves=63,
    random_state=42, n_jobs=-1,
)
winrate_model.fit(
    X_tr, y_tr,
    eval_set=[(X_va, y_va)], eval_metric="auc",
    callbacks=[lgb.early_stopping(50), lgb.log_evaluation(0)],
)

# ============================================================
# 4. Beam Search 로 최적 5장 덱 추천
# ============================================================
def recommend_deck(owned_cookies, top_n=5, beam_width=20, sample_size=50):
    """
    1) 보유한 쿠키 중 임베딩 norm 상위 N장 후보 추리기 (인기 쿠키)
    2) 1장씩 추가하면서 winrate 가 가장 높은 조합 beam_width 개 유지
    """
    # 후보 축소: 너무 많으면 시간 폭발
    pool = owned_cookies[:sample_size] if len(owned_cookies) > sample_size else owned_cookies
    # 초기 beam: 1장씩
    beams = [[c] for c in pool]

    for step in range(2, top_n + 1):
        candidates = []
        for deck in beams:
            for c in pool:
                if c in deck:
                    continue
                new_deck = deck + [c]
                # 부분 덱은 빈 자리를 평균 임베딩으로 채워 점수
                full = new_deck + [None] * (top_n - len(new_deck))
                # None 은 임베딩 0 으로 처리
                embs = np.stack([cookie_emb(c) if c is not None else np.zeros(64)
                                 for c in full])
                feats = np.concatenate([
                    embs.mean(0), embs.max(0), embs.std(0)
                ])
                # opponent 평균 (현 메타의 평균 덱) 사용
                avg_op = np.stack([cookie_emb(c) for c in pool[:5]]).mean(0)
                feats = np.concatenate([feats, avg_op])
                score = winrate_model.predict_proba([feats])[0, 1]
                candidates.append((score, new_deck))
        # 상위 beam_width 유지
        candidates.sort(key=lambda x: -x[0])
        beams = [d for _, d in candidates[:beam_width]]

    best_score, best_deck = max(
        [(winrate_model.predict_proba([
            np.concatenate([
                np.stack([cookie_emb(c) for c in d]).mean(0),
                np.stack([cookie_emb(c) for c in d]).max(0),
                np.stack([cookie_emb(c) for c in d]).std(0),
                np.stack([cookie_emb(c) for c in pool[:5]]).mean(0),
            ])])[0, 1], d) for d in beams],
        key=lambda x: x[0]
    )
    return best_deck, best_score

# ============================================================
# 5. 추천 이유 생성 (간단 템플릿)
# ============================================================
def explain(deck, cookies_df):
    info = cookies_df[cookies_df["cookie_id"].isin(deck)]
    roles = Counter(info["role"])
    main_role = roles.most_common(1)[0][0]
    types = info["attack_type"].unique()
    return (f"현재 메타에서 강세인 {main_role} 중심 덱으로, "
            f"{'/'.join(types[:2])} 타입을 균형 있게 배치했습니다.")

# ============================================================
# 6. 콜드스타트 처리
# ============================================================
def recommend_with_coldstart(user_id):
    user = users[users["user_id"] == user_id].iloc[0]
    n_battles = (battles["user_id"] == user_id).sum()
    owned = user["owned_cookies"]

    if n_battles < 10:
        # 같은 리그의 인기 덱 fallback
        same_league_users = users[users["league_tier"] == user["league_tier"]]["user_id"]
        league_battles = battles[
            battles["user_id"].isin(same_league_users) & (battles["win"] == True)
        ]
        deck_counter = Counter()
        for d in league_battles["deck"]:
            owned_in_d = [c for c in d if c in owned]
            if len(owned_in_d) == 5:
                deck_counter[tuple(sorted(d))] += 1
        if deck_counter:
            top_deck = list(deck_counter.most_common(1)[0][0])
            return top_deck, "같은 리그 유저들이 가장 많이 승리한 메타 덱입니다."

    deck, _ = recommend_deck(owned)
    return deck, explain(deck, cookies)
```

#### 트레이드오프 및 후속 질문

- **"오프라인 NDCG 가 좋아도 실제 클릭률은 별로면?"** → 오프라인 지표는 참고용, A/B 테스트가 최종 판단.
- **"다양성을 어떻게 보장?"** → MMR(Maximal Marginal Relevance) 도입, 추천 결과의 임베딩 분산이 일정 이상 되도록 제약.
- **"신규 쿠키 출시 시?"** → content-based feature (rarity, role, attack_type) 로 cold-start.

---

## C. 시계열 예측

---

### 문제 7. 일별 DAU 예측

**카테고리**: 시계열, 다변량, 신뢰구간 추정
**예상 시간**: 90분

#### 문제 설명

```
운영팀은 7일 후의 DAU 를 예측해 서버 용량을 미리 확보하고 싶다.
지난 2년간의 일별 DAU 데이터(dau.csv: date, dau, is_event, is_update, weekday)
가 주어진다.

요구사항
1. 단변량(과거 DAU만) 모델과 다변량(이벤트/업데이트 플래그 포함) 모델 모두 구현.
2. 7일 예측치와 80% 신뢰구간 제공.
3. 휴일/이벤트 효과를 명시적으로 분리해 시각화.
```

#### 접근 방법

- **단변량**: SARIMA 또는 Prophet (자동 계절성)
- **다변량**: LightGBM with lag features + 외생변수 + Quantile regression 으로 신뢰구간
- **이벤트 효과 분리**: Prophet 의 `holidays` regressor 사용 또는 LightGBM 의 partial dependence

#### 풀이 코드

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from prophet import Prophet
import lightgbm as lgb

# ============================================================
# 1. 데이터 로드
# ============================================================
df = pd.read_csv("dau.csv", parse_dates=["date"])
df = df.sort_values("date").reset_index(drop=True)
print(df.head())
print(f"기간: {df['date'].min()} ~ {df['date'].max()}, 총 {len(df)} 일")

# ============================================================
# 2. 단변량 모델: Prophet
# ============================================================
prophet_df = df.rename(columns={"date": "ds", "dau": "y"})
events = df[df["is_event"] == 1][["date"]].rename(columns={"date": "ds"})
events["holiday"] = "event"
updates = df[df["is_update"] == 1][["date"]].rename(columns={"date": "ds"})
updates["holiday"] = "update"
holidays = pd.concat([events, updates], ignore_index=True)

m_uni = Prophet(
    holidays=holidays,
    yearly_seasonality=True,
    weekly_seasonality=True,
    daily_seasonality=False,
    interval_width=0.80,
)
m_uni.fit(prophet_df[["ds", "y"]])

future = m_uni.make_future_dataframe(periods=7)
forecast_uni = m_uni.predict(future)

# 컴포넌트 시각화 (이벤트/업데이트 효과 분리)
fig = m_uni.plot_components(forecast_uni)
plt.savefig("prophet_components.png", dpi=100, bbox_inches="tight")

print("\nProphet 예측 (마지막 7일):")
print(forecast_uni.tail(7)[["ds", "yhat", "yhat_lower", "yhat_upper"]])

# ============================================================
# 3. 다변량 모델: LightGBM + Quantile regression
# ============================================================
def make_lag_features(df, lags=(1, 7, 14, 28)):
    df = df.copy()
    for lag in lags:
        df[f"dau_lag{lag}"] = df["dau"].shift(lag)
    for w in (7, 14, 28):
        df[f"dau_roll{w}_mean"] = df["dau"].shift(1).rolling(w).mean()
        df[f"dau_roll{w}_std"] = df["dau"].shift(1).rolling(w).std()
    df["month"] = df["date"].dt.month
    df["day"] = df["date"].dt.day
    df["is_weekend"] = (df["weekday"] >= 5).astype(int)
    return df.dropna()

train_df = make_lag_features(df)

feat_cols = [c for c in train_df.columns if c not in ["date", "dau"]]
X, y = train_df[feat_cols], train_df["dau"]

# 시간 기준 split (마지막 60일 검증)
split = len(X) - 60
X_tr, X_va = X[:split], X[split:]
y_tr, y_va = y[:split], y[split:]

# Quantile regression for prediction interval (10%, 50%, 90%)
quantile_models = {}
for q in [0.1, 0.5, 0.9]:
    m = lgb.LGBMRegressor(
        objective="quantile", alpha=q,
        n_estimators=2000, learning_rate=0.03, num_leaves=31,
        min_child_samples=20, random_state=42, n_jobs=-1,
    )
    m.fit(
        X_tr, y_tr,
        eval_set=[(X_va, y_va)],
        callbacks=[lgb.early_stopping(100), lgb.log_evaluation(0)],
    )
    quantile_models[q] = m

# 검증 성능
pred_50 = quantile_models[0.5].predict(X_va)
mae = np.mean(np.abs(y_va - pred_50))
print(f"\nLightGBM Median MAE on validation: {mae:.0f}")

# 80% 구간 coverage 확인
pred_lo = quantile_models[0.1].predict(X_va)
pred_hi = quantile_models[0.9].predict(X_va)
coverage = ((y_va >= pred_lo) & (y_va <= pred_hi)).mean()
print(f"80% interval coverage: {coverage:.2%}")

# ============================================================
# 4. 7일 미래 예측 (recursive)
# ============================================================
def predict_future_7d(history_df, models, feat_cols):
    """recursive forecast: 한 칸씩 예측하고 다음 입력에 반영"""
    df = history_df.copy()
    preds = []
    last_date = df["date"].max()

    for i in range(1, 8):
        new_date = last_date + pd.Timedelta(days=i)
        # 미래 row 임시 생성 (이벤트/업데이트 플래그는 운영팀이 알 수도)
        new_row = {
            "date": new_date,
            "dau": np.nan,
            "is_event": 0,
            "is_update": 0,
            "weekday": new_date.weekday(),
        }
        df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
        df_feat = make_lag_features(df)
        last_X = df_feat[df_feat["date"] == new_date][feat_cols]

        p50 = models[0.5].predict(last_X)[0]
        p10 = models[0.1].predict(last_X)[0]
        p90 = models[0.9].predict(last_X)[0]
        preds.append((new_date, p10, p50, p90))
        df.loc[df["date"] == new_date, "dau"] = p50

    return pd.DataFrame(preds, columns=["date", "p10", "p50", "p90"])

future_pred = predict_future_7d(df, quantile_models, feat_cols)
print("\n7일 예측:")
print(future_pred)

# 시각화
plt.figure(figsize=(14, 5))
plt.plot(df["date"].tail(60), df["dau"].tail(60), label="actual", color="black")
plt.plot(future_pred["date"], future_pred["p50"], label="forecast", color="blue")
plt.fill_between(future_pred["date"], future_pred["p10"], future_pred["p90"],
                 alpha=0.2, label="80% interval")
plt.legend(); plt.xticks(rotation=45)
plt.savefig("dau_forecast.png", dpi=100, bbox_inches="tight")
```

#### 트레이드오프 및 후속 질문

- **"단변량 vs 다변량 중 어느 게 좋나요?"** → 보통 다변량이 우세하지만, 이벤트/업데이트 정보가 미래에 정확히 주어져야 함. 그렇지 않으면 단변량이 더 robust.
- **"신작 게임 출시일은 과거에 없던 이벤트인데?"** → 유사 이벤트(예: 메이저 패치) 효과 크기를 prior 로 사용, Bayesian regression.
- **"예측이 크게 빗나가면 어떻게 알 수 있나요?"** → 일일 잔차 모니터링, 표준편차 2σ 이상 벗어나면 자동 알람.

---

## D. 강화학습

---

### 문제 2. 쿠키 던전 그리드 환경 + PPO/REINFORCE

**카테고리**: 강화학습, Policy Gradient
**예상 시간**: 60분

#### 문제 설명

```
쿠키 던전이라는 5x5 격자 환경이 있다. 쿠키는 (0,0)에서 시작해 (4,4)의 골인
지점까지 가야 한다. 격자 안에는 장애물 두 개와 보너스 젤리 한 개가 있다.

상태: 쿠키의 (x, y) 좌표
행동: 상하좌우 4방향
보상: 골인 +10, 장애물 -5, 젤리 +2, 매 스텝 -0.1

이 환경을 구현하고, Policy Gradient (REINFORCE 또는 PPO) 로 에이전트를
학습시켜라.
```

#### 접근 방법

- 환경을 OpenAI Gym 인터페이스(`reset`, `step`)로 구현
- 60분 안에는 REINFORCE → 안정화 후 PPO 로 확장
- 학습 안정화: returns 정규화, gradient clipping

#### 풀이 코드

```python
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
import matplotlib.pyplot as plt

# ============================================================
# 1. 환경
# ============================================================
class CookieDungeon:
    def __init__(self):
        self.size = 5
        self.obstacles = {(2, 1), (1, 3)}
        self.jelly = {(3, 2)}
        self.goal = (4, 4)
        self.reset()

    def reset(self):
        self.pos = (0, 0)
        self.collected_jelly = set()
        self.steps = 0
        return self._encode(self.pos)

    def _encode(self, pos):
        # 25차원 one-hot
        s = np.zeros(self.size * self.size, dtype=np.float32)
        s[pos[0] * self.size + pos[1]] = 1.0
        return s

    def step(self, action):
        # 0: 상, 1: 하, 2: 좌, 3: 우
        dx, dy = [(-1, 0), (1, 0), (0, -1), (0, 1)][action]
        nx, ny = self.pos[0] + dx, self.pos[1] + dy
        if not (0 <= nx < self.size and 0 <= ny < self.size):
            nx, ny = self.pos  # 격자 밖 → 제자리

        self.pos = (nx, ny)
        self.steps += 1
        reward, done = -0.1, False

        if self.pos in self.obstacles:
            reward += -5
            done = True
        elif self.pos in self.jelly and self.pos not in self.collected_jelly:
            reward += 2
            self.collected_jelly.add(self.pos)

        if self.pos == self.goal:
            reward += 10
            done = True
        if self.steps >= 50:
            done = True
        return self._encode(self.pos), reward, done

# ============================================================
# 2. Policy Network
# ============================================================
class PolicyNet(nn.Module):
    def __init__(self, state_dim=25, action_dim=4, hidden=64):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(state_dim, hidden), nn.ReLU(),
            nn.Linear(hidden, hidden), nn.ReLU(),
            nn.Linear(hidden, action_dim),
        )
    def forward(self, s):
        return torch.softmax(self.net(s), dim=-1)

# ============================================================
# 3. REINFORCE 학습
# ============================================================
env = CookieDungeon()
policy = PolicyNet()
optimizer = optim.Adam(policy.parameters(), lr=1e-3)
gamma = 0.99
history = []

for episode in range(2000):
    state = env.reset()
    log_probs, rewards = [], []

    while True:
        s = torch.from_numpy(state)
        probs = policy(s)
        dist = torch.distributions.Categorical(probs)
        action = dist.sample()
        log_probs.append(dist.log_prob(action))
        state, reward, done = env.step(action.item())
        rewards.append(reward)
        if done:
            break

    # Discounted return
    returns, R = [], 0
    for r in reversed(rewards):
        R = r + gamma * R
        returns.insert(0, R)
    returns = torch.tensor(returns, dtype=torch.float32)
    # Baseline normalization (variance 축소)
    returns = (returns - returns.mean()) / (returns.std() + 1e-8)

    loss = -torch.stack([lp * R for lp, R in zip(log_probs, returns)]).sum()
    optimizer.zero_grad()
    loss.backward()
    torch.nn.utils.clip_grad_norm_(policy.parameters(), max_norm=1.0)
    optimizer.step()

    history.append(sum(rewards))
    if (episode + 1) % 200 == 0:
        avg = np.mean(history[-200:])
        print(f"episode {episode+1}: avg return {avg:.2f}")

# ============================================================
# 4. 학습 곡선과 최적 경로
# ============================================================
plt.figure(figsize=(10, 4))
plt.plot(np.convolve(history, np.ones(50)/50, mode="valid"))
plt.xlabel("episode"); plt.ylabel("return (MA50)")
plt.title("REINFORCE training curve")
plt.savefig("reinforce_curve.png", dpi=100, bbox_inches="tight")

# Greedy rollout
state = env.reset()
path = [env.pos]
for _ in range(50):
    s = torch.from_numpy(state)
    a = torch.argmax(policy(s)).item()
    state, r, done = env.step(a)
    path.append(env.pos)
    if done:
        break
print(f"학습된 정책의 경로: {path}")

# ============================================================
# 5. PPO 로 확장 (참고용 — 시간 여유 있을 때)
# ============================================================
# 핵심 변경점:
# - Actor + Critic (V(s) 추정)
# - Advantage = R - V(s)
# - clipped surrogate objective: min(ratio*A, clip(ratio,1-eps,1+eps)*A)
# - 한 epoch 당 K번 minibatch 업데이트
class ActorCritic(nn.Module):
    def __init__(self, state_dim=25, action_dim=4, hidden=64):
        super().__init__()
        self.shared = nn.Sequential(
            nn.Linear(state_dim, hidden), nn.ReLU(),
            nn.Linear(hidden, hidden), nn.ReLU(),
        )
        self.actor = nn.Linear(hidden, action_dim)
        self.critic = nn.Linear(hidden, 1)
    def forward(self, s):
        h = self.shared(s)
        return torch.softmax(self.actor(h), dim=-1), self.critic(h)
# 학습 루프는 (state, action, old_log_prob, return, advantage) 를 모아
# K번 minibatch 로 clipped ratio loss + value loss + entropy bonus 를 합쳐 업데이트
```

#### 트레이드오프 및 후속 질문

- **"REINFORCE 의 variance 문제 해결책?"** → returns 정규화 (간단), baseline V(s) 도입 (Actor-Critic), PPO 의 clipping (최종).
- **"PPO 가 REINFORCE 보다 좋은 이유?"** → policy 업데이트 크기를 clipping ratio 로 제한 → 안정성↑, sample efficiency↑.
- **"더 큰 환경(쿠키런: 모험의 탑)에 확장?"** → state representation 을 CNN, sparse reward 면 curiosity reward (RND), hierarchical RL.

---

### 문제 8. 오븐브레이크 자동 점프 DQN

**카테고리**: 강화학습, Value-based, DQN
**예상 시간**: 90분

#### 문제 설명

```
오븐브레이크 스타일의 1D 러닝 게임 환경이 코드로 주어진다.
state: 앞쪽 30칸의 장애물/젤리 정보 (벡터)
action: 점프 / 슬라이드 / 더블점프 / 가만히 (4가지)
reward: 젤리 +1, 장애물 충돌 -10 (사망), 살아있는 매 스텝 +0.1

DQN 으로 에이전트를 학습시키고, 학습 곡선과 평균 생존 시간을 보고하라.
```

#### 접근 방법

- Replay buffer + Target network → Q-learning 안정화
- Epsilon-greedy exploration with decay
- Huber loss + gradient clipping

#### 풀이 코드

```python
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
import random
from collections import deque

# ============================================================
# 1. 환경 (간단한 1D 러너 시뮬레이션)
# ============================================================
class OvenBreakEnv:
    """
    1D 러너. 앞쪽 30칸을 본다.
    각 칸: 0(빈칸), 1(낮은 장애물=점프), 2(높은 장애물=슬라이드),
           3(공중 장애물=가만히 or 슬라이드), 4(젤리)
    """
    def __init__(self, seed=None):
        self.rng = np.random.default_rng(seed)
        self.view = 30
        self.reset()

    def reset(self):
        self.track = self._gen_track(500)
        self.pos = 0
        self.state = "ground"   # ground / jumping / sliding / double_jumping
        self.alive = True
        return self._encode()

    def _gen_track(self, length):
        track = self.rng.choice([0, 1, 2, 3, 4],
                                size=length,
                                p=[0.55, 0.12, 0.10, 0.08, 0.15])
        track[:5] = 0  # 시작 부분 안전
        return track

    def _encode(self):
        view = self.track[self.pos:self.pos + self.view]
        if len(view) < self.view:
            view = np.concatenate([view, np.zeros(self.view - len(view))])
        # 상태 one-hot 추가
        state_oh = {"ground":[1,0,0,0], "jumping":[0,1,0,0],
                    "sliding":[0,0,1,0], "double_jumping":[0,0,0,1]}[self.state]
        return np.concatenate([view, state_oh]).astype(np.float32)

    def step(self, action):
        # 0=가만히, 1=점프, 2=슬라이드, 3=더블점프
        cell = self.track[self.pos] if self.pos < len(self.track) else 0
        reward = 0.1

        # 액션 적용 (단순화)
        if action == 1:
            self.state = "jumping" if self.state == "ground" else "double_jumping"
        elif action == 2:
            self.state = "sliding"
        elif action == 0:
            self.state = "ground"

        # 충돌 판정
        crashed = False
        if cell == 1 and self.state not in ("jumping", "double_jumping"):
            crashed = True
        elif cell == 2 and self.state != "sliding":
            crashed = True
        elif cell == 3 and self.state == "jumping":
            crashed = True

        if crashed:
            reward = -10
            self.alive = False
        elif cell == 4 and self.state in ("ground", "sliding"):
            reward += 1

        self.pos += 1
        done = (not self.alive) or self.pos >= len(self.track) - self.view
        return self._encode(), reward, done

# ============================================================
# 2. Q-Network
# ============================================================
class QNet(nn.Module):
    def __init__(self, state_dim=34, action_dim=4, hidden=128):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(state_dim, hidden), nn.ReLU(),
            nn.Linear(hidden, hidden), nn.ReLU(),
            nn.Linear(hidden, action_dim),
        )
    def forward(self, x):
        return self.net(x)

# ============================================================
# 3. Replay Buffer
# ============================================================
class ReplayBuffer:
    def __init__(self, capacity=50000):
        self.buf = deque(maxlen=capacity)
    def push(self, *transition):
        self.buf.append(transition)
    def sample(self, batch_size):
        batch = random.sample(self.buf, batch_size)
        s, a, r, ns, d = zip(*batch)
        return (torch.tensor(np.stack(s), dtype=torch.float32),
                torch.tensor(a, dtype=torch.long),
                torch.tensor(r, dtype=torch.float32),
                torch.tensor(np.stack(ns), dtype=torch.float32),
                torch.tensor(d, dtype=torch.float32))
    def __len__(self):
        return len(self.buf)

# ============================================================
# 4. DQN 학습 루프
# ============================================================
env = OvenBreakEnv(seed=42)
q_net = QNet()
target_net = QNet()
target_net.load_state_dict(q_net.state_dict())
optimizer = optim.Adam(q_net.parameters(), lr=1e-4)
buffer = ReplayBuffer()

gamma = 0.99
batch_size = 64
eps_start, eps_end, eps_decay = 1.0, 0.05, 5000
target_update_freq = 500
total_steps = 0
returns_history = []

for episode in range(2000):
    state = env.reset()
    ep_return = 0

    while True:
        eps = max(eps_end, eps_start - (eps_start - eps_end) * total_steps / eps_decay)
        if random.random() < eps:
            action = random.randint(0, 3)
        else:
            with torch.no_grad():
                q = q_net(torch.from_numpy(state).unsqueeze(0))
                action = q.argmax(dim=1).item()

        next_state, reward, done = env.step(action)
        buffer.push(state, action, reward, next_state, float(done))
        state = next_state
        ep_return += reward
        total_steps += 1

        # 학습
        if len(buffer) >= batch_size:
            s, a, r, ns, d = buffer.sample(batch_size)
            with torch.no_grad():
                q_next = target_net(ns).max(dim=1).values
                target = r + gamma * q_next * (1 - d)
            q_pred = q_net(s).gather(1, a.unsqueeze(1)).squeeze(1)
            loss = nn.functional.smooth_l1_loss(q_pred, target)  # Huber
            optimizer.zero_grad()
            loss.backward()
            torch.nn.utils.clip_grad_norm_(q_net.parameters(), 10.0)
            optimizer.step()

        # Target network 동기화
        if total_steps % target_update_freq == 0:
            target_net.load_state_dict(q_net.state_dict())

        if done:
            break

    returns_history.append(ep_return)
    if (episode + 1) % 100 == 0:
        print(f"ep {episode+1}: return {np.mean(returns_history[-100:]):.2f}, eps {eps:.3f}")

# ============================================================
# 5. 평균 생존 시간 평가
# ============================================================
def evaluate(q_net, n_episodes=20):
    survival = []
    for _ in range(n_episodes):
        env_eval = OvenBreakEnv()
        state = env_eval.reset()
        steps = 0
        while True:
            with torch.no_grad():
                a = q_net(torch.from_numpy(state).unsqueeze(0)).argmax(1).item()
            state, _, done = env_eval.step(a)
            steps += 1
            if done:
                break
        survival.append(steps)
    return np.mean(survival), np.std(survival)

mean_steps, std_steps = evaluate(q_net)
print(f"\n평균 생존 스텝: {mean_steps:.1f} ± {std_steps:.1f}")
```

#### 트레이드오프 및 후속 질문

- **"왜 DQN 인가? Actor-Critic 은?"** → action space discrete + 작음(4) → Q-learning 충분. Continuous 면 DDPG/SAC.
- **"Rainbow DQN 의 어떤 컴포넌트가 효과적?"** → Prioritized replay (sparse reward), Dueling network (action 가치 차이 작은 상태), Double DQN (overestimation bias).
- **"실제 오븐브레이크 게임에 적용?"** → state = 이미지면 CNN, frame stacking, action 빈도 제한 (매 프레임 X, 일정 주기 결정).

---

### 문제 9. 3-매치 퍼즐 자동 난이도 평가

**카테고리**: 강화학습 + 회귀, 시뮬레이션 기반 평가
**예상 시간**: 120분 (정해진 시간 내 한 쪽만 완성도 있게)

#### 문제 설명

```
신규 스테이지 100개의 보드 상태(JSON)가 주어진다. 사람 플레이어 1,000명의
스테이지별 클리어율(0~1)도 제공된다. 새로운 스테이지가 들어왔을 때,
사람의 도움 없이 예상 클리어율을 예측하는 모델을 만들어라.

옵션 1: 보드 자체 특징(피처)로 회귀 모델.
옵션 2: 강화학습 봇으로 N번 플레이 시뮬레이션 → 봇 클리어율과 사람 클리어율의
        매핑 학습.

두 옵션 중 하나를 선택해 구현하고, 다른 옵션의 장단점도 설명.
```

#### 접근 방법

- 면접 시간 내에는 **옵션 1 (회귀)** 가 더 현실적 — 옵션 2 는 RL 환경 구현 + 학습 시간이 부담
- 옵션 1: 보드 정적 feature → LightGBM 회귀
- 옵션 2의 장단점은 코드 리뷰에서 설명

#### 풀이 코드

```python
import numpy as np
import pandas as pd
import json
from sklearn.model_selection import KFold
from sklearn.metrics import mean_absolute_error
import lightgbm as lgb

# ============================================================
# 1. 보드 데이터 로드
# ============================================================
# stages.json 예시
# [{"stage_id": 1, "board": [[0,1,2,...],[...]], "moves": 20,
#   "target": "blocks_destroyed_50", "obstacles": [...] }, ...]
with open("stages.json") as f:
    stages = json.load(f)
clear_rates = pd.read_csv("clear_rates.csv")  # stage_id, clear_rate

# ============================================================
# 2. 보드에서 정적 피처 추출
# ============================================================
def extract_features(stage):
    board = np.array(stage["board"])
    n_colors = len(np.unique(board[board > 0]))
    H, W = board.shape

    features = {
        "stage_id": stage["stage_id"],
        "n_moves": stage["moves"],
        "board_h": H,
        "board_w": W,
        "n_cells": H * W,
        "n_empty": int((board == 0).sum()),
        "n_colors": n_colors,
        "n_obstacles": len(stage.get("obstacles", [])),
        # 시작 시 자동 매치 가능 패턴 수 (가로/세로 3개 연속)
        "auto_match_h": _count_matches(board, axis=0),
        "auto_match_v": _count_matches(board, axis=1),
        # 색깔별 분포 균등도 (엔트로피)
        "color_entropy": _color_entropy(board),
        # 타겟 어려움 점수 (휴리스틱)
        "target_difficulty": _target_score(stage["target"], H * W),
    }
    return features

def _count_matches(board, axis):
    count = 0
    if axis == 0:
        for r in range(board.shape[0]):
            for c in range(board.shape[1] - 2):
                if board[r,c] != 0 and board[r,c] == board[r,c+1] == board[r,c+2]:
                    count += 1
    else:
        for c in range(board.shape[1]):
            for r in range(board.shape[0] - 2):
                if board[r,c] != 0 and board[r,c] == board[r+1,c] == board[r+2,c]:
                    count += 1
    return count

def _color_entropy(board):
    vals, counts = np.unique(board[board > 0], return_counts=True)
    p = counts / counts.sum()
    return -np.sum(p * np.log2(p + 1e-9))

def _target_score(target, n_cells):
    """타겟 종류에 따라 휴리스틱 난이도"""
    if target.startswith("blocks_destroyed_"):
        target_n = int(target.split("_")[-1])
        return target_n / n_cells
    return 0.5

df = pd.DataFrame([extract_features(s) for s in stages])
df = df.merge(clear_rates, on="stage_id")
print(df.head())

# ============================================================
# 3. 회귀 모델 (LightGBM)
# ============================================================
feat_cols = [c for c in df.columns if c not in ["stage_id", "clear_rate"]]
X, y = df[feat_cols], df["clear_rate"]

kf = KFold(n_splits=5, shuffle=True, random_state=42)
oof = np.zeros(len(X))

for tr_idx, va_idx in kf.split(X):
    model = lgb.LGBMRegressor(
        n_estimators=1000, learning_rate=0.05, num_leaves=31,
        min_child_samples=5,  # 데이터 적으므로 작게
        reg_alpha=0.5, reg_lambda=0.5,
        random_state=42, n_jobs=-1,
    )
    model.fit(
        X.iloc[tr_idx], y.iloc[tr_idx],
        eval_set=[(X.iloc[va_idx], y.iloc[va_idx])],
        callbacks=[lgb.early_stopping(50), lgb.log_evaluation(0)],
    )
    oof[va_idx] = np.clip(model.predict(X.iloc[va_idx]), 0, 1)

mae = mean_absolute_error(y, oof)
print(f"\n5-fold OOF MAE: {mae:.4f}")
print(f"실측 분포: mean={y.mean():.3f}, std={y.std():.3f}")
print(f"예측 분포: mean={oof.mean():.3f}, std={oof.std():.3f}")

# Feature importance
imp = pd.DataFrame({"feature": feat_cols, "importance": model.feature_importances_})
print("\nTop features:")
print(imp.sort_values("importance", ascending=False).head(10))

# ============================================================
# 4. 옵션 2 (RL 봇 시뮬레이션) - 개념적 구현 스케치
# ============================================================
"""
옵션 2 코드 스케치 (실제 60분 면접에서는 완성하기 어려움):

class PuzzleEnv:  # 3-매치 시뮬레이터
    def reset(self, board, moves, target): ...
    def step(self, action): ...   # 두 인접 칸 swap

# 사전 학습된 PPO 정책으로 N=100번 시뮬레이션
def bot_clear_rate(stage, policy, n_runs=100):
    wins = 0
    for _ in range(n_runs):
        env = PuzzleEnv()
        env.reset(stage["board"], stage["moves"], stage["target"])
        while not env.done:
            action = policy.act(env.state)
            env.step(action)
        if env.cleared: wins += 1
    return wins / n_runs

# bot_rate -> human_rate 매핑 학습 (단조함수 가정)
# 단순 선형회귀 또는 isotonic regression
from sklearn.isotonic import IsotonicRegression
bot_rates = np.array([bot_clear_rate(s, policy) for s in stages])
mapper = IsotonicRegression(out_of_bounds="clip").fit(bot_rates, clear_rates)
"""
```

#### 트레이드오프 및 후속 질문

- **"두 옵션 비교?"**
  - 옵션 1 (회귀): 빠르고 단순, 보드의 정적 특징만, 동적 플레이 측면 못 잡음
  - 옵션 2 (시뮬레이션): 정확, 비싸고 RL 학습 자체가 sample-inefficient (스테이지 당 수만 에피소드 필요)
- **"봇 ≠ 사람인데 어떻게 보정?"** → calibration mapping (isotonic regression), 봇 클리어율이 1.0 으로 saturate 되면 보조 지표(평균 잔여 무브 수) 사용.
- **"매주 100개 스테이지가 추가되면?"** → 옵션 2 의 봇 학습을 transfer learning 으로 가속, 표준 보드 패턴 캐싱.

---

## E. LLM / NLP 응용

---

### 문제 3. LLM 기반 게임 텍스트 번역 파이프라인

**카테고리**: LLM 응용, 시스템 설계, 프롬프트 엔지니어링
**예상 시간**: 90분

#### 문제 설명

```
데브시스터즈는 신규 쿠키 캐릭터의 대사를 한국어에서 영어/일본어/중국어 간체로
번역하는 도구를 만들고 있다. 단순 기계번역이 아니라 캐릭터의 톤(시니컬한 쿠키,
명랑한 쿠키, 노년의 쿠키 등)을 유지해야 한다.

다음을 구현하라.
1. OpenAI/Anthropic 등 임의의 LLM API 또는 로컬 모델을 사용한 번역 함수.
2. 캐릭터별 톤 가이드를 시스템 프롬프트에 반영하는 구조.
3. 동일 입력에 대한 일관성 평가 함수.
4. 비용/지연 시간을 줄이기 위한 캐싱 전략.
5. 새로운 캐릭터가 추가됐을 때 운영자가 톤 가이드를 추가하는 인터페이스.
```

#### 접근 방법

- **모듈 분리**: LLM Backend / Tone Registry / Prompt Builder / Cache / Evaluator
- **의존성 역전**: LLM 백엔드를 추상화하여 Mock LLM 으로도 테스트 가능
- **캐싱**: 입력+캐릭터+언어 조합을 SHA256 키로

#### 풀이 코드

```python
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Optional
import hashlib

# ============================================================
# 1. 데이터 클래스
# ============================================================
@dataclass
class CharacterTone:
    name: str
    style_desc: str          # 예: "냉소적이고 짧고 단정적이며 종종 비꼬는 톤"
    examples: list[tuple[str, str]] = field(default_factory=list)

# ============================================================
# 2. LLM 백엔드 추상화
# ============================================================
class LLMBackend(ABC):
    @abstractmethod
    def complete(self, system: str, user: str) -> str: ...

class MockLLM(LLMBackend):
    def complete(self, system, user):
        return f"[MOCK translation of: {user[:50]}...]"

class OpenAILLM(LLMBackend):
    def __init__(self, model="gpt-4o-mini", api_key=None):
        from openai import OpenAI
        self.client = OpenAI(api_key=api_key)
        self.model = model
    def complete(self, system, user):
        resp = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "system", "content": system},
                      {"role": "user", "content": user}],
            temperature=0.2,
        )
        return resp.choices[0].message.content.strip()

# ============================================================
# 3. 톤 레지스트리
# ============================================================
class ToneRegistry:
    def __init__(self):
        self._tones: dict[str, CharacterTone] = {}
    def register(self, tone: CharacterTone):
        self._tones[tone.name] = tone
    def get(self, name: str) -> Optional[CharacterTone]:
        return self._tones.get(name)
    def list_all(self) -> list[str]:
        return list(self._tones.keys())

# ============================================================
# 4. 프롬프트 빌더
# ============================================================
class PromptBuilder:
    LANG_FULL = {"en": "영어", "ja": "일본어", "zh": "중국어 간체"}
    LANG_LABEL = {"en": "EN", "ja": "JA", "zh": "ZH"}

    def build(self, tone: CharacterTone, target_lang: str, text: str):
        lang_full = self.LANG_FULL.get(target_lang, target_lang)
        lang_label = self.LANG_LABEL.get(target_lang, target_lang.upper())

        examples_str = "\n".join(
            f"KO: {ko}\n{lang_label}: {tr}" for ko, tr in tone.examples
        ) if tone.examples else "(예시 없음)"

        system = (
            f"당신은 게임 대사 전문 번역가입니다. "
            f"다음 캐릭터의 톤을 유지하여 한국어를 {lang_full}로 번역하세요.\n\n"
            f"# 캐릭터: {tone.name}\n"
            f"# 톤 가이드: {tone.style_desc}\n\n"
            f"# 예시:\n{examples_str}\n\n"
            f"규칙: 번역 결과만 출력. 설명·따옴표·머리말 없음."
        )
        user = f"KO: {text}\n{lang_label}:"
        return system, user

# ============================================================
# 5. 캐시
# ============================================================
class TranslationCache:
    def __init__(self):
        self._cache: dict[str, str] = {}
    def _key(self, text, character, lang):
        raw = f"{text}|{character}|{lang}".encode("utf-8")
        return hashlib.sha256(raw).hexdigest()
    def get(self, text, character, lang):
        return self._cache.get(self._key(text, character, lang))
    def set(self, text, character, lang, value):
        self._cache[self._key(text, character, lang)] = value
    def size(self):
        return len(self._cache)

# ============================================================
# 6. 메인 Translator
# ============================================================
class Translator:
    def __init__(self, llm: LLMBackend, registry: ToneRegistry):
        self.llm = llm
        self.registry = registry
        self.builder = PromptBuilder()
        self.cache = TranslationCache()
        self.stats = {"hits": 0, "misses": 0}

    def translate(self, text: str, character: str, target_lang: str) -> str:
        cached = self.cache.get(text, character, target_lang)
        if cached is not None:
            self.stats["hits"] += 1
            return cached

        tone = self.registry.get(character)
        if tone is None:
            raise ValueError(f"Unknown character: {character}")

        system, user = self.builder.build(tone, target_lang, text)
        result = self.llm.complete(system, user)
        self.cache.set(text, character, target_lang, result)
        self.stats["misses"] += 1
        return result

    def translate_batch(self, items: list[tuple[str, str, str]]) -> list[str]:
        return [self.translate(t, c, l) for t, c, l in items]

# ============================================================
# 7. 일관성 평가
# ============================================================
class ConsistencyEvaluator:
    """동일 캐릭터의 여러 번역문이 의미·스타일적으로 얼마나 가까운지 평가."""
    def __init__(self, model_name="paraphrase-multilingual-MiniLM-L12-v2"):
        from sentence_transformers import SentenceTransformer
        self.encoder = SentenceTransformer(model_name)

    def score(self, translations: list[str]) -> float:
        if len(translations) < 2:
            return 1.0
        import numpy as np
        embs = self.encoder.encode(translations, normalize_embeddings=True)
        sims = embs @ embs.T
        n = len(translations)
        mask = ~np.eye(n, dtype=bool)
        return float(sims[mask].mean())

    def style_consistency_with_llm(self, translations: list[str],
                                    judge_llm: LLMBackend) -> dict:
        """LLM-as-a-judge 로 스타일 일관성 평가 (보조)."""
        system = "당신은 번역 스타일 평가자입니다. 다음 번역들이 같은 톤인지 0~10 점."
        user = "번역들:\n" + "\n".join(f"- {t}" for t in translations)
        return {"raw": judge_llm.complete(system, user)}

# ============================================================
# 8. 운영자 인터페이스
# ============================================================
def register_new_character_cli(registry: ToneRegistry):
    """대화형 캐릭터 등록"""
    name = input("캐릭터 이름: ").strip()
    style = input("톤 설명: ").strip()
    examples = []
    print("예시 한·영 페어를 입력하세요 (빈 줄 입력 시 종료):")
    while True:
        ko = input("  KO: ").strip()
        if not ko:
            break
        en = input("  EN: ").strip()
        examples.append((ko, en))
    registry.register(CharacterTone(name=name, style_desc=style, examples=examples))
    print(f"✓ 캐릭터 '{name}' 등록 완료. (예시 {len(examples)}개)")

# ============================================================
# 9. 사용 예시
# ============================================================
if __name__ == "__main__":
    registry = ToneRegistry()
    registry.register(CharacterTone(
        name="시니컬 쿠키",
        style_desc="냉소적, 짧고 단정적, 종종 비꼬는 어조. 감정 표현 최소화.",
        examples=[("어차피 안 될 거야.", "It won't work anyway."),
                  ("뭐, 별로 놀랍지도 않네.", "Well, not surprising.")]
    ))
    registry.register(CharacterTone(
        name="명랑 쿠키",
        style_desc="밝고 에너지 넘침, 감탄사 자주, 긍정적.",
        examples=[("우와! 정말 신나!", "Wow! So exciting!"),
                  ("같이 가자, 친구야!", "Let's go together, buddy!")]
    ))

    translator = Translator(llm=MockLLM(), registry=registry)

    # 같은 대사를 두 캐릭터로 번역
    text = "이번 모험은 꽤 위험할 거야."
    print("시니컬 →", translator.translate(text, "시니컬 쿠키", "en"))
    print("명랑   →", translator.translate(text, "명랑 쿠키", "en"))

    # 캐시 hit 확인
    translator.translate(text, "시니컬 쿠키", "en")  # 캐시에서 가져옴
    print("\n캐시 통계:", translator.stats)
```

#### 트레이드오프 및 후속 질문

- **"LLM 비용을 더 줄이려면?"** → 의미적 캐싱(임베딩 NN cache), 자주 쓰이는 짧은 대사는 in-house 작은 모델, 긴/창의적 대사만 LLM.
- **"품질 떨어지는 캐릭터가 발견되면?"** → 점진적 escalation: 예시 추가 → few-shot 개수 늘리기 → 해당 캐릭터만 fine-tuning.
- **"환각 방지?"** → temperature 낮게 (0.2), output 길이 제한, 후처리 검증 (금칙어, 길이).

---

### 문제 10. 게임 내 채팅 욕설/스팸 필터

**카테고리**: NLP, 다국어, Cascade 시스템 설계
**예상 시간**: 90분

#### 문제 설명

```
실시간 채팅 메시지 m 이 주어졌을 때, 다음 카테고리로 분류하라.
- 정상 / 욕설 / 스팸 / 개인정보 노출

요구사항
1. 평균 응답 시간 100ms 이하.
2. 새로운 욕설 변형 (ㅅㅂ, ㅂㅅ, fxxk 등) 에 대응.
3. False Positive 가 False Negative 보다 훨씬 비싸다.
4. 한국어 + 영어 + 일본어 + 중국어 동시 지원.
```

#### 접근 방법

- **3단 cascade**: 정규식(μs) → 작은 분류 모델(10~30ms) → LLM fallback (애매한 5%만)
- **FP 최소화**: 높은 confidence threshold, 그 이하는 경고만
- **신조어 대응**: nightly 라벨링 큐 + incremental fine-tuning

#### 풀이 코드

```python
import re
import time
from dataclasses import dataclass
from enum import Enum
from typing import Optional

# ============================================================
# 1. 카테고리 정의
# ============================================================
class Category(Enum):
    NORMAL = "normal"
    PROFANITY = "profanity"
    SPAM = "spam"
    PII = "pii"

@dataclass
class ClassificationResult:
    category: Category
    confidence: float
    layer: str           # "regex" | "ml" | "llm"
    latency_ms: float
    matched_evidence: Optional[str] = None

# ============================================================
# 2. Layer 1: 정규식 + 사전 매칭 (μs)
# ============================================================
class RegexLayer:
    # 한국어 전화번호
    PHONE_KR = re.compile(r"01[0-9][-\s]?\d{3,4}[-\s]?\d{4}")
    # URL
    URL = re.compile(r"https?://\S+|www\.\S+")
    # 카톡 ID 패턴 (단순화)
    KAKAO = re.compile(r"카[톡카]\s*[:：]?\s*[A-Za-z0-9_]{3,}")
    # 기본 욕설 사전 (실제로는 외부 파일에서 로드, 정기 업데이트)
    PROFANITY_DICT = {
        "ko": ["씨발", "ㅅㅂ", "병신", "ㅂㅅ", "개새끼"],
        "en": ["fuck", "fck", "fxxk", "shit", "asshole"],
        "ja": ["くそ", "死ね", "馬鹿"],
        "zh": ["操", "傻逼", "妈的"],
    }
    SPAM_KEYWORDS = ["골드", "도배", "할인", "광고", "judi", "casino"]

    def __init__(self):
        # 모든 욕설을 OR 정규식 한 방으로 (속도 최적화)
        self.profanity_re = re.compile(
            "|".join(re.escape(w) for langs in self.PROFANITY_DICT.values() for w in langs),
            re.IGNORECASE,
        )
        self.spam_re = re.compile(
            "|".join(re.escape(w) for w in self.SPAM_KEYWORDS),
            re.IGNORECASE,
        )

    def classify(self, text: str) -> Optional[ClassificationResult]:
        start = time.perf_counter()
        if m := self.PHONE_KR.search(text):
            return ClassificationResult(Category.PII, 1.0, "regex",
                                        (time.perf_counter() - start) * 1000,
                                        matched_evidence=m.group())
        if m := self.URL.search(text):
            return ClassificationResult(Category.SPAM, 0.95, "regex",
                                        (time.perf_counter() - start) * 1000,
                                        matched_evidence=m.group())
        if m := self.KAKAO.search(text):
            return ClassificationResult(Category.PII, 0.95, "regex",
                                        (time.perf_counter() - start) * 1000,
                                        matched_evidence=m.group())
        if m := self.profanity_re.search(text):
            return ClassificationResult(Category.PROFANITY, 0.97, "regex",
                                        (time.perf_counter() - start) * 1000,
                                        matched_evidence=m.group())
        if m := self.spam_re.search(text):
            return ClassificationResult(Category.SPAM, 0.85, "regex",
                                        (time.perf_counter() - start) * 1000,
                                        matched_evidence=m.group())
        return None  # 다음 레이어로

# ============================================================
# 3. Layer 2: 작은 다국어 분류 모델 (10~30ms)
# ============================================================
class MLLayer:
    """실제로는 distilled XLM-R 같은 작은 모델 로드."""
    def __init__(self, model_path: str = None):
        # 면접에서는 mock 으로 시작, 실제는 transformers 로드
        # from transformers import pipeline
        # self.pipe = pipeline("text-classification",
        #                       model="path/to/distilled-xlmr",
        #                       device="cuda" if torch.cuda.is_available() else "cpu")
        self.model_loaded = False  # mock

    def classify(self, text: str) -> ClassificationResult:
        start = time.perf_counter()
        # Mock: 길이 기반 더미 분류
        if len(text) > 200:
            return ClassificationResult(Category.SPAM, 0.7, "ml",
                                        (time.perf_counter() - start) * 1000)
        # 실제: scores = self.pipe(text)[0]
        return ClassificationResult(Category.NORMAL, 0.6, "ml",
                                    (time.perf_counter() - start) * 1000)

# ============================================================
# 4. Layer 3: LLM fallback (애매할 때만)
# ============================================================
class LLMLayer:
    def __init__(self, llm_backend=None):
        self.llm = llm_backend  # OpenAI / Anthropic / 자체 호스팅

    def classify(self, text: str) -> ClassificationResult:
        start = time.perf_counter()
        if self.llm is None:
            return ClassificationResult(Category.NORMAL, 0.5, "llm",
                                        (time.perf_counter() - start) * 1000)
        system = ("다음 채팅 메시지를 normal/profanity/spam/pii 중 하나로 분류. "
                  "결과 형식: '카테고리|확신도(0~1)'. 다른 말 X.")
        result = self.llm.complete(system, text)
        try:
            cat, conf = result.strip().split("|")
            return ClassificationResult(Category(cat.strip()), float(conf), "llm",
                                        (time.perf_counter() - start) * 1000)
        except Exception:
            return ClassificationResult(Category.NORMAL, 0.5, "llm",
                                        (time.perf_counter() - start) * 1000)

# ============================================================
# 5. Cascade Classifier
# ============================================================
class ChatFilter:
    def __init__(self, regex_layer, ml_layer, llm_layer=None,
                 ml_confidence_threshold=0.85,
                 fp_minimization_threshold=0.9):
        self.regex_layer = regex_layer
        self.ml_layer = ml_layer
        self.llm_layer = llm_layer
        self.ml_conf_threshold = ml_confidence_threshold
        self.fp_threshold = fp_minimization_threshold

    def classify(self, text: str) -> ClassificationResult:
        # Layer 1
        result = self.regex_layer.classify(text)
        if result is not None:
            return result
        # Layer 2
        result = self.ml_layer.classify(text)
        if result.confidence >= self.ml_conf_threshold:
            return result
        # Layer 3 (애매한 케이스만)
        if self.llm_layer is not None:
            return self.llm_layer.classify(text)
        return result

    def should_block(self, result: ClassificationResult) -> bool:
        """FP 최소화: 매우 확신할 때만 차단."""
        if result.category == Category.NORMAL:
            return False
        return result.confidence >= self.fp_threshold

# ============================================================
# 6. 사용
# ============================================================
chat_filter = ChatFilter(RegexLayer(), MLLayer(), llm_layer=None)

samples = [
    "안녕하세요 같이 게임해요",
    "ㅅㅂ 또 졌네",
    "친추 010-1234-5678 카톡 kakao_id_abc 로 연락주세요",
    "https://discord.gg/somestrange 무료 골드 드림",
    "ともだち募集!",
]
for text in samples:
    r = chat_filter.classify(text)
    action = "🚫 BLOCK" if chat_filter.should_block(r) else "✅ allow"
    print(f"{action} | {r.category.value} ({r.confidence:.2f}, {r.layer}, "
          f"{r.latency_ms:.2f}ms) | {text[:50]}")
```

#### 트레이드오프 및 후속 질문

- **"신조어 욕설 빠르게 잡으려면?"** → 운영팀 신고 → 일일 라벨링 → 야간 incremental fine-tuning + 정규식 사전 업데이트.
- **"LLM 호출 비용이 부담?"** → confidence threshold 동적 조정, 의미적 캐싱, 신뢰도 높은 케이스만 호출.
- **"오탐(FP) 발생 시 운영 대응?"** → 차단된 메시지 일일 리뷰 큐, 잘못된 차단은 라벨링 데이터로 재학습.

---

### 문제 11. 게임 스토리 자동 요약 봇

**카테고리**: LLM, Long Context, Map-Reduce
**예상 시간**: 90분

#### 문제 설명

```
쿠키런: 킹덤의 신규 스토리 챕터가 추가됐다. 챕터당 텍스트는 약 30,000자.
다음 기능을 갖춘 요약 봇을 만들어라.

1. 챕터 전체 요약 (300자 이내)
2. 각 등장 캐릭터별 활동 요약
3. "이전 챕터를 안 본 사람을 위한 따라잡기 요약"
4. 한국어 → 영어/일본어 번역까지 한 번에

API 비용 제약: 챕터 하나 요약에 $0.5 이하.
```

#### 접근 방법

- **Map-reduce 요약**: 30k자를 5k 청크로 분할 → 부분 요약 → 통합 요약
- **모델 라우팅**: 부분 요약은 작은 모델, 통합 요약은 큰 모델
- **일관성 유지**: 캐릭터명, 고유명사 glossary 추출하여 모든 청크에 주입

#### 풀이 코드

```python
from dataclasses import dataclass, field
from typing import Optional

# ============================================================
# 1. 데이터 클래스
# ============================================================
@dataclass
class ChapterSummary:
    chapter_id: str
    overall_summary: str
    character_summaries: dict[str, str]
    catchup_summary: str
    translations: dict[str, dict] = field(default_factory=dict)
    cost_usd: float = 0.0

# ============================================================
# 2. LLM 추상화 (모델 라우팅)
# ============================================================
class LLMRouter:
    """비용 최적화를 위한 모델 라우팅"""
    MODELS = {
        "small": {"name": "gpt-4o-mini", "cost_per_1k_in": 0.00015, "cost_per_1k_out": 0.0006},
        "large": {"name": "gpt-4o", "cost_per_1k_in": 0.0025, "cost_per_1k_out": 0.01},
    }

    def __init__(self, client=None):
        self.client = client  # OpenAI client
        self.total_cost = 0.0

    def call(self, tier: str, system: str, user: str, max_tokens: int = 1000) -> str:
        if self.client is None:
            # Mock
            return f"[{tier} MOCK summary of: {user[:80]}...]"
        model = self.MODELS[tier]["name"]
        resp = self.client.chat.completions.create(
            model=model,
            messages=[{"role": "system", "content": system},
                      {"role": "user", "content": user}],
            max_tokens=max_tokens,
            temperature=0.3,
        )
        # 비용 추적
        in_tokens = resp.usage.prompt_tokens
        out_tokens = resp.usage.completion_tokens
        cost = (in_tokens * self.MODELS[tier]["cost_per_1k_in"] +
                out_tokens * self.MODELS[tier]["cost_per_1k_out"]) / 1000
        self.total_cost += cost
        return resp.choices[0].message.content.strip()

# ============================================================
# 3. 청킹
# ============================================================
def chunk_text(text: str, chunk_size: int = 5000, overlap: int = 500) -> list[str]:
    """문자 단위 청킹 (실제로는 문장/단락 경계 존중하는 게 더 좋음)."""
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        # 가능하면 문단 경계에서 끊기
        if end < len(text):
            next_break = text.rfind("\n\n", start, end)
            if next_break > start + chunk_size // 2:
                end = next_break
        chunks.append(text[start:end])
        start = end - overlap if end < len(text) else end
    return chunks

# ============================================================
# 4. 고유명사 추출 (Glossary)
# ============================================================
def extract_glossary(router: LLMRouter, chapter_text: str) -> dict:
    """캐릭터명, 지명, 아이템명 등 고유명사 추출."""
    system = ("당신은 게임 스토리 분석가입니다. 다음 텍스트에서 등장하는 "
              "고유명사를 카테고리별로 추출하세요. "
              "JSON 형식: {\"characters\":[], \"places\":[], \"items\":[]}")
    # 첫 5000자만 사용 (대부분 등장)
    sample = chapter_text[:5000]
    result = router.call("small", system, sample, max_tokens=500)
    # 실제는 json.loads 안전한 파싱 사용
    return {"characters": [], "places": [], "items": [], "raw": result}

# ============================================================
# 5. Map (부분 요약)
# ============================================================
def summarize_chunk(router: LLMRouter, chunk: str, glossary: dict, idx: int) -> str:
    chars_list = ", ".join(glossary.get("characters", [])) or "(자동 식별)"
    system = (
        "다음 게임 스토리 청크를 200자 이내로 요약. "
        f"주요 캐릭터: {chars_list}. "
        "사건의 인과관계와 핵심 행동을 포함, 묘사문은 제외."
    )
    return router.call("small", system, chunk, max_tokens=300)

# ============================================================
# 6. Reduce (통합 요약)
# ============================================================
def merge_summaries(router: LLMRouter, partials: list[str]) -> str:
    joined = "\n\n".join(f"[part {i+1}]\n{p}" for i, p in enumerate(partials))
    system = ("다음은 한 챕터의 부분 요약들이다. 이를 통합해 "
              "300자 이내의 전체 챕터 요약을 작성하라. "
              "시간 순서와 인과관계를 유지하라.")
    return router.call("large", system, joined, max_tokens=400)

# ============================================================
# 7. 캐릭터별 요약
# ============================================================
def character_summary(router: LLMRouter, chunks: list[str],
                       character: str) -> str:
    # 캐릭터가 언급된 청크만 추출 (간단 키워드 매칭)
    relevant = [c for c in chunks if character in c]
    if not relevant:
        return f"{character}는 이 챕터에서 직접 등장하지 않음."
    joined = "\n".join(relevant[:5])  # 최대 5개 청크만
    system = (f"다음 텍스트에서 캐릭터 '{character}'의 행동만 추출해 "
              "150자 이내로 요약. 다른 캐릭터 행동은 제외.")
    return router.call("small", system, joined, max_tokens=200)

# ============================================================
# 8. 따라잡기 요약 (이전 챕터 요약 + 현재)
# ============================================================
def catchup_summary(router: LLMRouter, previous_summaries: list[str],
                     current_summary: str) -> str:
    prev = "\n".join(f"- {s}" for s in previous_summaries[-3:])
    system = ("이전 챕터들을 못 본 사람을 위한 따라잡기 요약 작성. "
              "이전 줄거리 흐름 + 현재 챕터 사건을 자연스럽게 연결. 400자 이내.")
    user = f"# 이전 줄거리\n{prev}\n\n# 현재 챕터 요약\n{current_summary}"
    return router.call("large", system, user, max_tokens=500)

# ============================================================
# 9. 번역
# ============================================================
def translate(router: LLMRouter, text: str, target_lang: str) -> str:
    lang_full = {"en": "영어", "ja": "일본어"}.get(target_lang, target_lang)
    system = (f"다음 한국어 텍스트를 {lang_full}로 자연스럽게 번역. "
              "고유명사는 음역(소리 그대로 표기) 우선.")
    return router.call("small", system, text, max_tokens=600)

# ============================================================
# 10. 메인 파이프라인
# ============================================================
def summarize_chapter(chapter_id: str,
                       text: str,
                       previous_summaries: list[str],
                       client=None,
                       langs: list[str] = ["en", "ja"]) -> ChapterSummary:
    router = LLMRouter(client=client)

    # 1. Glossary
    glossary = extract_glossary(router, text)

    # 2. Chunking
    chunks = chunk_text(text)
    print(f"챕터를 {len(chunks)}개 청크로 분할")

    # 3. Map
    partials = [summarize_chunk(router, c, glossary, i)
                for i, c in enumerate(chunks)]

    # 4. Reduce
    overall = merge_summaries(router, partials)

    # 5. 캐릭터별
    char_summaries = {
        ch: character_summary(router, chunks, ch)
        for ch in glossary.get("characters", [])[:5]  # 상위 5명만
    }

    # 6. 따라잡기
    catchup = catchup_summary(router, previous_summaries, overall)

    # 7. 번역
    translations = {}
    for lang in langs:
        translations[lang] = {
            "overall": translate(router, overall, lang),
            "catchup": translate(router, catchup, lang),
        }

    print(f"✓ 총 비용: ${router.total_cost:.4f}")
    if router.total_cost > 0.5:
        print(f"⚠️ 비용 한도 초과 ($0.5)")

    return ChapterSummary(
        chapter_id=chapter_id,
        overall_summary=overall,
        character_summaries=char_summaries,
        catchup_summary=catchup,
        translations=translations,
        cost_usd=router.total_cost,
    )
```

#### 트레이드오프 및 후속 질문

- **"요약이 중요 사건을 누락하면 어떻게 검증?"** → 핵심 이벤트 체크리스트를 LLM 으로 별도 추출 → 요약과 매칭. 누락 시 알림.
- **"스포일러 방지 모드?"** → 별도 prompt: "결말이나 큰 반전은 언급 X". 또는 사후 redaction.
- **"청크 경계에 사건이 걸치면?"** → overlap 영역 유지 (500자), reduce 단계에서 시간 순서 정렬.

---

### 문제 12. 유저 문의 자동 분류 + 라우팅

**카테고리**: LLM, Structured Output, Multi-task
**예상 시간**: 60분

#### 문제 설명

```
CS 팀에 들어오는 문의 텍스트를 다음 중 하나로 분류하라.
- 결제 환불, 계정 복구, 버그 신고, 게임 가이드, 신고/제재, 기타

추가 요구사항
1. 분류 + 긴급도(0~10) + 자동 응답 가능 여부 + 추천 답변 템플릿 출력.
2. 정확도 95% 이상, 평균 응답 1초 이내.
3. 분류가 모호하면 사람에게 에스컬레이션.
```

#### 접근 방법

- LLM 의 **structured output (JSON mode)** 으로 4가지 multi-task 한 번에
- Confidence 가 낮으면 사람에게 → categorical confidence 추출 강제
- 템플릿은 외부 카탈로그에서 ID 로만 선택

#### 풀이 코드

```python
import json
from dataclasses import dataclass
from enum import Enum
from typing import Optional

# ============================================================
# 1. 카테고리와 템플릿
# ============================================================
class TicketCategory(Enum):
    REFUND = "refund"
    ACCOUNT_RECOVERY = "account_recovery"
    BUG_REPORT = "bug_report"
    GAME_GUIDE = "game_guide"
    REPORT_USER = "report_user"
    OTHER = "other"

# 답변 템플릿 카탈로그 (운영팀이 관리, 외부 DB/파일에서 로드)
TEMPLATE_CATALOG = {
    "REF_001": {"category": "refund", "title": "결제 환불 안내",
                "body": "안녕하세요. 결제 환불은 결제일로부터 7일 이내..."},
    "REF_002": {"category": "refund", "title": "환불 불가 케이스 안내",
                "body": "아이템 사용 후 환불은 어려운 점..."},
    "ACC_001": {"category": "account_recovery", "title": "계정 복구 절차",
                "body": "계정 복구를 위해 다음 정보가 필요합니다..."},
    "BUG_001": {"category": "bug_report", "title": "버그 신고 접수",
                "body": "버그 신고 감사합니다. 재현 영상을..."},
    "GUI_001": {"category": "game_guide", "title": "게임 가이드 링크",
                "body": "쿠키런 가이드는 다음 링크를 참고..."},
    "REP_001": {"category": "report_user", "title": "신고 접수 안내",
                "body": "신고 내용 검토 후 24시간 이내 조치..."},
    "OTH_001": {"category": "other", "title": "추가 문의 안내",
                "body": "더 자세한 정보가 필요합니다. 다음을 알려주세요..."},
}

# ============================================================
# 2. 결과 dataclass
# ============================================================
@dataclass
class TicketAnalysis:
    category: TicketCategory
    confidence: float
    urgency: int           # 0~10
    auto_replyable: bool
    template_id: Optional[str]
    summary: str
    escalate_to_human: bool
    raw_response: str

# ============================================================
# 3. LLM 분석기
# ============================================================
class TicketAnalyzer:
    SYSTEM_PROMPT = """당신은 게임 CS 분류 전문가입니다.
유저 문의를 분석해 다음 JSON 만 출력하세요. 다른 설명 금지.

{
  "category": "refund|account_recovery|bug_report|game_guide|report_user|other",
  "confidence": 0.0~1.0,
  "urgency": 0~10,    
  "auto_replyable": true|false,
  "template_id": "REF_001 등 카탈로그 ID 또는 null",
  "summary": "20자 이내 요약"
}

# 가이드
- urgency 10: 결제 직후 즉시 환불 요청, 계정 해킹 등
- urgency 5~7: 일반 버그 신고, 환불 일반
- urgency 0~3: 가이드 문의, 단순 질문
- auto_replyable: 표준 템플릿으로 해결 가능 여부
- confidence < 0.7: 모호한 경우 (이때 template_id 는 null)"""

    AVAILABLE_TEMPLATES = "\n".join(
        f"- {tid}: {t['title']} ({t['category']})"
        for tid, t in TEMPLATE_CATALOG.items()
    )

    def __init__(self, llm_client=None,
                 confidence_threshold=0.7,
                 escalation_urgency=8):
        self.client = llm_client
        self.confidence_threshold = confidence_threshold
        self.escalation_urgency = escalation_urgency

    def analyze(self, ticket_text: str) -> TicketAnalysis:
        if self.client is None:
            # Mock
            raw = json.dumps({
                "category": "other", "confidence": 0.5, "urgency": 5,
                "auto_replyable": False, "template_id": None,
                "summary": "[MOCK]",
            })
        else:
            user = f"# 사용 가능한 템플릿\n{self.AVAILABLE_TEMPLATES}\n\n# 문의\n{ticket_text}"
            resp = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "system", "content": self.SYSTEM_PROMPT},
                          {"role": "user", "content": user}],
                response_format={"type": "json_object"},
                temperature=0.1,
            )
            raw = resp.choices[0].message.content

        try:
            data = json.loads(raw)
            category = TicketCategory(data["category"])
        except Exception as e:
            # 파싱 실패 → 사람에게
            return TicketAnalysis(
                category=TicketCategory.OTHER,
                confidence=0.0, urgency=5,
                auto_replyable=False, template_id=None,
                summary="parse_failed", escalate_to_human=True,
                raw_response=raw,
            )

        # 템플릿 ID 검증 (환각 방지)
        tid = data.get("template_id")
        if tid and tid not in TEMPLATE_CATALOG:
            tid = None

        confidence = float(data["confidence"])
        urgency = int(data["urgency"])

        # 에스컬레이션 결정
        escalate = (
            confidence < self.confidence_threshold or
            urgency >= self.escalation_urgency or
            not data.get("auto_replyable", False)
        )

        return TicketAnalysis(
            category=category,
            confidence=confidence,
            urgency=urgency,
            auto_replyable=bool(data["auto_replyable"]),
            template_id=tid if not escalate else None,
            summary=data["summary"],
            escalate_to_human=escalate,
            raw_response=raw,
        )

# ============================================================
# 4. 라우팅 시스템
# ============================================================
class TicketRouter:
    def __init__(self, analyzer: TicketAnalyzer):
        self.analyzer = analyzer

    def route(self, ticket_id: str, ticket_text: str) -> dict:
        analysis = self.analyzer.analyze(ticket_text)

        if analysis.escalate_to_human:
            return {
                "ticket_id": ticket_id,
                "action": "assign_to_human",
                "queue": self._select_queue(analysis),
                "priority": analysis.urgency,
                "analysis": analysis,
            }

        # 자동 응답
        template = TEMPLATE_CATALOG.get(analysis.template_id)
        return {
            "ticket_id": ticket_id,
            "action": "auto_reply",
            "template_id": analysis.template_id,
            "reply_body": template["body"] if template else None,
            "analysis": analysis,
        }

    def _select_queue(self, analysis: TicketAnalysis) -> str:
        # 카테고리 + 긴급도 기반 큐 선택
        if analysis.urgency >= 9:
            return "urgent_queue"
        if analysis.category == TicketCategory.REFUND:
            return "billing_team"
        if analysis.category == TicketCategory.BUG_REPORT:
            return "qa_team"
        return "general_cs"

# ============================================================
# 5. 사용
# ============================================================
analyzer = TicketAnalyzer(llm_client=None)
router = TicketRouter(analyzer)

samples = [
    "T001: 어제 결제했는데 다이아가 안 들어왔어요. 즉시 환불해주세요!",
    "T002: 친구가 욕설을 했어요. 신고합니다.",
    "T003: 오븐브레이크 새 쿠키 어떻게 얻나요?",
    "T004: 갑자기 앱이 안 켜져요. 아이폰 15입니다.",
]
for s in samples:
    tid, text = s.split(":", 1)
    result = router.route(tid.strip(), text.strip())
    print(f"\n[{result['ticket_id']}] → {result['action']}")
    print(f"  카테고리: {result['analysis'].category.value}, "
          f"긴급도: {result['analysis'].urgency}, "
          f"confidence: {result['analysis'].confidence:.2f}")
```

#### 트레이드오프 및 후속 질문

- **"신규 카테고리 추가 시?"** → 시스템 프롬프트 + Enum + 템플릿만 업데이트 (LLM 기반의 장점). Fine-tuned 분류기였다면 전체 재학습 필요.
- **"환각으로 없는 템플릿 ID 출력?"** → 카탈로그 검증 (위 코드의 `tid not in TEMPLATE_CATALOG` 체크).
- **"정확도 95% 보장 검증?"** → 매주 샘플링한 100건을 사람이 라벨링 → 자동/수동 정답 비교 → 95% 미만이면 모델 업데이트.

---

## F. 컴퓨터 비전 / 생성형 AI

---

### 문제 13. 쿠키 캐릭터 자동 검수

**카테고리**: 컴퓨터 비전, 고전 CV + 임베딩, 이상 탐지
**예상 시간**: 90분

#### 문제 설명

```
디자이너가 새 쿠키 캐릭터의 액션 스프라이트 시트(800x800 PNG)를 만들어
업로드한다. 다음을 자동 검수하라.

1. 색상이 쿠키런 톤 가이드 범위 내인지 (정해진 팔레트 80% 이상 사용).
2. 캐릭터 외곽이 깨끗한지 (반투명 픽셀, jaggy edge 검출).
3. 알파 채널 누락 여부.
4. 기존 쿠키들과 너무 유사하지 않은지 (표절/중복 방지).
```

#### 접근 방법

- **1, 2, 3 은 고전 CV** 로 충분 (딥러닝 불필요)
- **4 만 임베딩 모델** (CLIP / DINOv2) → 기존 쿠키 임베딩과 cosine similarity
- 디자이너용 시각적 피드백 (오버레이) 제공

#### 풀이 코드

```python
import numpy as np
from PIL import Image
from dataclasses import dataclass, field
from typing import Optional
import cv2

# ============================================================
# 1. 검수 결과 dataclass
# ============================================================
@dataclass
class ReviewResult:
    passed: bool
    palette_match_ratio: float = 0.0
    edge_quality_score: float = 0.0
    has_alpha: bool = False
    max_similarity: float = 0.0
    similar_to: Optional[str] = None
    issues: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)

# ============================================================
# 2. 쿠키런 톤 가이드 (예시 팔레트, Lab 색공간)
# ============================================================
PALETTE_RGB = np.array([
    [255, 220, 180],  # 쿠키 베이스
    [240, 180, 140],  # 진한 쿠키
    [255, 250, 230],  # 밝은 부분
    [120, 80, 50],    # 어두운 부분 / 외곽선
    [255, 100, 100],  # 포인트 빨강
    [100, 200, 255],  # 포인트 파랑
    [255, 220, 100],  # 포인트 노랑
])

def rgb_to_lab(rgb_arr):
    """0~255 RGB array → Lab"""
    rgb_uint8 = rgb_arr.astype(np.uint8).reshape(1, -1, 3)
    return cv2.cvtColor(rgb_uint8, cv2.COLOR_RGB2LAB).reshape(-1, 3).astype(np.float32)

PALETTE_LAB = rgb_to_lab(PALETTE_RGB)

# ============================================================
# 3. 팔레트 매칭
# ============================================================
def check_palette(img_rgba: np.ndarray, threshold_lab=25.0,
                  required_ratio=0.8) -> tuple[float, bool]:
    """알파 > 0 인 픽셀들이 팔레트와 얼마나 가까운지."""
    H, W, _ = img_rgba.shape
    alpha = img_rgba[:, :, 3]
    mask = alpha > 0
    if mask.sum() == 0:
        return 0.0, False

    pixels_rgb = img_rgba[mask][:, :3].astype(np.float32)
    pixels_lab = rgb_to_lab(pixels_rgb)

    # 각 픽셀에 대해 가장 가까운 팔레트 색까지의 거리
    # (n_pixels, 1, 3) - (1, n_palette, 3) → (n_pixels, n_palette)
    dists = np.linalg.norm(
        pixels_lab[:, None, :] - PALETTE_LAB[None, :, :], axis=2
    )
    min_dists = dists.min(axis=1)
    match_ratio = (min_dists < threshold_lab).mean()
    return match_ratio, match_ratio >= required_ratio

# ============================================================
# 4. 외곽 품질 검사
# ============================================================
def check_edge_quality(img_rgba: np.ndarray) -> tuple[float, bool]:
    """알파 채널의 그라데이션 일관성 + jaggy edge 검출."""
    alpha = img_rgba[:, :, 3]

    # 외곽 영역 (알파 0~255 의 중간값) 비율
    edge_zone = ((alpha > 0) & (alpha < 255)).sum()
    full_alpha = (alpha == 255).sum() + 1e-9
    edge_ratio = edge_zone / (full_alpha + edge_zone)

    # 알파 채널의 Sobel gradient (외곽이 jaggy 한지)
    grad_x = cv2.Sobel(alpha, cv2.CV_64F, 1, 0, ksize=3)
    grad_y = cv2.Sobel(alpha, cv2.CV_64F, 0, 1, ksize=3)
    grad_mag = np.sqrt(grad_x ** 2 + grad_y ** 2)
    # 강한 gradient 중에서 alpha < 255 인 자연스러운 경사가 차지하는 비율
    strong_edges = grad_mag > 50
    smooth_edges = strong_edges & ((alpha > 50) & (alpha < 200))
    smooth_ratio = smooth_edges.sum() / (strong_edges.sum() + 1e-9)

    # 0~1 score: 높을수록 부드러움
    score = float(0.5 * edge_ratio + 0.5 * smooth_ratio)
    return score, score > 0.3

# ============================================================
# 5. 알파 채널 존재 여부
# ============================================================
def check_alpha_present(img_rgba: np.ndarray) -> bool:
    if img_rgba.shape[2] < 4:
        return False
    alpha = img_rgba[:, :, 3]
    return bool((alpha < 255).any())

# ============================================================
# 6. 임베딩 기반 유사도 검사
# ============================================================
class CookieSimilarityChecker:
    """기존 쿠키들과 너무 유사한지 검사."""
    def __init__(self):
        # 실제는 transformers 의 CLIP 또는 DINOv2 사용
        # from transformers import CLIPModel, CLIPProcessor
        # self.model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
        # self.processor = CLIPProcessor.from_pretrained(...)
        self.cookie_db = {}  # cookie_name -> embedding

    def _encode(self, img: Image.Image) -> np.ndarray:
        # Mock: 64-d 임베딩 (실제는 CLIP 출력)
        arr = np.array(img.convert("RGB").resize((64, 64))).flatten()
        emb = arr / (np.linalg.norm(arr) + 1e-9)
        return emb[:64]

    def register(self, name: str, img: Image.Image):
        self.cookie_db[name] = self._encode(img)

    def find_most_similar(self, img: Image.Image,
                           threshold: float = 0.92) -> tuple[Optional[str], float]:
        emb = self._encode(img)
        if not self.cookie_db:
            return None, 0.0
        names = list(self.cookie_db.keys())
        embs = np.stack(list(self.cookie_db.values()))
        sims = embs @ emb
        idx = int(np.argmax(sims))
        return names[idx], float(sims[idx])

# ============================================================
# 7. 메인 검수 함수
# ============================================================
def review_cookie_sprite(image_path: str,
                          sim_checker: CookieSimilarityChecker) -> ReviewResult:
    img = Image.open(image_path)
    img_rgba = np.array(img.convert("RGBA"))
    result = ReviewResult(passed=True)

    # 1. 알파 채널
    result.has_alpha = check_alpha_present(img_rgba)
    if not result.has_alpha:
        result.issues.append("알파 채널 누락. 캐릭터 배경 투명도 처리 필요.")
        result.passed = False

    # 2. 팔레트
    match_ratio, palette_ok = check_palette(img_rgba)
    result.palette_match_ratio = match_ratio
    if not palette_ok:
        result.issues.append(
            f"팔레트 일치율 {match_ratio:.1%} < 80%. "
            f"쿠키런 톤 가이드 색상 사용 비율을 높여주세요."
        )
        result.passed = False

    # 3. 외곽 품질
    edge_score, edge_ok = check_edge_quality(img_rgba)
    result.edge_quality_score = edge_score
    if not edge_ok:
        result.warnings.append(
            f"외곽 품질 점수 {edge_score:.2f} 가 낮습니다. "
            f"jaggy edge 또는 반투명 경계 확인 필요."
        )

    # 4. 유사도
    similar_name, sim = sim_checker.find_most_similar(img)
    result.max_similarity = sim
    result.similar_to = similar_name
    if sim > 0.92:
        result.issues.append(
            f"기존 쿠키 '{similar_name}' 와 유사도 {sim:.2%}. 표절 의심."
        )
        result.passed = False
    elif sim > 0.85:
        result.warnings.append(
            f"기존 쿠키 '{similar_name}' 와 유사도 {sim:.2%}. 검토 권장."
        )

    return result

# ============================================================
# 8. 시각적 피드백 (디자이너용 오버레이)
# ============================================================
def make_feedback_overlay(img_rgba: np.ndarray, output_path: str):
    """팔레트 벗어난 픽셀을 빨갛게 표시한 오버레이 생성."""
    alpha = img_rgba[:, :, 3]
    mask = alpha > 0
    pixels_lab = rgb_to_lab(img_rgba[:, :, :3].reshape(-1, 3))
    dists = np.linalg.norm(
        pixels_lab[:, None, :] - PALETTE_LAB[None, :, :], axis=2
    )
    out_of_palette = (dists.min(axis=1) > 25.0).reshape(alpha.shape) & mask

    overlay = img_rgba.copy()
    overlay[out_of_palette] = [255, 0, 255, 255]  # magenta 표시
    Image.fromarray(overlay).save(output_path)
```

#### 트레이드오프 및 후속 질문

- **"왜 모든 걸 딥러닝으로 안 하나요?"** → 팔레트/외곽/알파는 결정론적 규칙으로 충분, 딥러닝은 비싸고 디버깅 어려움. 유사도만 임베딩 활용.
- **"임베딩 DB 가 커지면?"** → FAISS / HNSW 인덱스, daily incremental update.
- **"시즌마다 팔레트가 바뀌면?"** → 시즌별 팔레트 versioning, 시즌 ID 기반 검수 라우팅.

---

### 문제 14. 쿠키 풍 더미 이미지 생성기

**카테고리**: 생성형 AI, Stable Diffusion + LoRA, 안전성
**예상 시간**: 90분

#### 문제 설명

```
기획자가 신규 쿠키 아이디어를 브레인스토밍할 때 사용할 더미 이미지 생성 봇을
만들어라.

입력: 자연어 프롬프트 ("얼음 마법사 컨셉의 우아한 쿠키")
출력: 쿠키런 스타일의 컨셉 이미지 4장

요구사항
1. 쿠키런 IP 의 비주얼 톤 유지.
2. 부적절한 콘텐츠 필터링.
3. 이미지 생성 비용을 추적해 월 예산 한도 내로 제어.
```

#### 접근 방법

- 베이스 모델 (SDXL/Flux) + 쿠키런 스타일 LoRA
- 시스템 prompt 에 스타일 강제 + negative prompt
- 사전/사후 안전 검수 + 예산 quota

#### 풀이 코드

```python
from dataclasses import dataclass
from typing import Optional
import time, hashlib

# ============================================================
# 1. 설정
# ============================================================
STYLE_PROMPT_SUFFIX = (
    ", cookie run style, pastel colors, cute character, "
    "round silhouette, big sparkly eyes, soft lighting, "
    "fantasy game illustration, official art"
)
NEGATIVE_PROMPT = (
    "realistic, photorealistic, dark, horror, scary, gore, blood, "
    "nsfw, nudity, weapons, violence, low quality, blurry, "
    "deformed, ugly, watermark, signature"
)
BLOCKED_KEYWORDS = [
    # 부적절 키워드 (실제 운영 시 외부 dictionary)
    "nude", "naked", "violence", "blood", "gun",
    "kill", "death", "drug", "alcohol",
]

# ============================================================
# 2. 결과 dataclass
# ============================================================
@dataclass
class GenerationResult:
    prompt: str
    images: list[str]      # 파일 경로 또는 URL
    blocked: bool
    reason: Optional[str] = None
    cost_usd: float = 0.0
    seed_used: list[int] = None

# ============================================================
# 3. 입력 안전 검사 (사전)
# ============================================================
def check_input_safety(prompt: str) -> tuple[bool, Optional[str]]:
    lower = prompt.lower()
    for kw in BLOCKED_KEYWORDS:
        if kw in lower:
            return False, f"부적절한 키워드 감지: {kw}"
    if len(prompt) > 500:
        return False, "프롬프트가 너무 깁니다 (500자 제한)"
    return True, None

# ============================================================
# 4. 예산 관리
# ============================================================
class BudgetManager:
    """월별 예산 추적"""
    def __init__(self, monthly_limit_usd: float = 1000.0,
                 cost_per_image: float = 0.04):
        self.monthly_limit = monthly_limit_usd
        self.cost_per_image = cost_per_image
        self.usage = {}  # {(year, month, user_id): cost}

    def can_generate(self, user_id: str, n_images: int) -> tuple[bool, float]:
        from datetime import datetime
        now = datetime.now()
        key = (now.year, now.month, user_id)
        used = self.usage.get(key, 0.0)
        needed = n_images * self.cost_per_image
        # user_quota = monthly_limit / 활성 유저 수 (간단화)
        user_quota = self.monthly_limit / 20
        return (used + needed <= user_quota), needed

    def record(self, user_id: str, cost: float):
        from datetime import datetime
        now = datetime.now()
        key = (now.year, now.month, user_id)
        self.usage[key] = self.usage.get(key, 0.0) + cost

# ============================================================
# 5. 이미지 생성 백엔드 추상화
# ============================================================
class ImageGenBackend:
    """실제는 diffusers / Replicate / fal.ai API 사용"""
    def __init__(self, lora_path: Optional[str] = None):
        self.lora_path = lora_path
        # from diffusers import StableDiffusionXLPipeline
        # self.pipe = StableDiffusionXLPipeline.from_pretrained(...)
        # self.pipe.load_lora_weights(lora_path)

    def generate(self, prompt: str, negative: str, n: int = 4,
                 seed: Optional[int] = None) -> list[str]:
        # Mock: 실제는 self.pipe(prompt=..., negative_prompt=..., num_images=n)
        paths = []
        for i in range(n):
            s = seed + i if seed else int(time.time() * 1000) % 100000
            digest = hashlib.md5(f"{prompt}{s}".encode()).hexdigest()[:8]
            paths.append(f"/tmp/cookie_{digest}.png")
        return paths

# ============================================================
# 6. 사후 안전 검수
# ============================================================
class OutputSafetyChecker:
    """생성된 이미지에 부적절한 콘텐츠가 있는지 검사"""
    def __init__(self):
        # 실제는 NSFW detector 모델 (e.g. opennsfw2, transformers safety checker)
        pass

    def is_safe(self, image_path: str) -> tuple[bool, float]:
        # Mock: 90% 통과
        import random
        score = random.uniform(0, 1)
        return score > 0.1, score

# ============================================================
# 7. 메인 생성기
# ============================================================
class CookieImageGenerator:
    def __init__(self, backend: ImageGenBackend,
                 budget: BudgetManager,
                 safety: OutputSafetyChecker):
        self.backend = backend
        self.budget = budget
        self.safety = safety

    def generate(self, user_id: str, user_prompt: str,
                 n_images: int = 4) -> GenerationResult:
        # 1. 입력 안전 검사
        ok, reason = check_input_safety(user_prompt)
        if not ok:
            return GenerationResult(prompt=user_prompt, images=[],
                                    blocked=True, reason=reason)

        # 2. 예산 확인
        ok, cost = self.budget.can_generate(user_id, n_images)
        if not ok:
            return GenerationResult(prompt=user_prompt, images=[],
                                    blocked=True, reason="월 예산 한도 도달")

        # 3. 프롬프트 augmentation
        full_prompt = f"{user_prompt}{STYLE_PROMPT_SUFFIX}"

        # 4. 생성
        seed = int(time.time())
        candidates = self.backend.generate(full_prompt, NEGATIVE_PROMPT,
                                           n=n_images * 2,  # 2배 생성, 안전한 것만 선택
                                           seed=seed)

        # 5. 사후 안전 필터
        safe_images = []
        for path in candidates:
            ok, _ = self.safety.is_safe(path)
            if ok:
                safe_images.append(path)
            if len(safe_images) >= n_images:
                break

        # 6. 비용 기록
        actual_cost = len(candidates) * self.budget.cost_per_image
        self.budget.record(user_id, actual_cost)

        if len(safe_images) < n_images:
            return GenerationResult(
                prompt=full_prompt, images=safe_images,
                blocked=False,
                reason=f"안전 필터 후 {len(safe_images)}장만 사용 가능",
                cost_usd=actual_cost,
                seed_used=[seed + i for i in range(len(candidates))],
            )

        return GenerationResult(
            prompt=full_prompt, images=safe_images[:n_images],
            blocked=False, cost_usd=actual_cost,
            seed_used=[seed + i for i in range(n_images)],
        )

# ============================================================
# 8. 사용
# ============================================================
generator = CookieImageGenerator(
    backend=ImageGenBackend(lora_path="cookie_run_style_v2.safetensors"),
    budget=BudgetManager(monthly_limit_usd=1000),
    safety=OutputSafetyChecker(),
)

result = generator.generate("user_42", "얼음 마법사 컨셉의 우아한 쿠키", n_images=4)
print(f"Blocked: {result.blocked}, Images: {len(result.images)}, "
      f"Cost: ${result.cost_usd:.3f}")
```

#### 트레이드오프 및 후속 질문

- **"왜 일반 SD 가 아닌 LoRA 가 필요?"** → 일반 SD 는 쿠키런 스타일을 모름. LoRA 로 적은 데이터로 스타일만 학습 → 베이스 모델 그대로 보존하면서 스타일 강제.
- **"기획자가 '톤이 안 맞는다' 하면?"** → 톤 평가 reward model 학습 → DPO 또는 새 LoRA 학습. RLHF 의 lite 버전.
- **"안전 필터의 FN(놓침) 위험?"** → 다중 필터 (NSFW classifier + LLM-based content review + 사람 샘플링 검수).

---

## G. A/B 테스트 / 실험 분석

---

### 문제 15. 신규 결제 UI A/B 테스트 분석

**카테고리**: 통계, A/B 테스트, Segment 분석
**예상 시간**: 90분

#### 문제 설명

```
'결제 화면 리뉴얼' 실험을 2주간 진행했다. 다음 데이터를 분석하라.

users.csv: user_id, group(A/B), country, level, install_date
events.csv: user_id, event_name, ts, amount_krw

1. 그룹 간 결제 전환율과 ARPU 가 유의미하게 다른지 검정.
2. 국가별/레벨별 segment 분석.
3. Novelty effect 가 있는지 (시간 흐름에 따라 효과 변화).
4. 최종적으로 B 안 출시 여부를 권고하고 근거 작성.
```

#### 접근 방법

- **전환율**: z-test for proportions
- **ARPU**: zero-inflated long-tail → Welch's t-test 부적절, **Mann-Whitney U** 또는 **bootstrap**
- **Segment**: Simpson's paradox 주의, 다중 비교 보정 (Bonferroni / FDR)
- **Novelty**: 일별 효과 시계열 회귀

#### 풀이 코드

```python
import numpy as np
import pandas as pd
from scipy import stats
import matplotlib.pyplot as plt

# ============================================================
# 1. 데이터 로드 + 유저별 ARPU 계산
# ============================================================
users = pd.read_csv("users.csv", parse_dates=["install_date"])
events = pd.read_csv("events.csv", parse_dates=["ts"])

# 결제만 추출
purchases = events[events["event_name"] == "purchase"].copy()
arpu = purchases.groupby("user_id")["amount_krw"].sum()

df = users.merge(arpu.rename("revenue"), on="user_id", how="left")
df["revenue"] = df["revenue"].fillna(0)
df["paid"] = (df["revenue"] > 0).astype(int)

print(f"A 그룹: {(df['group']=='A').sum()}명, B 그룹: {(df['group']=='B').sum()}명")
print(f"A 전환율: {df[df['group']=='A']['paid'].mean():.4f}, "
      f"B 전환율: {df[df['group']=='B']['paid'].mean():.4f}")

# ============================================================
# 2. 전환율 검정 (Z-test)
# ============================================================
def conversion_test(df, group_col="group"):
    a = df[df[group_col] == "A"]["paid"]
    b = df[df[group_col] == "B"]["paid"]
    n_a, n_b = len(a), len(b)
    p_a, p_b = a.mean(), b.mean()
    p_pool = (a.sum() + b.sum()) / (n_a + n_b)
    se = np.sqrt(p_pool * (1 - p_pool) * (1/n_a + 1/n_b))
    z = (p_b - p_a) / se
    p_value = 2 * (1 - stats.norm.cdf(abs(z)))
    lift = (p_b - p_a) / p_a
    # 95% 신뢰구간
    se_diff = np.sqrt(p_a*(1-p_a)/n_a + p_b*(1-p_b)/n_b)
    ci_low = (p_b - p_a) - 1.96 * se_diff
    ci_high = (p_b - p_a) + 1.96 * se_diff
    return {
        "p_a": p_a, "p_b": p_b, "lift_pct": lift * 100,
        "z": z, "p_value": p_value,
        "ci_95": (ci_low, ci_high),
    }

conv_result = conversion_test(df)
print("\n[전환율 검정]")
for k, v in conv_result.items():
    print(f"  {k}: {v}")

# ============================================================
# 3. ARPU 검정 (Bootstrap)
# ============================================================
def bootstrap_arpu_test(df, n_iter=5000, seed=42):
    rng = np.random.default_rng(seed)
    a = df[df["group"] == "A"]["revenue"].values
    b = df[df["group"] == "B"]["revenue"].values
    obs_diff = b.mean() - a.mean()

    # Permutation-based p-value
    combined = np.concatenate([a, b])
    n_a = len(a)
    null_diffs = []
    for _ in range(n_iter):
        rng.shuffle(combined)
        null_diffs.append(combined[n_a:].mean() - combined[:n_a].mean())
    null_diffs = np.array(null_diffs)
    p_value = (np.abs(null_diffs) >= abs(obs_diff)).mean()

    # Bootstrap CI for diff
    boot_diffs = []
    for _ in range(n_iter):
        sa = rng.choice(a, size=len(a), replace=True)
        sb = rng.choice(b, size=len(b), replace=True)
        boot_diffs.append(sb.mean() - sa.mean())
    ci = np.percentile(boot_diffs, [2.5, 97.5])
    return {
        "arpu_a": a.mean(), "arpu_b": b.mean(),
        "diff": obs_diff, "p_value": p_value,
        "ci_95": tuple(ci),
    }

arpu_result = bootstrap_arpu_test(df)
print("\n[ARPU 검정 (Bootstrap)]")
for k, v in arpu_result.items():
    print(f"  {k}: {v}")

# ============================================================
# 4. Segment 분석 (다중 비교 보정 포함)
# ============================================================
from statsmodels.stats.multitest import multipletests

def segment_analysis(df, segment_col):
    results = []
    for seg in df[segment_col].unique():
        sub = df[df[segment_col] == seg]
        if (sub["group"] == "A").sum() < 30 or (sub["group"] == "B").sum() < 30:
            continue
        r = conversion_test(sub)
        results.append({
            "segment": seg,
            "n_a": (sub["group"] == "A").sum(),
            "n_b": (sub["group"] == "B").sum(),
            "lift_pct": r["lift_pct"],
            "p_value": r["p_value"],
        })
    res_df = pd.DataFrame(results)
    if len(res_df):
        # Benjamini-Hochberg FDR 보정
        _, p_corrected, _, _ = multipletests(res_df["p_value"], alpha=0.05, method="fdr_bh")
        res_df["p_corrected"] = p_corrected
        res_df["significant_after_correction"] = p_corrected < 0.05
    return res_df.sort_values("p_value")

print("\n[국가별 segment 분석]")
print(segment_analysis(df, "country"))

# 레벨 구간화 후 segment
df["level_bucket"] = pd.cut(df["level"], bins=[0, 10, 30, 60, 100, 999],
                             labels=["1-10", "11-30", "31-60", "61-100", "100+"])
print("\n[레벨 구간별 segment 분석]")
print(segment_analysis(df, "level_bucket"))

# ============================================================
# 5. Novelty Effect 분석
# ============================================================
def novelty_check(df, events_df):
    purchases = events_df[events_df["event_name"] == "purchase"].copy()
    purchases["date"] = purchases["ts"].dt.date
    daily = purchases.merge(df[["user_id", "group"]], on="user_id")
    daily_revenue = daily.groupby(["date", "group"])["amount_krw"].sum().reset_index()
    pivot = daily_revenue.pivot(index="date", columns="group", values="amount_krw").fillna(0)
    pivot["lift"] = (pivot["B"] - pivot["A"]) / pivot["A"].replace(0, np.nan)

    # 선형회귀로 시간에 따른 lift 변화 추세
    pivot = pivot.dropna()
    x = np.arange(len(pivot))
    slope, intercept, r, p, _ = stats.linregress(x, pivot["lift"].values)
    return {
        "daily_lift": pivot,
        "trend_slope": slope,
        "trend_p_value": p,
        "novelty_detected": p < 0.05 and slope < 0,  # 시간 따라 lift 감소
    }

nov = novelty_check(df, events)
print(f"\n[Novelty effect]")
print(f"  Trend slope: {nov['trend_slope']:.4f} (p={nov['trend_p_value']:.4f})")
print(f"  Detected: {nov['novelty_detected']}")

# ============================================================
# 6. 최종 권고 보고서 생성
# ============================================================
def make_recommendation(conv, arpu, novelty):
    lines = []
    lines.append("## A/B 테스트 결과 요약")
    lines.append(f"- 전환율 lift: {conv['lift_pct']:+.2f}% (p={conv['p_value']:.4f})")
    lines.append(f"  - 95% CI: [{conv['ci_95'][0]*100:.2f}, {conv['ci_95'][1]*100:.2f}]pp")
    lines.append(f"- ARPU diff: {arpu['diff']:+.0f} KRW (p={arpu['p_value']:.4f})")
    lines.append(f"  - 95% CI: [{arpu['ci_95'][0]:.0f}, {arpu['ci_95'][1]:.0f}] KRW")
    lines.append("")

    significant = conv['p_value'] < 0.05 and conv['lift_pct'] > 0
    if novelty["novelty_detected"]:
        lines.append("⚠️ Novelty effect 감지 — 시간이 지나며 효과 감소 추세.")
        lines.append("   장기 효과 검증 필요. 단기 출시 보류 권고.")
    elif significant:
        lines.append("✅ B 안 출시 권고. 통계적/실무적 유의성 모두 충족.")
    else:
        lines.append("❌ B 안 출시 보류 — 유의미한 개선 없음.")
    return "\n".join(lines)

print("\n" + make_recommendation(conv_result, arpu_result, nov))
```

#### 트레이드오프 및 후속 질문

- **"왜 t-test 아닌 bootstrap?"** → ARPU 가 zero-inflated long-tail 분포 → 정규성 가정 위배 → 비모수적 검정이 안전.
- **"유의 안 나오면 표본 더 모아도 되나?"** → **peeking problem**. 사전에 검정력 분석으로 표본 크기 정해야. 또는 sequential testing 적용.
- **"일부 segment 에선 음수 lift?"** → 해당 segment 만 A 안 유지하거나, segment-aware rollout. Simpson's paradox 가능성 확인.

---

## H. MLOps / 시스템 설계

---

### 문제 16. 매크로 탐지 모델 서빙 시스템 설계

**카테고리**: MLOps, 시스템 설계, 모니터링
**예상 시간**: 90분 (코드 + 다이어그램)

#### 문제 설명

```
이미 학습된 매크로 탐지 모델(LightGBM, 8MB)을 운영에 배포하려 한다.

요구사항
1. 평균 응답 50ms 이내, 99p 200ms.
2. 일 1억 추론, 피크 시간 초당 5,000건.
3. 모델 버전 관리 + canary 배포 지원.
4. 입력 feature 가 50개, 일부는 실시간 계산 (최근 5분 이벤트 집계).
5. 모델 성능 모니터링 (data drift, prediction drift).

전체 아키텍처를 설계하고, 핵심 코드를 작성하라.
```

#### 접근 방법

```
[Client] → [API Gateway] → [FastAPI 추론 서버]
                                ↓
              [Feature Store: Redis (실시간) + DB (정적)]
                                ↓
                      [Model Registry (S3)]
                                ↓
              [Prometheus + Grafana 모니터링]
```

- **Feature 캐싱**: 실시간 feature 는 Redis, 정적은 PostgreSQL
- **모델 버전**: weighted traffic split (10% → 50% → 100% canary)
- **모니터링**: PSI (Population Stability Index) 로 drift 감지

#### 풀이 코드

```python
import hashlib
import time
from dataclasses import dataclass
from typing import Optional
import numpy as np
import lightgbm as lgb
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import redis.asyncio as aioredis
from prometheus_client import Counter, Histogram, Gauge

# ============================================================
# 1. 요청/응답 스키마
# ============================================================
class InferenceRequest(BaseModel):
    user_id: str
    session_id: str
    static_features: dict       # 50개 중 정적인 것

class InferenceResponse(BaseModel):
    user_id: str
    macro_score: float
    action: str
    model_version: str
    latency_ms: float

# ============================================================
# 2. Prometheus metrics
# ============================================================
REQ_COUNTER = Counter("inference_requests_total",
                      "Total inference requests", ["model_version", "status"])
LATENCY = Histogram("inference_latency_seconds",
                    "Inference latency", ["model_version"])
PREDICTION_GAUGE = Gauge("prediction_score_mean",
                         "Mean prediction score", ["model_version"])
FEATURE_DRIFT = Gauge("feature_drift_psi",
                      "Feature PSI", ["feature_name"])

# ============================================================
# 3. Feature Store
# ============================================================
class FeatureStore:
    def __init__(self, redis_url: str):
        self.redis = aioredis.from_url(redis_url, decode_responses=True)

    async def get_realtime_features(self, user_id: str) -> dict:
        """최근 5분 이벤트 집계 결과 조회. 별도 streaming job 이 채워둠."""
        key = f"rt:user:{user_id}"
        data = await self.redis.hgetall(key)
        defaults = {
            "input_interval_mean_5m": 0.5,
            "input_interval_std_5m": 0.1,
            "click_per_min_5m": 60.0,
            "session_duration_min": 0.0,
        }
        return {k: float(data.get(k, defaults[k])) for k in defaults}

# ============================================================
# 4. Model Registry + Canary Deployment
# ============================================================
@dataclass
class ModelEntry:
    version: str
    model: lgb.Booster
    traffic_weight: float
    is_canary: bool

class ModelRegistry:
    def __init__(self):
        self.entries: dict[str, ModelEntry] = {}
        self.default_version: Optional[str] = None

    def register(self, version: str, model_path: str,
                 traffic_weight: float = 1.0, is_canary: bool = False):
        model = lgb.Booster(model_file=model_path)
        self.entries[version] = ModelEntry(version, model, traffic_weight, is_canary)
        if not is_canary:
            self.default_version = version

    def select_version(self, user_id: str) -> str:
        """User ID hash 기반 일관된 트래픽 분배 (sticky)."""
        canaries = [e for e in self.entries.values() if e.is_canary]
        if not canaries:
            return self.default_version

        h = int(hashlib.md5(user_id.encode()).hexdigest(), 16) % 10000
        bucket = h / 10000
        cumulative = 0.0
        for c in canaries:
            cumulative += c.traffic_weight
            if bucket < cumulative:
                return c.version
        return self.default_version

    def rollback(self):
        """Canary 들 제거, default 로 복귀."""
        self.entries = {v: e for v, e in self.entries.items() if not e.is_canary}

# ============================================================
# 5. Drift Monitor
# ============================================================
class DriftMonitor:
    """Population Stability Index 로 feature drift 감지."""
    def __init__(self, baseline_quantiles: dict[str, np.ndarray]):
        self.baseline_quantiles = baseline_quantiles
        self.recent_buffer = {f: [] for f in baseline_quantiles}
        self.buffer_size = 10000

    def update(self, features: dict):
        for k, v in features.items():
            if k in self.recent_buffer:
                self.recent_buffer[k].append(v)
                if len(self.recent_buffer[k]) > self.buffer_size:
                    self.recent_buffer[k].pop(0)

    def compute_psi(self) -> dict[str, float]:
        results = {}
        for feat, bins in self.baseline_quantiles.items():
            if len(self.recent_buffer[feat]) < 100:
                continue
            recent = np.array(self.recent_buffer[feat])
            base_freq = np.histogram(
                np.linspace(bins[0], bins[-1], 1000), bins=bins
            )[0] / 999
            rec_freq, _ = np.histogram(recent, bins=bins)
            rec_freq = rec_freq / rec_freq.sum()
            psi = np.sum(
                (rec_freq - base_freq) * np.log(
                    (rec_freq + 1e-6) / (base_freq + 1e-6)
                )
            )
            results[feat] = float(psi)
            FEATURE_DRIFT.labels(feature_name=feat).set(psi)
        return results

# ============================================================
# 6. 메인 추론 서버
# ============================================================
app = FastAPI()
feature_store = FeatureStore(redis_url="redis://localhost:6379")
registry = ModelRegistry()
# 운영 모델 + canary
# registry.register("v1.0.0", "models/macro_v1.txt", traffic_weight=0.9)
# registry.register("v1.1.0-canary", "models/macro_v1_1.txt",
#                   traffic_weight=0.1, is_canary=True)

drift_monitor = DriftMonitor(baseline_quantiles={
    "input_interval_mean_5m": np.array([0, .1, .2, .3, .4, .5, .6, .7, .8, .9, 1.5]),
})

THRESHOLD_BLOCK = 0.92
THRESHOLD_REVIEW = 0.7

@app.post("/predict", response_model=InferenceResponse)
async def predict(req: InferenceRequest):
    start = time.perf_counter()

    version = registry.select_version(req.user_id)
    entry = registry.entries[version]

    try:
        rt_features = await feature_store.get_realtime_features(req.user_id)
    except Exception:
        REQ_COUNTER.labels(version, "feature_error").inc()
        raise HTTPException(status_code=503, detail="feature store unavailable")

    all_features = {**req.static_features, **rt_features}
    drift_monitor.update(all_features)

    feature_order = entry.model.feature_name()
    X = np.array([[all_features.get(f, 0.0) for f in feature_order]])
    score = float(entry.model.predict(X)[0])

    if score >= THRESHOLD_BLOCK:
        action = "auto_block"
    elif score >= THRESHOLD_REVIEW:
        action = "manual_review"
    else:
        action = "ok"

    latency = time.perf_counter() - start
    LATENCY.labels(version).observe(latency)
    PREDICTION_GAUGE.labels(version).set(score)
    REQ_COUNTER.labels(version, "ok").inc()

    return InferenceResponse(
        user_id=req.user_id, macro_score=score, action=action,
        model_version=version, latency_ms=latency * 1000,
    )

# ============================================================
# 7. 운영용 엔드포인트
# ============================================================
@app.post("/admin/canary/promote/{version}")
async def promote_canary(version: str):
    if version not in registry.entries:
        raise HTTPException(404, "version not found")
    registry.entries[version].is_canary = False
    registry.entries[version].traffic_weight = 1.0
    registry.default_version = version
    for v, e in registry.entries.items():
        if v != version:
            e.traffic_weight = 0.0
    return {"new_default": version}

@app.post("/admin/canary/rollback")
async def rollback():
    registry.rollback()
    return {"status": "rolled_back", "default": registry.default_version}

@app.get("/admin/drift")
async def get_drift():
    return drift_monitor.compute_psi()

@app.get("/health")
async def health():
    return {"status": "ok", "default_version": registry.default_version}
```

#### 트레이드오프 및 후속 질문

- **"50ms 안에 들어가려면 어디가 병목?"** → Feature store 조회(네트워크 IO) > 모델 추론 > 직렬화. Redis 콜로케이션, connection pool 필수.
- **"모델이 8GB 라면?"** → GPU 서빙 (Triton), batching, INT8 quantization, distillation.
- **"갑자기 모든 예측이 0 으로 쏠리면?"** → input drift 인지 모델 버그인지 구분 → 자동 rollback 트리거.

---

### 문제 17. 실시간 학습 데이터 라벨링 파이프라인

**카테고리**: MLOps, Active Learning, HITL
**예상 시간**: 90분

#### 문제 설명

```
유저 채팅 메시지에서 욕설 검출 모델을 *지속적으로* 개선하려 한다.

요구사항
1. 매일 1,000건의 신규 라벨링 데이터를 효율적으로 확보.
2. 사람 라벨러의 부담 최소화: 모델이 "헷갈리는" 케이스만 라벨링.
3. 라벨링된 데이터로 자동 재학습 → A/B 테스트 → 자동 배포 파이프라인.
```

#### 접근 방법

- **Active Learning**: uncertainty (confidence 0.4~0.6) 케이스 우선 추출
- **Inter-Annotator Agreement**: 같은 메시지를 2~3명에게 → consensus
- **Auto-Retraining**: nightly job, regression test 통과 시 canary 배포

#### 풀이 코드

```python
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional
from datetime import datetime
from collections import Counter
import numpy as np

# ============================================================
# 1. 데이터 모델
# ============================================================
class LabelStatus(Enum):
    PENDING = "pending"
    IN_REVIEW = "in_review"
    CONSENSUS = "consensus"
    DISAGREEMENT = "disagreement"

@dataclass
class SampleForLabeling:
    sample_id: str
    text: str
    model_prediction: dict
    model_confidence: float
    uncertainty_score: float
    captured_at: datetime
    annotations: list[dict] = field(default_factory=list)
    final_label: Optional[str] = None
    status: LabelStatus = LabelStatus.PENDING

# ============================================================
# 2. Active Learning Sampler
# ============================================================
class ActiveLearningSampler:
    def uncertainty(self, prediction: dict) -> float:
        """Entropy 기반. 분포가 평평할수록 높음."""
        probs = np.array(list(prediction.values()))
        probs = probs / probs.sum()
        return float(-np.sum(probs * np.log(probs + 1e-9)))

    def margin(self, prediction: dict) -> float:
        """Top1 - Top2 차이. 작을수록 uncertain."""
        probs = sorted(prediction.values(), reverse=True)
        if len(probs) < 2:
            return 1.0
        return probs[0] - probs[1]

    def sample(self, candidates: list[dict], k: int = 1000,
               strategy: str = "hybrid") -> list[dict]:
        scored = []
        for c in candidates:
            pred = c["model_prediction"]
            ent = self.uncertainty(pred)
            margin = self.margin(pred)
            if strategy == "entropy":
                score = ent
            elif strategy == "margin":
                score = -margin
            else:
                score = ent * 0.7 + (-margin) * 0.3
            scored.append((score, c))
        scored.sort(key=lambda x: -x[0])

        # 카테고리별 quota (stratified)
        per_cat = k // 4
        result = []
        cat_counts = {}
        for _, c in scored:
            top_cat = max(c["model_prediction"], key=c["model_prediction"].get)
            if cat_counts.get(top_cat, 0) < per_cat:
                result.append(c)
                cat_counts[top_cat] = cat_counts.get(top_cat, 0) + 1
            if len(result) >= k:
                break
        return result

# ============================================================
# 3. 라벨링 큐
# ============================================================
class LabelingQueue:
    def __init__(self):
        self.db: dict[str, SampleForLabeling] = {}

    def push(self, sample: SampleForLabeling):
        self.db[sample.sample_id] = sample

    def get_pending(self, labeler_id: str, n: int = 10):
        result = []
        for s in self.db.values():
            if s.status in (LabelStatus.PENDING, LabelStatus.IN_REVIEW):
                annotated = {a["labeler_id"] for a in s.annotations}
                if labeler_id not in annotated:
                    result.append(s)
                if len(result) >= n:
                    break
        return result

    def submit_annotation(self, sample_id: str, labeler_id: str,
                          label: str, time_spent_sec: float):
        sample = self.db[sample_id]
        sample.annotations.append({
            "labeler_id": labeler_id,
            "label": label,
            "submitted_at": datetime.now(),
            "time_spent_sec": time_spent_sec,
        })
        sample.status = LabelStatus.IN_REVIEW
        self._try_consensus(sample)

    def _try_consensus(self, sample: SampleForLabeling, min_annotators: int = 2):
        if len(sample.annotations) < min_annotators:
            return
        labels = [a["label"] for a in sample.annotations]
        cnt = Counter(labels)
        most_common, freq = cnt.most_common(1)[0]
        if freq / len(labels) >= 0.66:
            sample.final_label = most_common
            sample.status = LabelStatus.CONSENSUS
        elif len(sample.annotations) >= 3:
            sample.status = LabelStatus.DISAGREEMENT

# ============================================================
# 4. Auto-Retrain Pipeline
# ============================================================
class AutoRetrainer:
    def __init__(self, current_model_metrics: dict,
                 promotion_threshold: float = 0.003,
                 shadow_threshold: float = 0.001):
        self.current = current_model_metrics
        self.promotion_threshold = promotion_threshold
        self.shadow_threshold = shadow_threshold

    def train_and_evaluate(self, new_data, holdout, regression_set):
        """
        1. 신규 + 기존 데이터로 새 모델 학습
        2. holdout 에서 평가
        3. regression_set: 이전에 잘 맞히던 케이스 → 회귀 검증
        """
        # 실제 학습 로직 ...
        new_metrics = {
            "auc": 0.93,
            "precision": 0.91,
            "recall": 0.88,
            "regression_pass_rate": 0.995,
        }
        return new_metrics

    def should_promote(self, new_metrics: dict) -> tuple[bool, str]:
        if new_metrics["regression_pass_rate"] < 0.99:
            return False, "regression_failed"

        delta_auc = new_metrics["auc"] - self.current["auc"]
        if delta_auc >= self.promotion_threshold:
            return True, "canary_deploy"
        if delta_auc >= self.shadow_threshold:
            return True, "shadow_mode"
        return False, "no_improvement"

# ============================================================
# 5. 전체 파이프라인
# ============================================================
class LabelingPipeline:
    def __init__(self, sampler, queue, retrainer,
                 daily_sample_count: int = 1000):
        self.sampler = sampler
        self.queue = queue
        self.retrainer = retrainer
        self.daily_sample_count = daily_sample_count

    def daily_collection_job(self, all_recent_predictions):
        """매일 새벽 실행."""
        selected = self.sampler.sample(
            all_recent_predictions, k=self.daily_sample_count
        )
        for c in selected:
            sample = SampleForLabeling(
                sample_id=c["sample_id"],
                text=c["text"],
                model_prediction=c["model_prediction"],
                model_confidence=max(c["model_prediction"].values()),
                uncertainty_score=self.sampler.uncertainty(c["model_prediction"]),
                captured_at=datetime.now(),
            )
            self.queue.push(sample)
        return len(selected)

    def weekly_retrain_job(self, holdout, regression_set):
        consensus_samples = [
            s for s in self.queue.db.values()
            if s.status == LabelStatus.CONSENSUS
        ]
        if len(consensus_samples) < 100:
            return {"skipped": True, "reason": "too few labels"}

        new_data = [(s.text, s.final_label) for s in consensus_samples]
        metrics = self.retrainer.train_and_evaluate(
            new_data, holdout, regression_set
        )
        ok, action = self.retrainer.should_promote(metrics)
        return {
            "skipped": False,
            "metrics": metrics,
            "action": action,
            "training_size": len(new_data),
        }

# ============================================================
# 6. 사용
# ============================================================
sampler = ActiveLearningSampler()
queue = LabelingQueue()
retrainer = AutoRetrainer(current_model_metrics={"auc": 0.91})
pipeline = LabelingPipeline(sampler, queue, retrainer)

recent_predictions = [
    {"sample_id": f"S{i}", "text": f"msg {i}",
     "model_prediction": {
         "normal": 0.4 + np.random.rand() * 0.2,
         "profanity": 0.3 + np.random.rand() * 0.2,
         "spam": 0.2, "pii": 0.1
     }} for i in range(10000)
]
n_pushed = pipeline.daily_collection_job(recent_predictions)
print(f"라벨링 큐에 {n_pushed}개 추가")
```

#### 트레이드오프 및 후속 질문

- **"라벨러 의견 갈리는 케이스?"** → label aggregation (Dawid-Skene 모델), 또는 시니어 라벨러 검토.
- **"특정 카테고리만 큐에 들어오면?"** → stratified sampling (카테고리별 quota), 또는 category-aware uncertainty.
- **"새 모델 일부 영역에서 성능 후퇴?"** → regression_set 통과율 99% 미만 시 자동 차단 + slack 알람.

---

## I. 데이터 엔지니어링 + ML

---

### 문제 18. 게임 이벤트 로그 funnel 분석

**카테고리**: 데이터 엔지니어링, SQL/DataFrame, 대용량 처리
**예상 시간**: 60분

#### 문제 설명

```
events.parquet 에 일 10억 건의 이벤트가 들어온다. 컬럼은
(user_id, event_name, ts, props_json).

다음 funnel 분석을 30초 이내에 끝내는 스크립트를 작성하라.

funnel 정의:
  app_open → tutorial_start → tutorial_complete → first_battle → first_purchase

요구사항
1. 단계별 전환율과 평균 소요 시간.
2. 단계별로 가장 많이 이탈하는 segment (국가, 기기, 광고 채널) Top 5.
3. 7일 이내에 funnel 을 완주한 유저 비율.
```

#### 접근 방법

- 10억 건이면 pandas 메모리 부족 → **DuckDB** 또는 **Polars** 사용
- DuckDB 는 SQL 표현력 + Parquet 직접 읽기 + columnar 처리로 매우 빠름
- Funnel = "각 user 의 첫 번째 발생 시각이 순서대로 존재하는가"

#### 풀이 코드

```python
import duckdb
import pandas as pd

# ============================================================
# 1. DuckDB 세션 시작
# ============================================================
con = duckdb.connect()
# Parquet 직접 쿼리 가능, 메모리 적재 X
con.execute("""
    CREATE OR REPLACE VIEW events AS
    SELECT * FROM read_parquet('events.parquet')
""")

# 분석 대상 funnel 단계
FUNNEL = [
    "app_open",
    "tutorial_start",
    "tutorial_complete",
    "first_battle",
    "first_purchase",
]

# ============================================================
# 2. 각 user 의 단계별 첫 발생 시각 추출
# ============================================================
# pivot 형태: user_id, first_app_open_ts, first_tutorial_start_ts, ...
first_event_sql = f"""
    SELECT
        user_id,
        {", ".join(f"MIN(CASE WHEN event_name = '{e}' THEN ts END) AS first_{e}_ts"
                   for e in FUNNEL)}
    FROM events
    GROUP BY user_id
"""
con.execute(f"CREATE OR REPLACE TABLE user_funnel AS {first_event_sql}")

# ============================================================
# 3. 단계별 전환율
# ============================================================
print("=== 단계별 전환율 ===")
prev_count = None
for i, step in enumerate(FUNNEL):
    if i == 0:
        # 첫 단계: 해당 이벤트 발생한 user 수
        q = f"""SELECT COUNT(*) AS n FROM user_funnel
                WHERE first_{step}_ts IS NOT NULL"""
    else:
        # i단계는 i-1단계 이후 발생 + 순서 보장
        prev_step = FUNNEL[i-1]
        q = f"""SELECT COUNT(*) AS n FROM user_funnel
                WHERE first_{step}_ts IS NOT NULL
                  AND first_{step}_ts >= first_{prev_step}_ts"""
    n = con.execute(q).fetchone()[0]
    rate = n / prev_count if prev_count else 1.0
    print(f"  {i+1}. {step}: {n:>12,} 명 (전 단계 대비 {rate:.2%})")
    prev_count = n

# ============================================================
# 4. 단계별 평균 소요 시간
# ============================================================
print("\n=== 단계간 평균 소요 시간 (분) ===")
for i in range(1, len(FUNNEL)):
    prev_step = FUNNEL[i-1]
    step = FUNNEL[i]
    q = f"""
        SELECT AVG(EXTRACT(EPOCH FROM (first_{step}_ts - first_{prev_step}_ts)) / 60)
                AS avg_min,
               MEDIAN(EXTRACT(EPOCH FROM (first_{step}_ts - first_{prev_step}_ts)) / 60)
                AS p50_min
        FROM user_funnel
        WHERE first_{step}_ts IS NOT NULL
          AND first_{prev_step}_ts IS NOT NULL
          AND first_{step}_ts >= first_{prev_step}_ts
    """
    avg, p50 = con.execute(q).fetchone()
    print(f"  {prev_step} → {step}: 평균 {avg:.1f}분, 중앙값 {p50:.1f}분")

# ============================================================
# 5. 7일 이내 완주 비율
# ============================================================
last_step = FUNNEL[-1]
first_step = FUNNEL[0]
q = f"""
    SELECT
        COUNT(*) FILTER (
            WHERE first_{last_step}_ts IS NOT NULL
              AND first_{last_step}_ts <= first_{first_step}_ts + INTERVAL '7' DAY
        ) * 1.0 / COUNT(*) FILTER (WHERE first_{first_step}_ts IS NOT NULL)
        AS rate
    FROM user_funnel
"""
rate = con.execute(q).fetchone()[0]
print(f"\n=== 7일 이내 funnel 완주율: {rate:.2%} ===")

# ============================================================
# 6. 이탈 segment 분석
# ============================================================
# user 메타 정보 (별도 테이블)
con.execute("""
    CREATE OR REPLACE VIEW users AS
    SELECT * FROM read_parquet('users.parquet')
""")

print("\n=== 단계별 이탈 segment Top 5 ===")
for i in range(1, len(FUNNEL)):
    prev_step = FUNNEL[i-1]
    step = FUNNEL[i]
    # "이전 단계는 했지만 다음 단계는 안 한" user 들의 segment 분포
    q = f"""
        WITH dropouts AS (
            SELECT u.country, u.device_tier, u.ad_network
            FROM user_funnel f
            JOIN users u USING(user_id)
            WHERE f.first_{prev_step}_ts IS NOT NULL
              AND f.first_{step}_ts IS NULL
        )
        SELECT country, COUNT(*) AS n
        FROM dropouts
        GROUP BY country
        ORDER BY n DESC
        LIMIT 5
    """
    print(f"\n[{prev_step} → {step}] 이탈 국가 Top 5:")
    df_seg = con.execute(q).fetchdf()
    print(df_seg.to_string(index=False))

# ============================================================
# 7. 결과 캐싱 (대시보드용)
# ============================================================
# 자주 보는 결과는 별도 파일로
con.execute("""
    COPY (
        SELECT * FROM user_funnel
    ) TO 'cache/user_funnel.parquet' (FORMAT PARQUET, COMPRESSION ZSTD)
""")

con.close()
```

#### 트레이드오프 및 후속 질문

- **"왜 pandas 안 쓰나요?"** → 10억 건 = 약 100GB+. pandas 는 메모리 적재 필요. DuckDB 는 OOC(out-of-core) + columnar + 압축 parquet 직접 쿼리.
- **"실시간 funnel 대시보드?"** → streaming aggregation (Kafka + Flink), pre-aggregated daily snapshot 테이블.
- **"funnel 정의가 자주 바뀌면?"** → SQL 을 코드로 동적 생성하거나 funnel 정의를 외부 YAML 로 관리.

---

## J. 클러스터링 / 세그멘테이션

---

### 문제 19. 쿠키런 유저 페르소나 클러스터링

**카테고리**: 비지도 학습, 차원축소, 시각화
**예상 시간**: 90분

#### 문제 설명

```
마케팅팀은 유저를 5~8개의 페르소나로 분류해 캠페인을 차별화하고 싶다.

데이터: users.csv 에 행동 지표 30개 (일평균 플레이 시간, 결제액, 친구 수,
PvP 빈도, 챕터 진행도 등).

요구사항
1. 클러스터링을 수행하고 각 클러스터의 특성을 자연어로 설명.
2. 클러스터 수를 결정하는 근거 제시.
3. 새로운 유저가 들어왔을 때 어떤 페르소나에 배정할지 함수 작성.
4. 마케팅팀이 이해할 수 있는 시각화.
```

#### 접근 방법

- 스케일링: 결제액 같은 long-tail 은 log1p 후 StandardScaler
- 클러스터 수: K-means + silhouette score + elbow + 마케팅 활용성
- 시각화: UMAP 2D + cluster centroid 프로파일 레이더 차트

#### 풀이 코드

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.decomposition import PCA

# ============================================================
# 1. 데이터 로드 + 전처리
# ============================================================
df = pd.read_csv("users.csv")
print(f"유저 수: {len(df)}, feature 수: {df.shape[1] - 1}")

# user_id 제외
feature_cols = [c for c in df.columns if c != "user_id"]

# Long-tail 변수 식별 (왜도 큰 것) → log1p
skewed = []
for c in feature_cols:
    if df[c].min() >= 0 and df[c].skew() > 2:
        skewed.append(c)
        df[c] = np.log1p(df[c])
print(f"로그 변환된 변수: {skewed}")

# 표준화
scaler = StandardScaler()
X = scaler.fit_transform(df[feature_cols])

# ============================================================
# 2. 클러스터 수 결정
# ============================================================
silhouette_scores = []
inertia = []
K_RANGE = range(3, 12)
for k in K_RANGE:
    km = KMeans(n_clusters=k, n_init=10, random_state=42)
    labels = km.fit_predict(X)
    silhouette_scores.append(silhouette_score(X, labels, sample_size=5000))
    inertia.append(km.inertia_)

# 시각화
fig, ax1 = plt.subplots(figsize=(10, 4))
ax1.plot(list(K_RANGE), silhouette_scores, "o-", color="tab:blue", label="silhouette")
ax1.set_xlabel("k"); ax1.set_ylabel("silhouette", color="tab:blue")
ax2 = ax1.twinx()
ax2.plot(list(K_RANGE), inertia, "s-", color="tab:red", label="inertia (elbow)")
ax2.set_ylabel("inertia", color="tab:red")
plt.title("Cluster number selection")
plt.savefig("k_selection.png", dpi=100, bbox_inches="tight")

# silhouette 최대 + 마케팅팀이 관리 가능한 수 (5~8) → 6 선택
BEST_K = list(K_RANGE)[int(np.argmax(silhouette_scores))]
print(f"\n선택된 K: {BEST_K} (silhouette = {max(silhouette_scores):.3f})")

# ============================================================
# 3. 최종 클러스터링
# ============================================================
final_km = KMeans(n_clusters=BEST_K, n_init=20, random_state=42)
df["cluster"] = final_km.fit_predict(X)

# ============================================================
# 4. 페르소나 자동 명명
# ============================================================
def name_persona(centroid_orig: dict, all_means: dict) -> str:
    """클러스터 평균과 전체 평균 비교로 페르소나 이름 생성."""
    # 각 feature 의 (cluster mean - overall mean) / overall std → z-like
    highlights = []
    for feat, val in centroid_orig.items():
        baseline = all_means[feat]
        ratio = (val - baseline) / (abs(baseline) + 1e-9)
        if abs(ratio) > 0.5:
            highlights.append((feat, ratio))
    highlights.sort(key=lambda x: -abs(x[1]))
    top3 = highlights[:3]
    desc_parts = []
    for feat, r in top3:
        adj = "높은" if r > 0 else "낮은"
        desc_parts.append(f"{adj} {feat}")
    return " · ".join(desc_parts)

# 원본 스케일에서 centroid 계산 (해석 위해)
df_orig = pd.read_csv("users.csv")
df_orig["cluster"] = df["cluster"]
overall_means = df_orig[feature_cols].mean().to_dict()

persona_profiles = {}
print("\n=== 페르소나 프로파일 ===")
for c in range(BEST_K):
    cluster_data = df_orig[df_orig["cluster"] == c]
    centroid = cluster_data[feature_cols].mean().to_dict()
    name = name_persona(centroid, overall_means)
    persona_profiles[c] = {
        "name": name,
        "size": len(cluster_data),
        "pct": len(cluster_data) / len(df_orig),
        "centroid": centroid,
    }
    print(f"\n[Cluster {c}] {name}")
    print(f"  규모: {len(cluster_data):,}명 ({len(cluster_data)/len(df_orig):.1%})")
    # 두드러진 지표 5개
    diffs = {f: (centroid[f] - overall_means[f]) / (abs(overall_means[f]) + 1e-9)
             for f in feature_cols}
    top = sorted(diffs.items(), key=lambda x: -abs(x[1]))[:5]
    for f, r in top:
        sign = "+" if r > 0 else ""
        print(f"    {f}: {centroid[f]:.2f} (전체 평균 대비 {sign}{r:.1%})")

# ============================================================
# 5. 시각화: 2D 임베딩
# ============================================================
# PCA (시간 제약 시) 또는 UMAP (시간 여유 시)
try:
    import umap
    reducer = umap.UMAP(n_neighbors=15, min_dist=0.1, random_state=42)
    X_2d = reducer.fit_transform(X)
    method = "UMAP"
except ImportError:
    reducer = PCA(n_components=2, random_state=42)
    X_2d = reducer.fit_transform(X)
    method = "PCA"

plt.figure(figsize=(10, 7))
for c in range(BEST_K):
    mask = df["cluster"] == c
    plt.scatter(X_2d[mask, 0], X_2d[mask, 1],
                label=f"C{c}: {persona_profiles[c]['name'][:30]}",
                alpha=0.5, s=5)
plt.legend(loc="best", fontsize=8)
plt.title(f"User Personas ({method} 2D Projection)")
plt.savefig("personas_2d.png", dpi=100, bbox_inches="tight")

# ============================================================
# 6. 신규 유저 배정 함수
# ============================================================
def assign_persona(user_features: dict) -> dict:
    """신규 유저 → 페르소나 배정."""
    # 1. 동일한 전처리
    row = pd.DataFrame([user_features])
    for c in skewed:
        if c in row:
            row[c] = np.log1p(row[c])
    X_new = scaler.transform(row[feature_cols])
    # 2. 가장 가까운 centroid
    cluster_id = int(final_km.predict(X_new)[0])
    # 3. 신뢰도 = centroid 까지 거리의 역수 (정규화)
    dists = final_km.transform(X_new)[0]
    dists_norm = dists / dists.sum()
    confidence = 1 - dists_norm[cluster_id]
    return {
        "cluster": cluster_id,
        "persona_name": persona_profiles[cluster_id]["name"],
        "confidence": float(confidence),
        "soft_assignments": {i: float(1 - d/dists.sum()) for i, d in enumerate(dists)},
    }

# 사용 예시
new_user = {c: df_orig[c].mean() for c in feature_cols}
new_user["total_purchase_30d"] = df_orig["total_purchase_30d"].quantile(0.95)
result = assign_persona(new_user)
print(f"\n신규 유저 배정: Cluster {result['cluster']} ({result['persona_name']})")
print(f"  신뢰도: {result['confidence']:.2%}")

# ============================================================
# 7. 마케팅팀용 페르소나 카드 (CSV 저장)
# ============================================================
persona_summary = pd.DataFrame([
    {
        "cluster_id": c,
        "persona_name": p["name"],
        "user_count": p["size"],
        "user_pct": f"{p['pct']:.1%}",
        **{f: round(p["centroid"][f], 2) for f in feature_cols[:10]},
    }
    for c, p in persona_profiles.items()
])
persona_summary.to_csv("persona_cards.csv", index=False)
print("\n✓ persona_cards.csv 저장 완료 (마케팅팀 전달용)")
```

#### 트레이드오프 및 후속 질문

- **"K-means 의 한계?"** → 구형 클러스터 가정, outlier 에 민감. 비정형 분포면 HDBSCAN 또는 GMM (soft assignment 가능).
- **"유저 행동이 시간 따라 변하면?"** → 분기마다 재클러스터링, cluster transition matrix 로 변화 추적, 유저 이동 분석.
- **"GMM 으로 soft assignment 하면?"** → 경계 유저를 두 페르소나에 동시 배정 → 캠페인 mix 설계 가능.

---

## K. 평가 / 검증

---

### 문제 20. 신구 번역 모델 비교 평가 시스템

**카테고리**: LLM 평가, A/B 검증, 자동 + 수동 평가
**예상 시간**: 90분

#### 문제 설명

```
기존 한→영 번역 모델을 fine-tuning 한 신규 모델이 있다. 신규 모델로 교체할지
결정해야 한다.

다음을 구현하라.
1. 100개 테스트 문장에 대해 두 모델의 번역을 자동 평가 (BLEU, COMET 등).
2. 사람이 빠르게 비교 평가할 수 있는 웹 UI (블라인드 평가, 좌우 무작위 배치).
3. 통계적으로 신규 모델이 유의미하게 우수한지 검정.
```

#### 접근 방법

- 자동 지표: BLEU + chrF + COMET (학습 기반, 의미 보존 평가)
- LLM-as-a-judge: GPT-4/Claude 가 둘 중 선호 선택 (position bias 회피 — 좌우 무작위)
- 사람 평가: side-by-side, 블라인드, paired test
- 통계 검정: paired bootstrap (자동 지표), McNemar / sign test (preference)

#### 풀이 코드

```python
import json
import random
import hashlib
from dataclasses import dataclass, field, asdict
from typing import Optional
from pathlib import Path
import numpy as np
from scipy import stats

# ============================================================
# 1. 데이터 모델
# ============================================================
@dataclass
class TestSentence:
    sentence_id: str
    source_ko: str
    reference_en: Optional[str]   # 정답 번역 (있을 때만)
    translation_A: str            # 기존 모델
    translation_B: str            # 신규 모델

@dataclass
class HumanJudgment:
    sentence_id: str
    judge_id: str
    preferred: str        # "A" | "B" | "tie"
    quality_A: int        # 1~5
    quality_B: int
    comment: Optional[str] = None

# ============================================================
# 2. 자동 평가 지표
# ============================================================
class AutoEvaluator:
    def __init__(self, use_comet=False):
        # BLEU/chrF: sacrebleu
        # COMET: unbabel-comet (다운로드 필요, 학습 기반 의미 평가)
        self.use_comet = use_comet
        if use_comet:
            # from comet import download_model, load_from_checkpoint
            # ckpt = download_model("Unbabel/wmt22-comet-da")
            # self.comet = load_from_checkpoint(ckpt)
            self.comet = None

    def bleu(self, hyp: str, ref: str) -> float:
        # 실제: import sacrebleu; return sacrebleu.sentence_bleu(hyp, [ref]).score
        # 여기선 mock (단어 겹침 비율)
        h_words = set(hyp.lower().split())
        r_words = set(ref.lower().split())
        if not r_words:
            return 0.0
        return len(h_words & r_words) / len(r_words) * 100

    def chrf(self, hyp: str, ref: str) -> float:
        # 실제: sacrebleu.sentence_chrf(hyp, [ref]).score
        return self.bleu(hyp, ref) * 0.95  # mock

    def comet_score(self, src: str, hyp: str, ref: Optional[str]) -> float:
        if self.comet is None:
            return 0.5  # mock
        # data = [{"src": src, "mt": hyp, "ref": ref}]
        # return self.comet.predict(data, gpus=0)[0]
        return 0.5

    def evaluate(self, sentences: list[TestSentence]) -> dict:
        results_A = {"bleu": [], "chrf": [], "comet": []}
        results_B = {"bleu": [], "chrf": [], "comet": []}
        for s in sentences:
            if s.reference_en:
                results_A["bleu"].append(self.bleu(s.translation_A, s.reference_en))
                results_A["chrf"].append(self.chrf(s.translation_A, s.reference_en))
                results_B["bleu"].append(self.bleu(s.translation_B, s.reference_en))
                results_B["chrf"].append(self.chrf(s.translation_B, s.reference_en))
            results_A["comet"].append(self.comet_score(s.source_ko, s.translation_A, s.reference_en))
            results_B["comet"].append(self.comet_score(s.source_ko, s.translation_B, s.reference_en))
        return {
            "model_A": {k: np.mean(v) if v else None for k, v in results_A.items()},
            "model_B": {k: np.mean(v) if v else None for k, v in results_B.items()},
            "raw_A": results_A,
            "raw_B": results_B,
        }

# ============================================================
# 3. LLM-as-a-Judge (position bias 제거)
# ============================================================
class LLMJudge:
    """동일 쌍을 좌우 바꿔 두 번 평가 → 일관된 선호만 카운트."""
    JUDGE_PROMPT = """당신은 번역 평가 전문가입니다.
다음 한국어 원문과 두 번역 중, 어느 쪽이 더 자연스럽고 정확한지 평가하세요.

원문 (한국어): {src}
번역 1: {t1}
번역 2: {t2}

다음 JSON 으로만 응답:
{{"preferred": "1" | "2" | "tie", "reason": "한 문장"}}"""

    def __init__(self, llm_client=None):
        self.client = llm_client

    def _judge_once(self, src, t1, t2) -> dict:
        if self.client is None:
            # Mock
            return {"preferred": random.choice(["1", "2", "tie"]), "reason": "mock"}
        # 실제 API 호출
        return {"preferred": "1", "reason": "..."}

    def judge_pair(self, sentence: TestSentence) -> str:
        # Order 1: A 가 1
        r1 = self._judge_once(sentence.source_ko, sentence.translation_A, sentence.translation_B)
        # Order 2: A 가 2 (position 반전)
        r2 = self._judge_once(sentence.source_ko, sentence.translation_B, sentence.translation_A)

        # 일관된 선호만 인정
        # r1: "1"=A 선호, "2"=B 선호
        # r2: "1"=B 선호 (because A is on position 2), "2"=A 선호
        if r1["preferred"] == "1" and r2["preferred"] == "2":
            return "A"   # 양쪽 모두 A 선호
        if r1["preferred"] == "2" and r2["preferred"] == "1":
            return "B"
        return "tie"     # 일관성 없으면 tie

    def evaluate_all(self, sentences) -> dict:
        verdicts = [self.judge_pair(s) for s in sentences]
        from collections import Counter
        cnt = Counter(verdicts)
        return {
            "A_preferred": cnt.get("A", 0),
            "B_preferred": cnt.get("B", 0),
            "tie": cnt.get("tie", 0),
            "total": len(verdicts),
            "verdicts": verdicts,
        }

# ============================================================
# 4. 사람 평가용 블라인드 페어 생성
# ============================================================
def make_blind_pairs(sentences: list[TestSentence],
                      output_path: str = "human_eval_pairs.json"):
    """좌우 무작위 배치 + 블라인드. side_map 으로 매핑 저장."""
    pairs = []
    side_map = {}  # pair_id -> {"left": "A"|"B", "right": ...}
    for s in sentences:
        flip = random.random() < 0.5
        pair_id = hashlib.md5(s.sentence_id.encode()).hexdigest()[:10]
        if flip:
            left, right = s.translation_B, s.translation_A
            side_map[pair_id] = {"left": "B", "right": "A"}
        else:
            left, right = s.translation_A, s.translation_B
            side_map[pair_id] = {"left": "A", "right": "B"}
        pairs.append({
            "pair_id": pair_id,
            "sentence_id": s.sentence_id,
            "source_ko": s.source_ko,
            "left": left,
            "right": right,
        })
    with open(output_path, "w") as f:
        json.dump({"pairs": pairs, "side_map_secret": side_map}, f,
                  ensure_ascii=False, indent=2)
    return pairs, side_map

# ============================================================
# 5. 사람 평가 결과 → 통계 검정
# ============================================================
def analyze_human_eval(judgments: list[HumanJudgment]) -> dict:
    """McNemar / sign test 로 paired preference 검정."""
    n_a, n_b, n_tie = 0, 0, 0
    for j in judgments:
        if j.preferred == "A":
            n_a += 1
        elif j.preferred == "B":
            n_b += 1
        else:
            n_tie += 1

    # Sign test (tie 제외) — paired preference
    n = n_a + n_b
    if n > 0:
        # B 가 우수하다는 단측 검정
        p_value = stats.binomtest(n_b, n, p=0.5, alternative="greater").pvalue
    else:
        p_value = 1.0

    # 품질 점수 paired t-test
    qa = [j.quality_A for j in judgments]
    qb = [j.quality_B for j in judgments]
    t_stat, t_p = stats.ttest_rel(qb, qa)  # B - A
    # Wilcoxon 도 같이
    w_stat, w_p = stats.wilcoxon(qb, qa) if len(qa) > 0 else (None, 1.0)

    return {
        "n_total": len(judgments),
        "n_A_preferred": n_a,
        "n_B_preferred": n_b,
        "n_tie": n_tie,
        "B_preference_rate": n_b / len(judgments) if judgments else 0,
        "sign_test_p_value": float(p_value),
        "quality_A_mean": float(np.mean(qa)),
        "quality_B_mean": float(np.mean(qb)),
        "quality_diff_mean": float(np.mean(qb) - np.mean(qa)),
        "paired_t_p": float(t_p),
        "wilcoxon_p": float(w_p),
    }

# ============================================================
# 6. Paired Bootstrap (자동 지표용)
# ============================================================
def paired_bootstrap(scores_a: list, scores_b: list,
                      n_iter: int = 10000, seed: int = 42) -> dict:
    """A vs B 의 paired score 차이가 0과 다른지 bootstrap."""
    rng = np.random.default_rng(seed)
    a = np.array(scores_a); b = np.array(scores_b)
    diffs = b - a
    obs_mean = diffs.mean()

    boot_means = []
    n = len(diffs)
    for _ in range(n_iter):
        idx = rng.integers(0, n, n)
        boot_means.append(diffs[idx].mean())
    boot_means = np.array(boot_means)
    ci = np.percentile(boot_means, [2.5, 97.5])
    # p-value: 0 보다 크다는 단측
    p_value = (boot_means <= 0).mean()
    return {
        "diff_mean": float(obs_mean),
        "ci_95": [float(ci[0]), float(ci[1])],
        "p_value_one_sided": float(p_value),
    }

# ============================================================
# 7. 최종 권고
# ============================================================
def make_final_report(auto_result, llm_result, human_result):
    lines = []
    lines.append("# 번역 모델 비교 평가 최종 보고서\n")

    lines.append("## 1. 자동 평가")
    for metric in ["bleu", "chrf", "comet"]:
        a = auto_result["model_A"].get(metric)
        b = auto_result["model_B"].get(metric)
        if a is not None and b is not None:
            bs = paired_bootstrap(
                auto_result["raw_A"][metric],
                auto_result["raw_B"][metric],
            )
            lines.append(f"- **{metric.upper()}**: A={a:.2f}, B={b:.2f}, "
                         f"diff={bs['diff_mean']:+.2f} "
                         f"(95% CI [{bs['ci_95'][0]:.2f}, {bs['ci_95'][1]:.2f}], "
                         f"p={bs['p_value_one_sided']:.4f})")

    lines.append("\n## 2. LLM-as-a-Judge (position bias 보정)")
    lines.append(f"- A 선호: {llm_result['A_preferred']}, "
                 f"B 선호: {llm_result['B_preferred']}, "
                 f"tie: {llm_result['tie']}")

    lines.append("\n## 3. 사람 평가")
    lines.append(f"- 총 평가: {human_result['n_total']}쌍")
    lines.append(f"- B 선호율: {human_result['B_preference_rate']:.2%}")
    lines.append(f"- Sign test p-value: {human_result['sign_test_p_value']:.4f}")
    lines.append(f"- 품질 점수: A={human_result['quality_A_mean']:.2f}, "
                 f"B={human_result['quality_B_mean']:.2f} "
                 f"(diff={human_result['quality_diff_mean']:+.2f}, "
                 f"Wilcoxon p={human_result['wilcoxon_p']:.4f})")

    lines.append("\n## 4. 결론")
    sig_auto = any(
        paired_bootstrap(auto_result["raw_A"][m],
                         auto_result["raw_B"][m])["p_value_one_sided"] < 0.05
        for m in ["bleu", "chrf", "comet"]
        if auto_result["model_A"].get(m) is not None
    )
    sig_human = human_result["sign_test_p_value"] < 0.05

    if sig_auto and sig_human:
        lines.append("✅ **신규 모델(B) 출시 권고** — 자동 지표 + 사람 평가 모두 유의미.")
    elif sig_human:
        lines.append("✅ **신규 모델(B) 출시 권고** — 사람 평가에서 유의미 (자동 지표는 BLEU 한계).")
    elif sig_auto:
        lines.append("⚠️ **추가 검증 필요** — 자동 지표만 우세, 사람 평가는 미확정.")
    else:
        lines.append("❌ **현 모델(A) 유지** — 유의미한 개선 없음.")

    return "\n".join(lines)

# ============================================================
# 8. 사용 예시
# ============================================================
if __name__ == "__main__":
    # Mock 데이터
    test_sentences = [
        TestSentence(
            sentence_id=f"S{i}",
            source_ko=f"테스트 문장 {i}",
            reference_en=f"Test sentence {i}",
            translation_A=f"Test sentence A version {i}",
            translation_B=f"Test sentence B version {i}",
        )
        for i in range(100)
    ]

    # 자동 평가
    evaluator = AutoEvaluator(use_comet=False)
    auto_result = evaluator.evaluate(test_sentences)

    # LLM judge
    judge = LLMJudge(llm_client=None)
    llm_result = judge.evaluate_all(test_sentences)

    # 사람 평가 (mock)
    judgments = [
        HumanJudgment(
            sentence_id=s.sentence_id,
            judge_id=random.choice(["alice", "bob", "carol"]),
            preferred=random.choice(["A", "B", "tie"]),
            quality_A=random.randint(2, 5),
            quality_B=random.randint(3, 5),
        )
        for s in test_sentences for _ in range(2)  # 문장당 2명 평가
    ]
    human_result = analyze_human_eval(judgments)

    # 보고서
    report = make_final_report(auto_result, llm_result, human_result)
    print(report)
    Path("final_report.md").write_text(report, encoding="utf-8")
```

#### 트레이드오프 및 후속 질문

- **"BLEU 가 올랐는데 사람 평가는 비슷하면?"** → BLEU 는 표면 일치만 봄. 의미 보존이 잘 되지 않았을 가능성. COMET/BLEURT 같은 학습 기반 지표 + 사람 평가 우선.
- **"LLM judge 의 편향?"** → position bias (좌우 무작위로 회피), self-preference bias (다른 모델 family 로 judge), verbosity bias (긴 답 선호).
- **"테스트셋과 운영 분포가 다르면?"** → 운영에서 샘플링한 별도 테스트셋 구축, 카테고리(대사/UI/스토리)별 분리 평가.

---

## 면접 준비 체크리스트

### 출제 가능성 / 우선순위 매트릭스

| 카테고리 | 등장 가능성 | 핵심 준비 포인트 |
|---------|----------|----------------|
| Tabular ML (회귀/분류) | ★★★★★ | EDA→FE→모델링→평가 루틴을 60~90분에 끝내는 손 |
| LLM 응용 | ★★★★★ | 모듈 분리한 시스템 설계 (Translator 예시) |
| 강화학습 | ★★★★☆ | PPO/DQN 직접 짜본 경험, 데브시스터즈 시그니처 |
| MLOps/시스템 설계 | ★★★★☆ | 경력직 면접의 핵심, 모니터링 + 배포 |
| 추천/세그멘테이션 | ★★★☆☆ | 마케팅·BM 협업 업무에 직결 |
| 컴퓨터 비전/생성 | ★★★☆☆ | 사내 도구 컨텍스트 |
| A/B 테스트/평가 | ★★★☆☆ | 경력자에게 의외로 자주 |
| 데이터 엔지니어링 | ★★☆☆☆ | ML 엔지니어에게도 종종 |

### 면접 직전 1주일 워밍업

**Day 1-2: Tabular ML 손에 익히기**
- [ ] Kaggle 노트북 1개 처음부터 끝까지 1시간 안에 풀어보기
- [ ] LightGBM/XGBoost 의 주요 하이퍼파라미터 5개 외우기
- [ ] target encoding, class weight, 5-fold CV 코드 외우기

**Day 3-4: LLM 시스템 설계**
- [ ] 추상 클래스 + 모듈 분리한 LLM 호출 코드 1개 작성
- [ ] 캐싱 / fallback / 모델 라우팅 / 비용 추적 흐름 손에 익히기
- [ ] OpenAI 또는 Anthropic API 의 structured output 사용법 확인

**Day 5: 강화학습 + MLOps**
- [ ] Gym 환경 + REINFORCE/PPO 코드 처음부터 작성
- [ ] FastAPI 추론 서버 1개 띄워보기 (Redis feature store 포함)

**Day 6: A/B 테스트 + 통계**
- [ ] Z-test, Bootstrap, Mann-Whitney U 직접 코드 한 번씩
- [ ] Simpson's paradox / 다중 비교 보정의 의미 설명할 수 있게

**Day 7: 모의 면접**
- [ ] 위 문제 중 하나를 화면 녹화 + 입 밖으로 설명하며 90분 풀이
- [ ] 본인의 풀이 영상 다시 보면서 "의사결정을 말로 했는가" 점검

### 면접 당일 행동 강령

1. **첫 5분은 듣고 정의하기**. 문제를 받자마자 코딩 시작하지 말 것. 문제 정의를 메모장에 한 번 적고, 면접관에게 "이 문제를 이렇게 이해했습니다" 확인 받기.

2. **3번 짚어야 할 의사결정**
   - 평가 지표 선택의 정당성 (왜 AUC 가 아닌 PR-AUC 인지)
   - 모델 선택의 정당성 (왜 딥러닝이 아닌 LightGBM 인지)
   - 운영 시 제약 (latency / 비용 / 모니터링) 한 번 언급

3. **완벽보다 완주**. 30분 남았는데 1번 완성 못 했으면, 2번 손 대지 말고 1번 마무리. 점수는 "한 문제 완성도" > "여러 문제 미완".

4. **막힐 때 말로 풀기**. 코드가 안 떠오르면 "이 부분은 X 라는 알고리즘이 적합해서 의사코드로 작성하고 시간 남으면 채우겠습니다" 하고 진행.

5. **코드 리뷰 대화 준비**. 끝나고 면접관이 물어볼 것:
   - "이 코드의 한계는?"
   - "운영에 올린다면?"
   - "테스트는 어떻게?"
   - "성능이 안 나오면 어디부터 보겠어요?"

이 4가지에 대한 답을 *작성하면서* 머릿속에 미리 메모해두면, 리뷰 시간에 1.5배의 점수를 가져갈 수 있다.

---

## 참고 자료

- [데브시스터즈 기술 블로그](https://tech.devsisters.com/) — 특히 "데브시스터즈 서버 직군은 왜 코딩 면접을 볼까?", "강화학습으로 더 재미있는 게임 만들기" 글
- [데브시스터즈 채용 페이지](https://careers.devsisters.com)
- [DEVIEW 2016: 딥러닝과 강화 학습으로 나보다 잘하는 쿠키런 AI 구현하기](https://tv.naver.com/v/2051482)
- Sutton & Barto, *Reinforcement Learning: An Introduction* (2nd ed.)
- *가상면접 사례로 배우는 머신러닝 시스템 설계 기초* — ML 시스템 디자인 면접 대비
- *인사이드 머신러닝 인터뷰* — 빅테크 ML 면접 문항 모음

---

> **마지막 한 마디**
>
> 데브시스터즈가 면접에서 보고 싶어하는 건 "이 사람이 우리 팀에서 *지속적으로 성장하면서* 문제를 풀어나갈 수 있을까" 라는 질문에 대한 답이다. 코드가 화려한 사람보다, *왜 그렇게 했는지 설명하면서 한 발씩 나아가는 사람*이 합격한다.
>
> 위 20문제를 다 외워서 갈 필요는 없다. 카테고리별로 한 문제씩, 평가지표/모델선택/운영제약 세 가지를 자기 입으로 설명할 수 있게 손에 익히면 어떤 변형이 나와도 흔들리지 않는다.
>
> 좋은 결과 있기를.

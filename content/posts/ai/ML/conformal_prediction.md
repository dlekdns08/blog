---
title: 'Conformal Prediction: 머신러닝 예측에 신뢰를 더하는 방법'
date: '2026-04-05'
tags:
  - Conformal Prediction
  - DL
  - ML
---

> "모델이 예측했다" 는 것과 "그 예측을 믿을 수 있다" 는 것은 다른 이야기다.

## 들어가며

여러분이 딥러닝 모델을 만들었다고 상상해보자. 테스트셋 정확도 95%. 꽤 훌륭해 보인다.

그런데 실제 서비스에 붙이는 순간 이런 질문이 생긴다.

- 이 예측, 얼마나 믿어도 될까?
- 모델이 확신하는 척하는데, 사실은 틀릴 수도 있지 않을까?
- 특히 의료나 금융처럼 중요한 분야라면?

**Conformal Prediction**은 바로 이 문제를 해결하기 위해 등장한 프레임워크다. 예측값 하나를 던져주는 게 아니라, **"정답이 이 범위 안에 있을 확률이 최소 90%입니다"** 라고 통계적으로 보장해주는 방법이다.

---

## 기존 불확실성 추정의 한계

머신러닝에서 불확실성을 다루는 방법은 기존에도 있었다.

- **Bayesian Neural Network**: 파라미터에 분포를 가정하지만, 계산이 복잡하고 모델 구조를 바꿔야 한다.
- **Monte Carlo Dropout**: 추론 시 Dropout을 켜두고 여러 번 샘플링. 간편하지만 보장이 없다.
- **Softmax 확률값**: "이 클래스일 확률 92%"는 보정(calibration)이 안 되면 실제 확률과 다르다.

이들의 공통 문제는 **통계적 보장(coverage guarantee)이 없다**는 것이다. 즉, "90%라고 했는데 실제로 맞는 비율은 70%더라"가 될 수 있다.

Conformal Prediction은 이 문제를 정면돌파한다.

---

## Conformal Prediction의 핵심 아이디어

핵심은 단순하다.

> **"모델이 얼마나 틀렸는지를 과거 데이터로 측정하고, 그 경험을 바탕으로 미래 예측의 불확실성 범위를 만든다."**

수학적으로는 아래 보장을 제공한다.

$$P\left(Y_{n+1} \in C(X_{n+1})\right) \geq 1 - \alpha$$

- $C(X_{n+1})$: 새로운 입력에 대한 **prediction set (또는 interval)**
- $1 - \alpha$: 원하는 커버리지 수준 (예: 90%, 95%)
- 어떤 분포 가정도 필요 없음 (**distribution-free**)
- 어떤 모델에도 적용 가능 (**model-agnostic**)

단 하나의 가정만 필요하다: **데이터가 교환 가능(exchangeable)** 해야 한다. 대부분의 i.i.d. 환경에서 자동으로 만족된다.

---

## 작동 원리: Split Conformal Prediction

가장 간단하고 널리 쓰이는 방법인 **Split Conformal Prediction**을 단계별로 살펴보자.

### Step 1: 데이터 분리

```
전체 데이터
├── Train set      → 모델 학습
└── Calibration set → Conformal Prediction용 (학습에 사용 X)
```

### Step 2: Nonconformity Score 계산

Calibration set의 각 샘플에 대해 "모델 예측이 얼마나 틀렸는지"를 수치화한다.

| Task | Nonconformity Score 예시 |
|------|--------------------------|
| 회귀 | $s_i = \|y_i - \hat{y}_i\|$ |
| 분류 | $s_i = 1 - \hat{p}(y_i \| x_i)$ |

### Step 3: Quantile 결정

원하는 커버리지 $1 - \alpha$에 맞는 임계값 $\hat{q}$를 구한다.

$$\hat{q} = \text{Quantile}\left(\{s_1, \ldots, s_n\},\ \frac{\lceil(n+1)(1-\alpha)\rceil}{n}\right)$$

### Step 4: Prediction Set 생성

새로운 입력 $X_{n+1}$에 대해:

- **회귀**: $C(X_{n+1}) = [\hat{y} - \hat{q},\ \hat{y} + \hat{q}]$
- **분류**: $C(X_{n+1}) = \{y : s(X_{n+1}, y) \leq \hat{q}\}$

분류에서는 정답일 가능성이 있는 **클래스들의 집합**이 반환된다. 모델이 확신할수록 집합이 작아지고, 불확실할수록 집합이 커진다.

---

## Conformal Prediction의 종류

| 방법 | 특징 | 장단점 |
|------|------|--------|
| **Split Conformal** | Calibration set 별도 사용 | 빠르고 단순, 데이터 일부 낭비 |
| **Full Conformal** | 모든 데이터 활용 | 통계적으로 효율적, 계산 비용 높음 |
| **Cross-Conformal** | K-Fold 방식 적용 | 효율적 데이터 사용, 구현 복잡 |
| **Mondrian Conformal** | 클래스별 조건부 커버리지 | 클래스 불균형 대응, 추가 설정 필요 |

---

## 실제 코드 예시 (Python)

`MAPIE` 라이브러리를 활용한 간단한 예시다.

```python
from mapie.regression import MapieRegressor
from sklearn.ensemble import GradientBoostingRegressor
import numpy as np

# 기본 모델 준비
base_model = GradientBoostingRegressor()

# MAPIE로 Conformal Prediction 적용
mapie = MapieRegressor(base_model, method="base", cv="split")
mapie.fit(X_train, y_train)

# 90% 커버리지 보장하는 예측 구간
y_pred, y_pis = mapie.predict(X_test, alpha=0.1)

# y_pis[:, 0, 0] = 하한, y_pis[:, 0, 1] = 상한
print(f"예측값: {y_pred[0]:.2f}")
print(f"예측 구간: [{y_pis[0, 0, 0]:.2f}, {y_pis[0, 0, 1]:.2f}]")
# → 예측값: 42.31
# → 예측 구간: [38.15, 46.47]  ← 90% 확률로 정답이 이 안에 있음
```

---

## 실제 활용 사례

### 🏥 의료 진단
단일 질환을 예측하는 대신 가능한 질환들의 집합을 제공한다. "폐렴 또는 기관지염일 가능성이 95%입니다"처럼 의사가 더 안전하게 판단할 수 있도록 돕는다.

### 🚗 자율주행
모델이 불확실한 상황(안개, 야간)에서는 prediction set이 커지고, 이를 감지해 더 보수적인 주행 전략을 채택할 수 있다.

### 💹 금융 리스크 관리
주가 예측에서 점 예측 대신 예측 구간을 제공해 VaR(Value at Risk) 같은 리스크 지표와 자연스럽게 통합된다.

### 🤖 LLM / AI 시스템
여러 후보 답변 중 통계적으로 유효한 집합을 반환해, 모델이 과신하는 것을 방지한다.

---

## Conformal Prediction의 장단점

### ✅ 장점

- **분포 가정 불필요**: 데이터가 어떤 분포를 따르든 커버리지가 보장된다.
- **모델 무관**: XGBoost, 딥러닝, 선형모델 등 어떤 모델에도 붙일 수 있다.
- **구현 간단**: 기존 파이프라인에 Calibration 단계만 추가하면 된다.
- **수학적 보장**: 이론적으로 증명된 커버리지 보장이다.

### ⚠️ 한계

- **Marginal coverage**: 평균적으로 커버리지가 보장되지만, 특정 입력 구간에서는 보장이 약할 수 있다.
- **Exchangeability 가정**: 시계열 데이터처럼 분포가 변하는 경우 추가 처리가 필요하다.
- **Calibration set 필요**: 데이터가 적을 경우 Calibration set 확보가 부담될 수 있다.
- **Prediction set 크기**: 불확실한 상황에서는 집합이 너무 커져 실용성이 떨어질 수 있다.

---

## 마치며

Conformal Prediction은 "AI가 틀릴 수 있다"는 사실을 정직하게 인정하고, 그 불확실성을 **수학적으로 정량화**하는 방법이다.

모델 성능을 높이는 것도 중요하지만, 실제 서비스에서는 **"얼마나 믿을 수 있느냐"** 가 더 중요한 경우가 많다. 특히 의료, 금융, 안전 시스템처럼 오류의 비용이 큰 도메인에서는 더욱 그렇다.

기존 모델에 몇 줄의 코드만 추가하면 되는 만큼, 실무에서 충분히 도입해볼 만한 기술이다.

---

## 참고 자료

- Vovk, V., Gammerman, A., & Shafer, G. (2005). *Algorithmic Learning in a Random World*
- Angelopoulos, A. N., & Bates, S. (2021). [A Gentle Introduction to Conformal Prediction and Distribution-Free Uncertainty Quantification](https://arxiv.org/abs/2107.07511)
- [MAPIE Documentation](https://mapie.readthedocs.io/)
- [Awesome Conformal Prediction (GitHub)](https://github.com/valeman/awesome-conformal-prediction)

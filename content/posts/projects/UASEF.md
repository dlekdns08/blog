---
title: 'UASEF: 의료 LLM 에이전트를 위한 불확실성 기반 안전 에스컬레이션 프레임워크 설계'
date: '2026-03-27'
description: Uncertainty-Aware Safe Escalation Framework for Medical LLM Agent
---
> **Uncertainty-Aware Safe Escalation Framework for Medical LLM Agents**
> 설계 단계 기록 — 2026년 3월

---

## 왜 이 연구가 필요한가

LLM은 이제 USMLE를 통과할 수준의 의학 지식을 갖추고 있다. GPT-4는 의사 면허 시험에서 평균 이상의 점수를 기록했고, 다양한 의료 QA 벤치마크에서 인상적인 성능을 보인다. 그러나 "시험을 잘 본다"는 것이 "임상에서 안전하게 판단할 수 있다"는 의미는 아니다.

실제 임상에서 LLM 에이전트가 마주치는 상황은 세 가지 특성을 가진다.

**① 비정형 고위험**: 응급실에서 의식불명 환자의 처치 순서를 물어보는 질문은 교과서의 선택지 문제와 다르다. 틀렸을 때의 비용이 비대칭적으로 크다.

**② 분포 외 데이터**: 훈련 데이터에 없는 희귀질환, 최신 약물 상호작용, 개별 환자의 복잡한 comorbidity 조합은 LLM이 자신 있게 답하더라도 실제로는 틀릴 수 있다.

**③ 근거 없는 자신감**: LLM은 불확실한 상황에서도 유창하게 답변한다. "I am not certain"을 표현하는 능력은 모델마다, 상황마다 일관되지 않다.

이 세 문제의 공통점은 **언제 멈춰야 하는지 모른다**는 것이다.

UASEF는 이 질문에 답한다: *LLM 에이전트가 스스로 판단하기에 너무 불확실한 순간을 통계적으로 보장된 방식으로 감지하고, 인간 전문가에게 넘겨라.*

---

## 시스템 개요

UASEF는 세 개의 독립 모듈과 이를 통합하는 LangGraph 에이전트로 구성된다.

```
┌─────────────────────────────────────────────────────┐
│                  LangGraph ReAct Agent               │
│                                                     │
│   START → [reason] → [act] → [reason] → ...        │
│                                  ↓                  │
│                          [uasef_check] ← UASEF 독립 감사
│                         ↙          ↘                │
│                  [escalate]      [finalize]          │
│                      ↓               ↓              │
│               전문의 인계         최종 답변           │
└─────────────────────────────────────────────────────┘
         ↑ 외부 안전 게이트 (에이전트 루프와 독립)
         │
   ┌─────┴──────┐
   │   UQM      │  Conformal Prediction 기반 불확실성 수치화
   │   RTC      │  전문과목·시나리오별 동적 임계값 조정
   │   EDE      │  다중 트리거 에스컬레이션 결정 엔진
   └────────────┘
```

핵심 설계 원칙은 **UASEF가 에이전트의 내부 상태를 보지 않는다**는 것이다. `uasef_check` 노드는 원본 질문을 독립적으로 재평가하여 에이전트 루프와 무관하게 판정한다. 이는 에이전트가 자신의 불확실성을 "숨기는" 경우에도 외부에서 감지할 수 있도록 한다.

---

## Module 1: UQM — 불확실성 정량화

### Conformal Prediction을 선택한 이유

불확실성 정량화 방법은 많다. Bayesian uncertainty, Monte Carlo Dropout, Temperature Scaling 등이 있지만, 이들은 모두 **모델 접근권**이 필요하거나 특정 아키텍처에 종속된다. 무엇보다 "이 예측이 얼마나 신뢰할 수 있는가"에 대한 **통계적 보장**을 제공하지 않는다.

Conformal Prediction(CP)은 다르다. 데이터가 i.i.d.에서 교환 가능(exchangeable)하다는 가정만으로, 다음 보장이 성립한다.

$$P(s_{\text{test}} \leq \hat{q}) \geq 1 - \alpha$$

즉, calibration set에서 계산한 임계값 $\hat{q}$에 대해, 테스트 샘플의 비적합 점수가 그 이하일 확률이 최소 $1-\alpha$임을 **분포 가정 없이** 보장한다. $\alpha = 0.05$면 95% coverage가 수학적으로 보증된다.

임계값 공식은 Angelopoulos & Bates (2021)를 따른다.

$$\hat{q} = \frac{\lceil (n+1)(1-\alpha) \rceil}{n}\text{-번째 순위 비적합 점수}$$

```python
class ConformalCalibrator:
    def fit(self, nonconformity_scores: list[float]) -> None:
        n = len(nonconformity_scores)
        level = min(math.ceil((n + 1) * (1 - self.alpha)) / n, 1.0)
        self.threshold = float(np.quantile(sorted(nonconformity_scores), level))
```

### 비적합 점수 설계: Logprob vs Self-Consistency

CP는 비적합 함수(nonconformity function)의 정의에 열려 있다. 우리는 두 가지를 구현했다.

**LOGPROB (주요 기여)**

$$s(x) = -\frac{1}{T}\sum_{t=1}^{T} \log p(w_t \mid w_{<t}, x)$$

모델이 답변을 생성할 때의 평균 negative log-likelihood. 값이 클수록 모델이 불확실한 토큰을 많이 뱉었다는 의미다. GPT-4o, GPT-4o-mini, llama.cpp 기반 모델이 지원한다.

**SELF_CONSISTENCY (Ablation)**

$$s(x) = \text{Jaccard\_diversity}(\{r_1, ..., r_N\}) \times N$$

동일 질문을 N번 쿼리하여 답변들의 다양성을 측정. 답변이 일관되면 낮은 점수(자신감 있음), 들쭉날쭉하면 높은 점수(불확실). 수학적으로 CP 보장이 동일하게 성립하지만, 다른 비적합 함수이므로 logprob 방식과 직접 비교할 수 없다. **논문에서 반드시 "ablation study"로 명시**해야 심사자 지적을 피할 수 있다.

```python
class ScoringMethod(str, Enum):
    LOGPROB          = "logprob"           # Primary
    SELF_CONSISTENCY = "self_consistency"  # Ablation only
    AUTO             = "auto"              # 비권장 — 재현성 저하
```

`AUTO` 모드는 하위 호환을 위해 남겨두었지만 기본값에서 제거했다. 실험 재현성을 위해 scoring method는 항상 명시적으로 지정해야 한다.

### Distribution Shift 처리

CP의 핵심 가정은 **calibration set과 test set이 동일한 분포에서 온다**는 것이다. MedQA(USMLE 시험 문제)로 보정한 후 MIMIC-III(실제 ICU 기록)에서 평가하면 이 가정이 깨진다.

이를 투명하게 처리하기 위해 `calibrate()`와 `evaluate()` 호출 시 `distribution_source` 파라미터를 받도록 설계했다. 소스가 달라지면 경고를 발생시키고 Tibshirani et al. (2019) Weighted CP를 권고한다.

```python
uqm.calibrate(cal_questions, distribution_source="medqa")
uqm.evaluate(test_question, distribution_source="mimic3")
# → UserWarning: Distribution shift 감지!
#   Calibration: 'medqa' / Evaluation: 'mimic3'
#   권고: Weighted CP (Tibshirani et al., 2019)
```

---

## Module 2: RTC — 위험 임계값 보정기

UQM이 계산한 임계값 $\hat{q}$는 전체 의료 도메인에 동일하게 적용되어선 안 된다. 응급실과 일반 외래의 오판 비용이 같을 수 없기 때문이다.

RTC는 전문과목별 위험 온톨로지를 기반으로 임계값에 배율을 적용한다.

| 위험 수준 | 전문과목 예시 | 임계값 배율 | 의미 |
|----------|-------------|------------|------|
| CRITICAL | 응급의학, 중환자의학 | ×0.60 | 더 낮은 임계값 → 더 많이 에스컬레이션 |
| HIGH | 심장내과, 신경과, 종양학 | ×0.75 | |
| MODERATE | 내과, 외과 | ×1.00 | 기준값 |
| LOW | 일반의, 예방의학 | ×1.30 | 더 높은 임계값 → 자율 행동 허용 |

시나리오 유형도 반영한다. `emergency`나 `rare_disease` 시나리오는 추가로 ×0.85를 적용한다.

```python
@dataclass
class RTCConfig:
    def __post_init__(self):
        self.risk_level = SPECIALTY_RISK_MAP.get(self.specialty, RiskLevel.MODERATE)
        multiplier = RISK_THRESHOLD_MULTIPLIER[self.risk_level]
        if self.scenario_type in ("emergency", "rare_disease"):
            multiplier *= 0.85
        self.adjusted_threshold = self.base_threshold * multiplier
```

---

## Module 3: EDE — 에스컬레이션 결정 엔진

RTC가 조정한 임계값을 기준으로 최종 에스컬레이션 여부를 결정한다. 세 가지 트리거를 독립적으로 검사하고, 하나라도 활성화되면 에스컬레이션한다.

```
Trigger 1 — UNCERTAINTY_EXCEEDED
    nonconformity_score > adjusted_threshold
    → CP 보장 범위를 벗어난 불확실성

Trigger 2 — HIGH_RISK_ACTION
    응답 텍스트에 고위험 키워드 감지
    → "intubation", "alteplase", "norepinephrine", "code blue" 등

Trigger 3 — NO_EVIDENCE
    근거 부재 표현 감지
    → "I am not certain", "no clear guideline", "off-label" 등
```

에스컬레이션 확신도(confidence)는 세 트리거와 추가로 엔트로피 신호를 결합한다.

```python
confidence = min(1.0,
    len(triggers) / 3
    + (0.4 if UNCERTAINTY_EXCEEDED in triggers else 0.0)
    + (0.15 if entropy > 2.0 nats/token else 0.0)
)
```

`UNCERTAINTY_EXCEEDED`에 +0.4 가중치를 준 이유는 이것이 CP 이론의 직접적 신호이기 때문이다. 나머지 트리거는 휴리스틱이다.

엔트로피 가중치는 트리거 자체가 아닌 **2차 신호**로 처리한다. Shannon 엔트로피 2.0 nats/token 이상(GPT-4 수준 모델에서 높은 불확실성 수준)이면 confidence를 0.15 boosting하지만, 단독으로는 에스컬레이션을 유발하지 않는다.

---

## LangGraph 에이전트 통합

UASEF는 독립 파이프라인으로도 사용할 수 있지만, LangGraph StateGraph에 통합하면 ReAct 패턴과 결합된다.

### 그래프 흐름

```
START
  ↓
reason ──→ (tool_calls & iter < max) ──→ act
  ↑                                        │
  └────────────────────────────────────────┘
  ↓ (최종 답변 생성 or 반복 한계)
uasef_check    ← 원본 질문으로 독립 재판 (에이전트 히스토리와 무관)
  ↙          ↘
escalate    finalize
  ↓              ↓
END            END
```

ReAct 루프(reason → act → reason)가 완료된 후, `uasef_check` 노드가 **원본 질문을 새로 평가**한다. 에이전트가 도구를 사용해 아무리 많은 정보를 수집했더라도, UASEF는 그 과정을 신뢰하지 않고 독립적으로 판단한다.

### State 설계

```python
class MedicalAgentState(TypedDict):
    messages: Annotated[list[BaseMessage], operator.add]  # 누적 (reducer)
    question: str                                          # 불변 원본
    iteration: int
    max_iterations: int

    # UASEF 판정 결과 (uasef_check 노드가 채움)
    uasef_score: Optional[float]
    uasef_threshold: Optional[float]
    uasef_triggers: Optional[list[str]]
    uasef_confidence: Optional[float]
    should_escalate: Optional[bool]

    final_answer: Optional[str]
    escalation_reason: Optional[str]
```

`messages`만 `operator.add` 리듀서로 누적, 나머지는 최신값으로 덮어쓴다.

### 4가지 의료 도구

에이전트가 사용하는 도구는 모두 `str` 파라미터만 받는다. LLM tool-calling 안정성 최대화와 실제 API로의 교체 용이성을 위해서다.

| 도구 | 현재 구현 | 실제 연구에서 교체 대상 |
|------|----------|----------------------|
| `drug_interaction_checker` | 내장 DB | Drugs@FDA API, Lexicomp |
| `clinical_guideline_search` | AHA/ACC 요약 | UpToDate API, PubMed |
| `lab_reference_lookup` | 정상범위 테이블 | LOINC, 기관 내 LIS |
| `differential_diagnosis` | 키워드 패턴 매칭 | Isabel DDx, CDR 시스템 |

---

## 실험 설계

### 세 가지 시나리오

각 시나리오는 별도 YAML 설정 파일로 관리한다. 하드코딩된 파라미터 없이 `--config` 플래그로 전환 가능하다.

**Emergency (응급)**
- 전문과목: emergency_medicine (CRITICAL)
- 데이터: MedQA 응급의학 문제
- 기대: 높은 에스컬레이션율 → 안전 우선

**Rare Disease (희귀질환)**
- 전문과목: internal_medicine (MODERATE)
- 데이터: **MedAbstain AP/NAP** — 변형된(perturbed) 불확실한 질문
- 기대: MedAbstain이 설계상 LLM이 틀리도록 만들어진 데이터이므로 에스컬레이션 정답

**Multimorbidity (다중 이환)**
- 전문과목: cardiology (HIGH)
- 데이터: MIMIC-III 임상 기록 (distribution shift 실험)
- 기대: MedQA 보정 → MIMIC 평가로 CP 보장 검증

### 평가 지표

두 개의 safety 지표를 주요 기준으로 삼는다.

$$\text{Safety Recall} = \frac{TP}{TP + FN} \geq 0.95 \quad \text{(에스컬레이션해야 할 케이스를 놓치지 않음)}$$

$$\text{Over-escalation Rate} = \frac{FP}{FP + TN} \leq 0.15 \quad \text{(자율 행동 가능한 케이스를 불필요하게 에스컬레이션하지 않음)}$$

임상적으로 False Negative(위험 케이스를 자율 처리)의 비용이 False Positive(안전 케이스를 인간에게 넘김)보다 훨씬 크다. 95% safety recall은 타협 불가 목표다.

### Pareto Frontier 분석

$\alpha$ 값을 실제로 스윕하여 (actual_coverage, escalation_rate) 쌍을 측정한다. `estimated_coverage = 1 - α` 같은 이론값이 아니라, hold-out set에서 측정한 실제 coverage를 기록한다.

```python
ALPHAS = [0.01, 0.05, 0.10, 0.15, 0.20, 0.30]

for alpha in ALPHAS:
    for specialty in SPECIALTIES:
        uqm = UQM(backend=backend, alpha=alpha, scoring_method="logprob")
        coverage_report = uqm.calibrate(cal_questions, distribution_source="medqa")
        # CP 트리거만 측정 (키워드/근거 트리거 제외 — 순수 CP 분석)
        escalation_rate = measure_cp_only_escalation(uqm, rtc, test_cases)
```

이 sweep을 통해 α-coverage-escalation_rate 3차원 관계를 specialty별로 시각화할 수 있다.

---

## 데이터 파이프라인

### 자동 로딩 우선순위

```
1. HuggingFace 자동 다운로드 (GBaker/MedQA-USMLE-4-options)
2. data/raw/ 로컬 JSONL 파일
3. 내장 fallback 데이터 (20개 calibration + 9개 시나리오)
```

MedAbstain의 AP/NAP 변형(Abstention + Perturbed)은 `expected_escalate=True`로 자동 레이블링된다. 이 케이스들은 문제가 변형되어 답이 없거나 불확실하게 설계된 것이므로, safety recall 계산의 핵심 양성 케이스가 된다.

### 재현성 보장

모든 실험에서 세 가지 정보를 결과 JSON에 기록한다.

```json
{
  "scoring_method": "logprob",
  "distribution_source": "medqa",
  "alpha": 0.05,
  "calibration_metadata": {
    "n_calibration": 500,
    "n_holdout": 125,
    "actual_coverage": 0.968,
    "timestamp": "2026-03-27T..."
  }
}
```

`scoring_method`를 명시하는 이유는 동일한 CP 프레임워크 아래서도 비적합 함수가 다르면 다른 실험이기 때문이다. 논문 심사에서 이 구분이 명확하지 않으면 "CP를 구현했다고 하지만 실제론 majority voting"이라는 지적을 받는다.

---

## 현재 한계와 향후 과제

**이론적 한계**
- Distribution shift: MedQA → MIMIC-III 이동 시 CP 보장 약화. Weighted CP (Tibshirani et al., 2019) 구현이 필요하다.
- Calibration set 크기: CP 이론 보증이 실용적 수준으로 작동하려면 n ≥ 500이 권장된다. 현재 기본값 n=30은 개발 속도를 위한 임시값이다.

**구현 한계**
- 의료 도구 4개가 모두 mock 구현이다. 실제 API 연동 없이는 도구 사용의 임상적 가치를 측정할 수 없다.
- EDE의 키워드 기반 트리거(HIGH_RISK_ACTION, NO_EVIDENCE)는 SNOMED CT 같은 의료 온톨로지로 확장되어야 정밀도가 올라간다.

**다음 단계**
- [ ] Weighted CP 구현 (distribution shift 대응)
- [ ] 실제 MedAbstain 데이터로 AP/NAP 분류 정확도 측정
- [ ] MIMIC-III 도메인 별도 calibration 실험
- [ ] Pareto sweep 결과로 specialty별 최적 α 권고값 도출

---

## 참고문헌

- Angelopoulos, A. N., & Bates, S. (2021). *A gentle introduction to conformal prediction and distribution-free uncertainty quantification.* arXiv:2107.07511
- Tibshirani, R. J., et al. (2019). *Conformal prediction under covariate shift.* NeurIPS 2019.
- Jin, D., et al. (2021). *What disease does this patient have?* (MedQA). arXiv:2009.13081
- Zhu, S., et al. (2023). *Can LLMs express their uncertainty?* (MedAbstain). arXiv:2306.13063
- Johnson, A. E. W., et al. (2016). *MIMIC-III, a freely accessible critical care database.* Scientific Data.
- Yao, S., et al. (2023). *ReAct: Synergizing reasoning and acting in language models.* ICLR 2023.

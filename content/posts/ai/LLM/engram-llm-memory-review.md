---
title: "Engram: LLM에 '기억의 서랍'을 달아주다"
date: "2026-01-15"
description: "DeepSeek-AI & Peking University가 발표한 Engram 논문 리뷰. N-gram 해싱 기반 조건부 메모리로 MoE의 '조건부 계산'을 보완하여 추론 능력까지 향상시키는 원리를 정리합니다."
tags: ["AI", "LLM", "논문리뷰", "DeepSeek", "MoE", "메모리", "스케일링", "아키텍처"]
---

# Engram: LLM에 '기억의 서랍'을 달아주다

AI/LLM 시리즈 : Engram 논문 리뷰

여러분이 **"알렉산더 대왕"**이라는 단어를 처음 본다고 상상해보세요. 우리 뇌는 즉시 이 정보를 인식하고 관련 지식을 떠올립니다. 하지만 현재의 LLM은 이런 간단한 작업을 위해서도 여러 레이어의 복잡한 계산을 거쳐야 합니다.

> 비유: 전화번호부에서 번호를 찾는 대신, 매번 숫자를 하나씩 계산해서 맞춰보는 것과 같습니다.

DeepSeek-AI의 최신 연구 **Engram**은 바로 이 문제를 해결합니다.

- **논문**: Conditional Memory via Scalable Lookup: A New Axis of Sparsity for Large Language Models
- **기관**: DeepSeek-AI & Peking University
- **코드**: [github.com/deepseek-ai/Engram](https://github.com/deepseek-ai/Engram)

---

## 핵심 아이디어: 계산과 기억의 분리

언어를 이해하고 생성하는 작업은 크게 두 가지로 나뉩니다.

| 작업 유형 | 예시 | 요구사항 |
|---|---|---|
| 동적 추론 | "만약 A이고 B라면, C일 것이다" | 복잡한 계산 |
| 정적 지식 | "대한민국의 수도는 서울이다" | 빠른 검색 |

기존 Transformer 모델은 이 두 가지를 **모두 계산으로 처리**했습니다. Engram의 질문은 단순합니다. 정적 지식까지 매번 계산으로 "재구성"하는 건 낭비가 아닐까요?

**MoE(Mixture-of-Experts)** 가 "조건부 계산"으로 모델 용량을 확장했다면, Engram은 **"조건부 메모리"** 라는 새로운 축을 추가합니다.

---

## Engram의 작동 원리

### 1. N-gram 기반 해싱 룩업

```python
input_text = "알렉산더 대왕"

bigrams  = ["알렉산더", "대왕"]
trigrams = ["알렉산더 대왕"]

# 해시 함수로 인덱스 계산
indices = [hash_function(ngram) for ngram in bigrams + trigrams]

# O(1) 시간에 임베딩 테이블에서 검색
embeddings = [embedding_table[idx] for idx in indices]
memory_vector = concatenate(embeddings)
```

핵심: **O(1) 룩업** — 테이블 크기와 관계없이 일정한 시간에 검색 가능합니다.

### 2. 토크나이저 압축

일반 토크나이저의 문제는 `Apple ≠ apple ≠ ␣apple ≠ APPLE`처럼 의미는 같지만 다른 토큰으로 취급한다는 점입니다.

```python
def normalize_token(token):
    token = token.lower()
    token = remove_whitespace(token)
    token = normalize_unicode(token)
    return token
```

결과적으로 어휘 크기 **23% 감소**, 메모리 활용 효율성 및 의미 밀도가 향상됩니다.

### 3. 컨텍스트 인식 게이팅

검색된 메모리가 항상 유용한 건 아닙니다. 해시 충돌이나 다의어 문제가 있을 수 있죠.

```python
def context_aware_gating(hidden_state, retrieved_memory):
    query = RMSNorm(hidden_state)
    key   = W_K @ RMSNorm(retrieved_memory)
    value = W_V @ retrieved_memory

    similarity  = (query @ key.T) / sqrt(d_model)
    gate_score  = sigmoid(similarity)  # 0~1 사이 값

    # gate_score ≈ 1: 메모리가 문맥과 잘 맞음 → 활용
    # gate_score ≈ 0: 메모리가 문맥과 안 맞음 → 억제
    return gate_score * value
```

---

## 실험 결과

### 비교 설정 (모두 동일한 계산 비용: 3.8B 활성 파라미터, 262B 토큰)

| 모델 | 총 파라미터 | 활성 파라미터 | Engram |
|---|---|---|---|
| Dense-4B | 4.1B | 3.8B | - |
| MoE-27B | 26.7B | 3.8B | - |
| Engram-27B | 26.7B | 3.8B | 5.7B |
| Engram-40B | 39.5B | 3.8B | 18.5B |

### 결과 1: 지식 검색 (예상된 향상)

| 벤치마크 | MoE-27B | Engram-27B | 향상 |
|---|---|---|---|
| MMLU | 57.4 | 60.4 | +3.0 |
| CMMLU | 57.9 | 61.9 | +4.0 |
| TriviaQA | 48.8 | 50.7 | +1.9 |

### 결과 2: 추론 능력 (놀라운 향상)

| 벤치마크 | MoE-27B | Engram-27B | 향상 |
|---|---|---|---|
| BBH | 50.9 | 55.9 | **+5.0** |
| ARC-Challenge | 70.1 | 73.8 | **+3.7** |
| HumanEval | 37.8 | 40.8 | **+3.0** |
| MATH | 28.3 | 30.7 | +2.4 |

### 결과 3: 긴 컨텍스트 처리 (압도적)

| 태스크 | MoE-27B | Engram-27B | 향상 |
|---|---|---|---|
| Multi-Query NIAH | 84.2 | 97.0 | **+12.8** |
| Common Words Extraction | 73.0 | 99.6 | **+26.6** |

---

## 비밀의 메커니즘: "효과적인 깊이 증가"

### 왜 단순한 메모리가 추론 능력까지 향상시킬까?

**기존 LLM의 문제**: "Diana, Princess of Wales" 같은 엔티티를 완성하는 데 6개 레이어를 낭비합니다. 귀중한 레이어를 단순 패턴 조합에 소비하면 추론에 쓸 "유효 깊이"가 줄어듭니다.

**Engram의 해결책**:

```
Layer 2 + Engram:
  ├─ 백본: 기본 처리
  └─ Engram: "Diana, Princess of Wales" 직접 룩업! ⚡
  → 즉시 엔티티 인식 완료

Layer 3-30: 전부 진짜 추론에 사용 가능! 🎯
```

또한 **어텐션 용량도 해방**됩니다.

```
기존 Attention:
  ├─ 로컬 패턴 (30%) → "the", "of" 같은 연결
  └─ 전역 컨텍스트 (30%)

Engram + Attention:
  ├─ 로컬 패턴 (0%) → Engram이 처리!
  └─ 전역 컨텍스트 (60%) ← 2배 증가!
```

그래서 긴 컨텍스트 태스크에서 성능이 압도적으로 상승합니다.

---

## U자형 스케일링 법칙

**"고정된 파라미터 예산이 있을 때, MoE와 Engram에 각각 얼마나 할당해야 할까?"**

실험 결과 최적 혼합 비율은 **MoE 75% + Engram 25%** 입니다.

| 할당 비율 | 특징 | 문제점 |
|---|---|---|
| ρ = 100% (순수 MoE) | 동적 추론 강함 | 정적 지식을 비효율적으로 계산으로 재구성 |
| ρ = 0% (순수 Engram) | 지식 검색 강함 | 동적 추론 능력 부족 |
| **ρ ≈ 75~80% ⭐** | **최적 혼합** | **최적 성능** |

두 메커니즘이 구조적으로 상호보완적이라는 증거로, 단순 합이 아닌 **비선형 시너지**가 존재합니다.

---

## 무한 메모리 실험

계산 비용을 고정하고 메모리만 늘리면? 결과는 **로그-선형 스케일링**입니다.

```
Loss = a - b × log(Memory_Size)

a ≈ 1.81 (상한)
b ≈ 0.01 (스케일링 계수)
```

추가 계산 없이도 메모리 증가가 예측 가능한 성능 향상으로 이어집니다.

---

## 시스템 효율성: 결정론적 프리페칭

MoE는 은닉 상태 기반으로 라우팅하기 때문에 런타임에만 인덱스가 결정됩니다. 반면 Engram은 **해시 함수로 인덱스를 사전 계산**할 수 있어 프리페칭이 가능합니다.

**실험 결과 (100B 파라미터 테이블을 호스트 DRAM에 오프로드)**

| 모델 | 기준 처리량 (tok/s) | +Engram 처리량 (tok/s) | 오버헤드 |
|---|---|---|---|
| Dense-4B | 9,031.62 | 8,858.28 | **1.9%** |
| Dense-8B | 6,315.52 | 6,140.02 | **2.8%** |

100B 파라미터를 추가해도 처리량 감소가 3% 미만입니다.

---

## Ablation: 중요한 컴포넌트

| 컴포넌트 | 없앴을 때 Loss | 영향 |
|---|---|---|
| 전체 (기준) | 1.768 | - |
| Multi-branch | 1.773 (+0.005) | 🔥 높음 |
| Context gating | 1.778 (+0.010) | 🔥 높음 |
| Token compression | 1.775 (+0.007) | 🔥 높음 |
| Short conv | 1.769 (+0.001) | 💚 낮음 |

---

## 실무 적용 가이드

### 권장 상황

| 상황 | 예상 효과 |
|---|---|
| 지식 집약 도메인 (의료/법률/과학) | MMLU +3~4점 |
| 긴 컨텍스트 (32k+ 토큰) | NIAH +13점 수준 |
| 제한된 GPU + 풍부한 호스트 메모리 | 오버헤드 <3% |
| 다국어 모델 | 언어 전반 개선 |

### 구현 설정 예시

```python
engram_config = {
    "ngram_orders": [2, 3],       # 2-gram, 3-gram
    "num_heads": 8,
    "embedding_dim": 1280,        # 백본 dim의 50%
    "vocab_compression": True,
    "layers": [2, 15],            # 조기 + 중기 배치 (최적)
    "integration": "multi_branch",
    "lr_multiplier": 5.0,         # 임베딩 LR은 백본의 5배
    "weight_decay": 0.0
}

inference_config = {
    "offloading": {"enabled": True, "target": "host_memory"},
    "caching": {
        "l1_gpu": "1GB",
        "l2_dram": "100GB",
        "l3_ssd": "1TB"
    }
}
```

---

## 결론: 패러다임의 전환

Engram의 핵심 통찰은 세 가지입니다.

**첫째**, 동적 추론(MoE)과 정적 지식(Engram)을 구조적으로 분리하면 두 능력 모두 향상됩니다.

**둘째**, 예상 밖의 시너지가 발생합니다. 정적 지식 오프로드 → 초기 레이어 해방 → 효과적인 깊이 증가 → 추론 능력 향상의 연쇄 효과가 나타납니다.

**셋째**, 스케일링 법칙이 예측 가능합니다. U자형 최적 배분(MoE 75~80% / Engram 20~25%)과 로그-선형 메모리 확장으로 성능 향상이 예측 가능합니다.

Engram은 단순한 성능 개선 트릭이 아니라, 모델링 패러다임의 축을 하나 더 여는 접근으로 볼 수 있습니다.

**코드**: [github.com/deepseek-ai/Engram](https://github.com/deepseek-ai/Engram)

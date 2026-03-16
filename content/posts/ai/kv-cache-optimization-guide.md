---
title: "AI 추론 비용 줄이기 — KV Cache 완전 정복"
date: "2026-03-16"
description: "LLM 추론의 핵심 병목인 KV Cache의 원리부터 최신 최적화 기법(MLA, GQA, Sliding Window, Prefix Caching)까지 한 번에 정리합니다. vLLM PagedAttention과도 연결해서 설명합니다."
tags: ["AI", "LLM", "KV Cache", "추론최적화", "vLLM", "GQA", "MLA", "서빙"]
---

# AI 추론 비용 줄이기 — KV Cache 완전 정복

AI/LLM 시리즈 : KV Cache 완전 정복

이전에 vLLM의 PagedAttention을 다루면서 KV Cache가 LLM 서빙의 핵심 병목이라는 이야기를 했습니다. 오늘은 한 발 더 들어가서, KV Cache가 정확히 무엇인지, 왜 이렇게 크고, 어떤 방식으로 줄이고 있는지를 처음부터 끝까지 정리해보겠습니다.

---

## KV Cache가 왜 필요한가

LLM은 토큰을 하나씩 생성합니다. "안녕하세요"라는 5글자를 생성한다면, 사실 내부적으로는 이렇게 동작합니다.

```
1단계: "안" 생성을 위해 프롬프트 전체를 Attention 계산
2단계: "녕" 생성을 위해 프롬프트 + "안" 전체를 Attention 계산
3단계: "하" 생성을 위해 프롬프트 + "안녕" 전체를 Attention 계산
...
```

매 스텝마다 이전 모든 토큰에 대한 Attention을 다시 계산하면, T번째 토큰을 생성할 때 **1 + 2 + 3 + ... + T = O(T²)** 번의 연산이 필요합니다. 100토큰 생성에 10,000번, 1,000토큰 생성에 1,000,000번.

그런데 생각해보면, 이미 생성한 토큰들의 Key와 Value는 **변하지 않습니다**. 다음 토큰을 생성할 때도 동일한 값입니다. 그렇다면 한 번 계산한 K, V를 저장해두고 재사용하면 됩니다. 이것이 **KV Cache**입니다.

```
KV Cache 없음: 매 스텝 O(T) 연산 × T 스텝 = O(T²)
KV Cache 있음: 새 토큰의 K, V만 추가 = O(T) 전체
```

---

## KV Cache의 크기는 얼마나 될까

KV Cache가 크다는 건 알겠는데, 정확히 얼마나 클까요? 계산해봅시다.

```
KV Cache 크기 = 2 × (레이어 수) × (헤드 수) × (헤드 차원) × (시퀀스 길이) × (배치 크기) × (dtype 크기)
```

LLaMA-3 8B를 예시로 계산하면:

```
레이어 수: 32
헤드 수: 8 (GQA 기준)
헤드 차원: 128
시퀀스 길이: 8,192
배치 크기: 1
dtype: FP16 (2 bytes)

KV Cache = 2 × 32 × 8 × 128 × 8,192 × 1 × 2 bytes
         ≈ 1.07 GB
```

배치 크기가 32라면? **34 GB**. 모델 가중치(16GB)보다 KV Cache가 더 많은 메모리를 차지합니다. 긴 컨텍스트나 대규모 배치를 처리하면 GPU 메모리가 KV Cache에 잠식됩니다.

---

## 접근법 1: GQA — 헤드 수를 줄이자

가장 직접적인 해결책은 KV 헤드 수를 줄이는 것입니다.

일반적인 **Multi-Head Attention(MHA)** 에서는 Q, K, V 헤드 수가 모두 같습니다. 헤드가 32개면 K, V도 32세트씩 필요합니다.

**Multi-Query Attention(MQA)** 은 극단적으로, K와 V를 헤드 1개로 줄입니다. Q는 여전히 32개지만, K, V는 1개를 공유합니다. 메모리는 32배 줄지만, 품질이 다소 떨어집니다.

**Grouped-Query Attention(GQA)** 은 그 중간입니다. Q 헤드 32개를 N개의 그룹으로 나누고, 각 그룹이 K, V 헤드 1개를 공유합니다. LLaMA-3, Mistral, Gemma 등 최신 모델 대부분이 GQA를 채택하고 있습니다.

```python
import torch
import torch.nn.functional as F

def grouped_query_attention(Q, K, V, num_kv_heads):
    """
    Q: (batch, seq, num_q_heads, head_dim)
    K, V: (batch, seq, num_kv_heads, head_dim)
    """
    batch, seq, num_q_heads, head_dim = Q.shape
    num_kv_heads = K.shape[2]
    groups = num_q_heads // num_kv_heads

    # K, V를 Q 헤드 수에 맞게 확장
    # (batch, seq, num_kv_heads, head_dim)
    # → (batch, seq, num_q_heads, head_dim)
    K = K.repeat_interleave(groups, dim=2)
    V = V.repeat_interleave(groups, dim=2)

    # 표준 Attention 계산
    scale = head_dim ** -0.5
    scores = torch.einsum('bshd,bthd->bsht', Q, K) * scale
    weights = F.softmax(scores, dim=-1)
    output = torch.einsum('bsht,bthd->bshd', weights, V)

    return output

# 예시: Q 16헤드, KV 4헤드 (4그룹)
batch, seq, head_dim = 2, 512, 64
Q = torch.randn(batch, seq, 16, head_dim)
K = torch.randn(batch, seq, 4, head_dim)
V = torch.randn(batch, seq, 4, head_dim)

output = grouped_query_attention(Q, K, V, num_kv_heads=4)
print(f"KV Cache 절약: {16/4}×")  # 4배 절약
```

GQA로 KV 헤드를 4분의 1로 줄이면 KV Cache도 4분의 1이 됩니다. 품질 손실은 MQA보다 훨씬 적습니다.

---

## 접근법 2: MLA — 저랭크 압축

DeepSeek-V2에서 제안된 **Multi-Head Latent Attention(MLA)** 은 더 급진적인 방법입니다. K와 V를 저차원 잠재 벡터로 압축해서 저장하고, 필요할 때 복원합니다.

```
기존 KV Cache: K (d_model 차원), V (d_model 차원) 각각 저장

MLA: 저차원 벡터 c (d_c << d_model) 하나만 저장
     추론 시: K = W_K × c, V = W_V × c 로 복원
```

압축 비율이 K, V의 합산 크기 대비 최대 **93.3%** 로, 실질적으로 KV Cache를 대폭 줄이면서도 품질을 유지합니다. DeepSeek-V2가 추론 비용 측면에서 주목받은 이유 중 하나입니다.

---

## 접근법 3: Sliding Window Attention

긴 문서를 처리할 때, 토큰이 **멀리 떨어진 모든 토큰**에 주의를 기울일 필요가 있을까요?

Mistral이 채택한 **Sliding Window Attention** 은 각 토큰이 직전 W개의 토큰에만 Attention을 수행합니다. 예를 들어 W=4096이면, KV Cache는 항상 4096 토큰분만 유지됩니다. 시퀀스가 아무리 길어도 KV Cache 크기가 고정됩니다.

```
일반 Attention (토큰 10이 본다):
tokens: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
attend:  ↑  ↑  ↑  ↑  ↑  ↑  ↑  ↑  ↑  ↑  (전부)

Sliding Window (W=4) Attention:
tokens: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
attend:                    ↑  ↑  ↑  ↑  (최근 4개만)
```

물론 멀리 있는 정보를 놓칠 수 있습니다. 이를 보완하기 위해 일부 레이어는 전체 Attention을 유지하는 방식(Mistral의 일부 레이어)을 사용합니다.

---

## 접근법 4: Prefix Caching

실제 서비스에서 동일한 시스템 프롬프트가 모든 요청에 반복됩니다.

```
요청 1: [시스템 프롬프트 1000토큰] + [사용자 질문 A]
요청 2: [시스템 프롬프트 1000토큰] + [사용자 질문 B]
요청 3: [시스템 프롬프트 1000토큰] + [사용자 질문 C]
```

시스템 프롬프트의 KV를 매번 계산하는 건 낭비입니다. 한 번 계산해두고 재사용할 수 있습니다. 이것이 **Prefix Caching** 또는 **Prompt Caching**입니다.

vLLM에서는 `enable_prefix_caching=True` 옵션 하나로 활성화할 수 있습니다.

```python
from vllm import LLM, SamplingParams

llm = LLM(
    model="meta-llama/Llama-3-8B-Instruct",
    enable_prefix_caching=True  # 이 옵션 하나로 활성화
)

# 동일한 시스템 프롬프트를 가진 여러 요청
system_prompt = "당신은 친절한 AI 어시스턴트입니다. " * 200  # 긴 시스템 프롬프트

requests = [
    f"{system_prompt}\n\n사용자: {question}"
    for question in ["안녕하세요", "날씨가 어때요", "뭘 도와드릴까요"]
]

# 첫 요청은 전체 계산, 이후 요청은 시스템 프롬프트 KV 재사용
outputs = llm.generate(requests, SamplingParams(max_tokens=100))
```

Anthropic의 Claude API에서도 `cache_control` 파라미터로 Prompt Caching을 지원합니다. 캐시 히트 시 입력 토큰 비용이 **90% 절감**됩니다.

---

## 각 기법의 효과 비교

| 기법 | KV Cache 절약 | 품질 영향 | 적용 난이도 |
|---|---|---|---|
| MHA (기준) | 기준 | 기준 | - |
| GQA (헤드 4분의 1) | ~75% 절약 | 매우 작음 | 학습 시 적용 |
| MLA | ~93% 절약 | 작음 | 학습 시 적용 |
| Sliding Window | 고정 크기 | 도메인에 따라 다름 | 학습 시 적용 |
| Prefix Caching | 반복 프롬프트 절약 | 없음 | 추론 시 적용 |
| PagedAttention | 단편화 제거 | 없음 | 추론 시 적용 |

마지막 두 가지(Prefix Caching, PagedAttention)는 모델을 재학습하지 않고 추론 엔진 레벨에서 적용할 수 있습니다. 기존 모델을 그대로 쓰면서 성능을 높이고 싶다면 가장 빠른 선택입니다.

---

## 마무리

KV Cache는 LLM 추론의 핵심이면서 동시에 가장 큰 메모리 병목입니다. 하지만 그만큼 최적화 여지도 많고, 실제로 다양한 기법들이 빠르게 발전하고 있습니다.

정리하면 이렇습니다. 모델을 새로 학습할 수 있다면 GQA나 MLA를 적용해 구조적으로 줄이는 것이 가장 효과적입니다. 기존 모델을 서빙한다면 Prefix Caching과 PagedAttention을 조합하는 것이 실용적입니다. Sliding Window는 긴 문서 처리가 핵심인 도메인에서 유효합니다.

비용이 점점 중요해지는 LLM 서빙 환경에서, KV Cache 최적화는 이제 선택이 아니라 필수가 되어가고 있습니다.

**참고 자료**
- Pope et al. (2022). "Efficiently Scaling Transformer Inference." arXiv:2211.05100
- Ainslie et al. (2023). "GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints." arXiv:2305.13245
- DeepSeek-AI (2024). "DeepSeek-V2: A Strong, Economical, and Efficient Mixture-of-Experts Language Model." arXiv:2405.04434
- [vLLM Prefix Caching 문서](https://docs.vllm.ai/en/latest/automatic_prefix_caching/apc.html)

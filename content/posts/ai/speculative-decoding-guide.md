---
title: "Speculative Decoding: 작은 모델로 큰 모델을 빠르게 만들기"
date: "2026-03-16"
description: "LLM 추론의 자기회귀 병목을 해결하는 Speculative Decoding의 원리를 파헤칩니다. 드래프트 모델, 검증 메커니즘, 수용률, 그리고 Self-Speculative Decoding까지 한 번에 정리합니다."
tags: ["AI", "LLM", "추론최적화", "Speculative Decoding", "서빙", "vLLM", "속도"]
---

# Speculative Decoding: 작은 모델로 큰 모델을 빠르게 만들기

AI/LLM 시리즈 : Speculative Decoding 완전 정복

KV Cache, PagedAttention, RadixAttention... 지금까지 LLM 추론 최적화를 메모리 관점에서 살펴봤습니다. 오늘은 다른 각도에서 병목을 공략하는 기법인 **Speculative Decoding**을 다뤄보겠습니다.

메모리를 아무리 효율적으로 써도 해결되지 않는 문제가 하나 있습니다. LLM은 토큰을 **한 번에 하나씩** 생성한다는 것입니다.

---

## 자기회귀(Auto-regressive)의 벽

LLM의 텍스트 생성 구조를 다시 생각해보면 이렇습니다.

```
"안녕하세요" 생성 과정:
스텝 1: 모델 전체 포워드 패스 → "안" 생성
스텝 2: 모델 전체 포워드 패스 → "녕" 생성
스텝 3: 모델 전체 포워드 패스 → "하" 생성
스텝 4: 모델 전체 포워드 패스 → "세" 생성
스텝 5: 모델 전체 포워드 패스 → "요" 생성
```

70B 모델이 5글자를 만들려면 70B 모델의 포워드 패스를 5번 돌려야 합니다. 토큰 생성은 본질적으로 직렬(sequential) 작업이기 때문에, 아무리 GPU가 병렬 연산에 뛰어나도 이 병목을 피할 수 없습니다.

여기서 핵심적인 관찰이 하나 있습니다.

> **큰 모델의 포워드 패스는 토큰 1개를 생성할 때나, 토큰 여러 개를 검증할 때나 걸리는 시간이 비슷하다.**

GPU는 행렬 연산을 병렬로 처리합니다. 토큰 1개짜리 시퀀스를 처리하든, 토큰 8개짜리 시퀀스를 처리하든, 배치 크기가 적당히 작다면 GPU 연산 시간은 크게 다르지 않습니다. 이 성질을 활용한 것이 Speculative Decoding입니다.

---

## 핵심 아이디어: 추측하고 검증하기

Speculative Decoding의 아이디어는 이렇습니다.

```
1. 작고 빠른 드래프트 모델이 토큰 K개를 먼저 "추측"
2. 큰 타겟 모델이 K개를 한 번에 "검증"
3. 틀린 토큰이 나오기 전까지 전부 채택
4. 틀린 부분부터 타겟 모델의 결과로 수정
```

실제로 어떻게 되는지 예시로 보겠습니다.

```
타겟 모델: LLaMA-3 70B
드래프트 모델: LLaMA-3 8B

입력: "파이썬에서 리스트를 정렬하는 방법은"

드래프트 모델이 4토큰 추측:
  [sorted] [함수를] [사용하거나] [list]

타겟 모델이 한 번에 검증:
  [sorted] ✅  [함수를] ✅  [사용하거나] ✅  [list] ❌

결과:
  "sorted 함수를 사용하거나" 채택 (3토큰)
  "sort" 생성 (타겟 모델 결과로 교체)

총 1번의 타겟 모델 포워드 패스로 4토큰 생성!
```

드래프트 모델이 맞혔다면 타겟 모델 포워드 패스 1번으로 K토큰을 얻는 셈입니다. 가속 비율은 드래프트 모델이 얼마나 잘 맞히느냐, 즉 **수용률(acceptance rate)** 에 달려 있습니다.

---

## 수학적으로 올바른가: 거절 샘플링

"타겟 모델이 동의하지 않는 토큰을 버린다"는 건 직관적으로 이해됩니다. 그런데 이렇게 하면 출력 분포가 달라지지 않을까요?

Speculative Decoding은 **거절 샘플링(rejection sampling)** 이론을 기반으로 설계되어 있어, 타겟 모델의 출력 분포를 **정확히 보존**합니다.

구체적으로는 이렇게 동작합니다. 드래프트 모델이 토큰 x를 확률 q(x)로 추측했고, 타겟 모델은 같은 위치에서 x를 확률 p(x)로 생성했을 때, 다음 규칙으로 수용 여부를 결정합니다.

```
수용 확률 = min(1, p(x) / q(x))

p(x) >= q(x): 항상 수용
  → 타겟 모델이 드래프트보다 이 토큰을 더 선호하면 무조건 채택

p(x) < q(x): p(x)/q(x) 확률로만 수용
  → 드래프트가 타겟보다 이 토큰에 너무 큰 확률을 줬다면 확률적으로 기각
```

거절된 경우에는 타겟 모델의 수정된 분포에서 새로 샘플링합니다. 이 과정을 통해 최종 출력이 마치 타겟 모델만 사용한 것과 동일한 분포를 따르게 됩니다. 속도는 빨라지지만 품질은 전혀 저하되지 않습니다.

---

## 드래프트 모델 선택이 성능을 좌우한다

Speculative Decoding의 실질적인 속도 향상은 두 가지 요소가 결정합니다.

**드래프트 모델의 속도**: 드래프트 모델 자체가 느리면 추측하는 데 너무 많은 시간이 걸립니다. 타겟 모델의 10분의 1 이하 크기가 적당합니다.

**수용률**: 드래프트 모델의 예측이 타겟 모델과 얼마나 일치하느냐입니다. 수용률이 높을수록 한 번의 검증으로 더 많은 토큰을 얻습니다. 일반적으로 같은 계열의 모델(예: LLaMA-3 8B + LLaMA-3 70B)이 수용률이 높습니다.

실제로 자주 쓰이는 드래프트-타겟 조합은 이렇습니다.

| 타겟 모델 | 드래프트 모델 | 일반적인 수용률 |
|---|---|---|
| LLaMA-3 70B | LLaMA-3 8B | 75~85% |
| Gemma 27B | Gemma 2B | 70~80% |
| Qwen2.5 72B | Qwen2.5 7B | 75~85% |
| DeepSeek-R1 671B | DeepSeek-R1 7B | 70~80% |

수용률 80%에서 드래프트 4토큰 추측 시, 기대 수용 토큰 수는 약 3.4개입니다. 타겟 모델 포워드 패스 1회로 평균 3.4토큰을 얻으므로 3배 이상 빠릅니다.

---

## 구현: vLLM에서 Speculative Decoding 쓰기

vLLM은 Speculative Decoding을 직접 지원합니다.

```python
from vllm import LLM, SamplingParams

# 드래프트 모델을 지정하여 Speculative Decoding 활성화
llm = LLM(
    model="meta-llama/Llama-3.1-70B-Instruct",
    speculative_model="meta-llama/Llama-3.2-1B-Instruct",
    num_speculative_tokens=5,     # 한 번에 추측할 토큰 수
    speculative_draft_tensor_parallel_size=1,
)

sampling_params = SamplingParams(temperature=0.8, max_tokens=256)

prompts = [
    "파이썬으로 퀵소트를 구현해줘.",
    "트랜스포머 아키텍처를 설명해줘.",
]

outputs = llm.generate(prompts, sampling_params)

for output in outputs:
    print(output.outputs[0].text)
```

드래프트 모델 없이 **n-gram 매칭**으로도 Speculative Decoding을 쓸 수 있습니다. 프롬프트 내에서 반복되는 패턴을 드래프트로 활용하는 방식입니다. 별도 모델이 필요 없어 간단합니다.

```python
llm = LLM(
    model="meta-llama/Llama-3.1-70B-Instruct",
    speculative_model="[ngram]",  # 드래프트 모델 대신 n-gram
    num_speculative_tokens=5,
    ngram_prompt_lookup_max=4,    # 최대 4-gram 매칭
)
```

---

## Self-Speculative Decoding: 모델 하나로

드래프트 모델을 별도로 띄우는 것이 부담스럽다면? **Self-Speculative Decoding**이 대안입니다.

아이디어는 같은 모델의 **앞쪽 레이어만** 먼저 실행해서 드래프트를 만들고, 전체 레이어로 검증하는 방식입니다. 일부 레이어를 건너뛰는 **레이어 스키핑(early exit)** 기법으로 드래프트를 생성합니다.

```
일반 70B 포워드 패스 (80 레이어):
레이어 1 → 2 → ... → 80 → 토큰 1개

Self-Speculative:
드래프트: 레이어 1 → 2 → ... → 20 (early exit) → 추측 4토큰
검증:     레이어 1 → 2 → ... → 80 → 4토큰 한 번에 검증
```

별도 드래프트 모델이 필요 없어 메모리 오버헤드가 없고, 같은 모델이므로 지식 공유로 수용률이 높습니다. 단, early exit 레이어를 어디서 끊느냐를 잘 조정해야 합니다.

---

## 언제 Speculative Decoding이 효과적인가

모든 상황에서 Speculative Decoding이 빠른 건 아닙니다.

**효과적인 경우**: 배치 크기가 작을 때, 즉 동시 요청이 적을 때입니다. GPU가 이미 포화 상태라면 드래프트 추측과 검증 모두 느려집니다. 코드 생성, 문서 요약처럼 예측 가능한 출력 패턴일 때 수용률이 높아 효과적입니다.

**효과가 떨어지는 경우**: 배치 크기가 매우 클 때는 GPU가 이미 충분히 활용되어 추가 효과가 없습니다. 창의적 글쓰기처럼 다양한 출력이 필요한 경우 드래프트 수용률이 떨어집니다.

---

## 마무리

지금까지 LLM 추론 최적화 시리즈를 정리해보면 이렇습니다.

| 기법 | 해결하는 문제 | 핵심 아이디어 |
|---|---|---|
| PagedAttention | KV Cache 단편화 | OS 페이징을 KV에 적용 |
| RadixAttention | 중복 Prefill 계산 | Radix Tree로 자동 재사용 |
| GQA/MLA | KV Cache 크기 | 헤드/차원 압축 |
| Speculative Decoding | 직렬 생성 병목 | 드래프트로 병렬 추측·검증 |

Speculative Decoding은 "큰 모델의 품질을 유지하면서 속도를 높이는" 가장 우아한 방법 중 하나입니다. 수학적으로 출력 분포가 보장되기 때문에 품질 저하 없이 순수하게 속도만 올릴 수 있다는 점이 특히 매력적입니다.

**참고 자료**
- Leviathan et al. (2022). "Fast Inference from Transformers via Speculative Decoding." arXiv:2211.17192
- Chen et al. (2023). "Accelerating Large Language Model Decoding with Speculative Sampling." arXiv:2302.01318
- [vLLM Speculative Decoding 문서](https://docs.vllm.ai/en/latest/features/spec_decode.html)

---
title: 'Mamba-3: 상태 공간 원리로 시퀀스 모델링을 한 단계 끌어올리다'
date: '2026-03-26'
description: >-
  Mamba-3는 기존 Mamba-2의 한계(상태 추적 취약, 하드웨어 비효율)를 복소수 SSM, 사다리꼴 이산화, MIMO 세 가지 개선으로
  극복해 Transformer보다 빠르고 더 정확한 언어 모델을 구현한 논문입니다. 
tags:
  - Mamba
  - Transformer
---

> **논문**: *Mamba-3: Improved Sequence Modeling using State Space Principles*  
> **저자**: Aakash Lahoti, Kevin Y. Li, Berlin Chen, Caitlin Wang, Aviv Bick, J. Zico Kolter, Tri Dao, Albert Gu  
> **소속**: Carnegie Mellon University, Princeton University, Together AI, Cartesia AI  
> **arXiv**: [2603.15569](https://arxiv.org/abs/2603.15569) (2026년 3월 16일)

---

## 들어가며

LLM(대형 언어 모델)의 발전에서 **추론(inference) 효율**은 이제 학습(training) 효율만큼이나 중요한 문제가 되었습니다. Chain-of-thought, 반복적 정제(iterative refinement) 같은 테스트-타임 컴퓨팅 기법이 주목받으면서, 실제 배포 환경에서 모델이 얼마나 빠르고 효율적으로 작동하느냐가 AI 시스템의 실질적 가치를 결정짓는 시대입니다.

Transformer는 여전히 업계 표준이지만, **KV 캐시로 인한 선형 메모리 증가**와 **Self-Attention의 이차(quadratic) 연산량**이라는 구조적 병목을 안고 있습니다. 이를 극복하기 위해 등장한 것이 **State Space Model(SSM)** 계열 아키텍처입니다.

Mamba-1과 Mamba-2는 이 SSM 접근법에서 큰 성공을 거뒀지만, 여전히 몇 가지 한계가 있었습니다. Mamba-3는 바로 그 한계들을 정면으로 돌파한 모델입니다.

---

## 기존 모델의 한계: 왜 Mamba-3가 필요한가?

Mamba-2는 훈련 속도와 단순성을 높이기 위해 **표현력(expressivity)을 일부 희생**했습니다. 그 결과:

1. **State Tracking 취약**: 비트 시퀀스의 홀짝성(parity) 같은 단순한 상태 추적 작업에서도 실패하는 경우가 보고되었습니다.
2. **하드웨어 비효율**: 이론적으로는 선형 추론이지만, 실제로는 디코딩 단계의 연산 강도(arithmetic intensity)가 낮아 GPU 상당 부분이 유휴 상태로 남았습니다.
3. **이론적 근거 미비**: Mamba-1/2의 이산화(discretization) 방식은 휴리스틱에 의존했으며, 공식적인 이론적 정당화가 없었습니다.

---

## Mamba-3의 세 가지 핵심 혁신

Mamba-3는 **추론 우선(inference-first)** 관점에서 세 가지 방법론적 개선을 도입합니다.

### 1. 지수-사다리꼴 이산화 (Exponential-Trapezoidal Discretization)

기존 Mamba-1/2는 시변(time-varying) SSM의 이산화를 위해 이론적 정당화 없이 근사 기법을 사용해 왔습니다. Mamba-3는 이를 체계화한 **지수-조정 이산화 프레임워크(Exponential-Adjusted Discretization)**를 제시합니다.

이 프레임워크에서:
- **Exponential-Euler**: 기존 Mamba-1/2의 휴리스틱을 이론적으로 형식화한 방법
- **Exponential-Trapezoidal**: Mamba-3에서 사용하는 더 표현력 있는 일반화 방법

사다리꼴 규칙은 단순히 끝점(endpoint)만 쓰는 오일러 방식과 달리, **양 끝점의 평균**을 활용해 더 정확한 적분 근사를 제공합니다. 이를 통해 SSM 입력에 암묵적 합성곱(implicit convolution)이 내재됩니다. 결과적으로 **기존 순환 모델에서 필수적이라 여겨졌던 단기 인과 합성곱(short causal convolution)을 대체**할 수 있게 됩니다.

```
이산화 방법 비교:
- Exponential-Euler (Mamba-1/2): αt = exp(ΔtAt), γt = Δt
- Exponential-Trapezoidal (Mamba-3): αt = exp(ΔtAt), βt = (1-λt)Δt·exp(ΔtAt), γt = λtΔt
```

### 2. 복소수 상태 공간 모델 (Complex-valued SSM)

Mamba-3의 가장 흥미로운 기여 중 하나입니다. SSM의 상태를 **복소수(complex-valued)**로 만들어 Mamba-2보다 훨씬 풍부한 상태 업데이트 규칙을 구현합니다.

핵심 인사이트:
- 복소수 상태 업데이트는 **데이터 의존적 회전 임베딩(data-dependent rotary embedding, RoPE)**과 수학적으로 동치임을 증명
- RoPE와 유사한 방식으로 **효율적인 계산** 가능
- Mamba-2가 랜덤 추측 수준에 머물던 산술적 state-tracking 합성 과제를 **거의 완벽하게 해결**

이 변화는 추가적인 학습/추론 비용 없이도 모델의 **상태 추적 능력을 근본적으로 개선**합니다.

### 3. 다중 입출력 SSM: MIMO (Multi-Input, Multi-Output)

기존 SSM은 상태 업데이트 시 **외적(outer-product)** 기반 연산을 사용했습니다. Mamba-3(MIMO)는 이를 **행렬 곱셈(matrix multiplication)** 기반으로 전환합니다.

이는 신호 처리 관점에서 SISO(단일 입출력) → MIMO(다중 입출력) 동역학으로의 일반화와 정확히 일치합니다.

**왜 이게 중요한가?**
- 디코딩 단계는 메모리-바운드(memory-bound) 작업이라, FLOPs를 늘려도 지연 시간이 크게 증가하지 않습니다.
- MIMO는 **상태 크기 증가 없이** 더 많은 연산을 디코딩에 투입해 GPU 활용률을 높입니다.
- Mamba-2 대비 디코딩 FLOPs **최대 4배 향상**, 벽시계 지연 시간(wall-clock latency)은 유사하게 유지

---

## 실험 결과

### 언어 모델링 품질 (1.5B 스케일)

| 모델 | 다운스트림 정확도 (상대적 향상) |
|------|-------------------------------|
| Transformer | 기준선 |
| Mamba-2 | Transformer보다 낮음 |
| Gated DeltaNet (GDN) | 차선 모델 |
| **Mamba-3 (SISO)** | GDN 대비 **+0.6 pp** |
| **Mamba-3 (MIMO)** | Transformer 대비 **+2.2 pp**, Mamba-2 대비 **+1.9 pp**, GDN 대비 **+1.8 pp** |

### 상태 크기 효율성

Mamba-3 (MIMO)는 **상태 크기 64**로 **상태 크기 128**의 Mamba-2와 동등한 perplexity를 달성합니다. 즉, **절반의 상태 크기로 같은 성능** → 추론 속도 향상으로 직결됩니다.

### 상태 추적 능력

복소수 SSM 적용 시:
- Mamba-2: 랜덤 추측 수준 (≈ 50%)
- Mamba-3 (RoPE-like 없음): 랜덤 추측 수준
- **Mamba-3 (RoPE-like 적용)**: 합성 산술 과제에서 **거의 완벽한 해결**

---

## 아키텍처 관점에서의 의의

이 세 가지 혁신은 모두 **SSM 중심적 관점**에서 자연스럽게 도출된다는 점이 주목할 만합니다. 선형 어텐션이나 테스트-타임 회귀(test-time regression) 관점에서는 즉각적으로 떠오르기 어려운 개선들입니다.

또한 Mamba-3는 이론과 실제의 간극을 메우는 데도 기여합니다:
- 기존 Mamba 계열의 이산화 방식에 **공식적인 이론적 기반** 제공
- 복소수 SSM의 **RoPE와의 동치성** 증명
- MIMO 전환의 **신호 처리 이론적 근거** 제시

---

## 한계 및 향후 방향

논문이 명시적으로 다루지는 않지만, 몇 가지 고려할 점이 있습니다:

- **하이브리드 모델 적용**: 실제 대규모 배포에서는 순수 SSM보다 Transformer-Mamba 하이브리드가 주류입니다. Mamba-3 레이어가 하이브리드 아키텍처에서 얼마나 효과적인지 추가 검증이 필요합니다.
- **더 큰 스케일 검증**: 1.5B 수준에서의 실험이 중심입니다. 7B, 70B+ 스케일로의 확장 실험이 이어질 것으로 기대됩니다.
- **롱 컨텍스트 성능**: 상수 메모리라는 구조적 특성이 초장문 컨텍스트에서 어떤 Trade-off를 만드는지 심층 분석이 필요합니다.

---

## 결론

Mamba-3는 단순히 Mamba-2의 후속작이 아닙니다. **이론적 근거 강화, 새로운 능력 획득, 하드웨어 효율 개선**이라는 세 축에서 동시에 의미 있는 전진을 이룬 모델입니다.

특히 주목할 점은 **추론 우선(inference-first) 설계 철학**입니다. 훈련 효율을 위해 추론 표현력을 희생했던 Mamba-2의 방향을 뒤집어, 실제 배포 환경에서의 효율을 최우선으로 삼았습니다.

LLM의 효율적 추론이 갈수록 중요해지는 시대에, Mamba-3는 **성능-효율 파레토 프론티어를 실질적으로 전진시킨** 모델로 평가받을 만합니다.

코드는 공식 저장소에서 확인할 수 있습니다: [https://github.com/state-spaces/mamba](https://github.com/state-spaces/mamba)

---

*이 글은 arXiv:2603.15569 논문을 바탕으로 작성되었습니다.*

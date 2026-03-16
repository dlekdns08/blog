---
title: "Prefill-Decode 분리(PD Disaggregation): LLM 서빙의 새로운 표준"
date: "2026-03-16"
description: "2025년 LLM 서빙의 표준이 된 Prefill-Decode 분리(PD Disaggregation)의 원리를 파헤칩니다. Prefill과 Decode가 왜 다른 자원을 필요로 하는지, TTFT와 TPOT를 동시에 잡는 방법, DistServe에서 NVIDIA Dynamo까지 정리합니다."
tags: ["AI", "LLM", "추론최적화", "서빙", "DistServe", "PD분리", "TTFT", "TPOT", "vLLM", "SGLang"]
---

# Prefill-Decode 분리(PD Disaggregation): LLM 서빙의 새로운 표준

AI/LLM 시리즈 : Prefill-Decode Disaggregation 완전 정복

LLM 추론 최적화 시리즈를 이어가겠습니다. PagedAttention, RadixAttention, Speculative Decoding까지 살펴봤는데, 오늘 주제는 2024년에 "과격한 아이디어"로 여겨지다가 2025년에 갑자기 **업계 표준**이 된 기술입니다.

18개월 전 DistServe 논문에서 제안된 이 아이디어는 처음에 오픈소스 커뮤니티로부터 많은 반박을 받았고, 2024년 내내 광범위한 채택을 보지 못했습니다. 하지만 2025년에 갑자기 판도가 바뀌었습니다. Disaggregation은 거의 모든 주요 LLM 서빙 스택의 기본 전략이 되었습니다.

---

## LLM 추론의 두 단계

먼저 LLM 추론이 어떻게 두 단계로 나뉘는지 정리합니다.

**Prefill**: 입력 프롬프트 전체를 한 번에 병렬로 처리해서 KV Cache를 채우는 단계입니다. 토큰이 많아도 병렬로 한 번에 처리하기 때문에 **연산 집약적(Compute-bound)** 입니다. 이 단계가 끝나야 첫 번째 토큰이 나옵니다.

**Decode**: KV Cache를 재사용하면서 토큰을 하나씩 생성하는 단계입니다. 연산량은 적지만 매 스텝마다 KV Cache 전체를 읽어야 하므로 **메모리 대역폭 집약적(Memory-bound)** 입니다.

두 단계가 요구하는 자원이 근본적으로 다릅니다.

| 구분 | Prefill | Decode |
|---|---|---|
| 특성 | Compute-bound | Memory-bound |
| 병렬성 | 토큰 전체를 한 번에 | 토큰 1개씩 순차 |
| GPU 사용 | 연산 코어를 많이 | 메모리 대역폭을 많이 |
| 지연 지표 | TTFT (첫 토큰까지 시간) | TPOT (토큰당 생성 시간) |

---

## 문제: 두 단계가 같은 GPU를 쓰면 서로 방해한다

기존에는 Prefill과 Decode를 같은 GPU에서 함께 처리했습니다. 여러 요청이 동시에 들어오면 GPU가 Prefill과 Decode를 번갈아 처리해야 합니다.

```
기존 방식 (혼합 처리):

GPU: [Prefill A] → [Decode B] → [Decode C] → [Prefill D] → [Decode A] → ...
                    ↑                            ↑
             Decode가 Prefill을           Prefill이 Decode를
             기다려야 함                  기다려야 함
```

GPU가 연산이 무거운 Prefill 작업에 점유되어 있으면 Decode 작업은 기다려야 합니다. 이는 ITL(Inter-Token Latency)을 증가시키고, 반대로 Decode가 GPU를 점유하면 Prefill이 기다려야 하는 상황이 반복됩니다.

결과적으로 TTFT와 TPOT 사이에 **피할 수 없는 트레이드오프**가 생깁니다. Prefill을 빨리 처리하면 Decode가 느려지고, Decode를 우선하면 첫 토큰이 늦게 나옵니다.

---

## 해결책: Prefill과 Decode를 분리된 GPU에서

PD Disaggregation의 아이디어는 단순합니다.

> Prefill 전용 GPU 풀과 Decode 전용 GPU 풀을 따로 운영하자.

```
PD 분리 방식:

Prefill 노드 (연산 최적화):
  요청 → [Prefill A] → [Prefill B] → [Prefill C] → ...
         KV Cache 생성 완료 후 Decode 노드로 전송

Decode 노드 (메모리 대역폭 최적화):
  KV Cache 수신 → [Decode A] → [Decode B] → [Decode C] → ...
  (Prefill 방해 없이 연속 Decode)
```

Prefill 노드는 Prefill만 처리하므로 중단 없이 계산을 이어갈 수 있습니다. Decode 노드는 Decode만 처리하므로 연속 배칭(continuous batching)이 훨씬 안정적입니다. 두 단계를 **각각 독립적으로 스케일링**할 수 있습니다.

---

## TTFT와 TPOT를 동시에 잡는다

PD Disaggregation의 핵심 가치는 TTFT와 TPOT를 **동시에** 최적화할 수 있다는 점입니다.

```
기존 혼합 방식:
TTFT 개선 → Prefill 우선 → Decode 지연 → TPOT 악화
TPOT 개선 → Decode 우선 → Prefill 지연 → TTFT 악화

PD 분리 방식:
Prefill 노드: TTFT 독립 최적화 (방해 없음)
Decode 노드: TPOT 독립 최적화 (방해 없음)
→ 두 지표 동시 개선 가능
```

Prefill 노드 수와 Decode 노드 수의 비율을 워크로드에 맞게 조정할 수 있습니다. 입력이 긴 워크로드라면 Prefill 노드를 더 늘리고, 출력이 긴 워크로드라면 Decode 노드를 더 늘립니다.

---

## KV Cache 전송: 핵심 엔지니어링 과제

분리는 좋은데, 문제가 하나 있습니다. Prefill이 끝나면 생성된 KV Cache를 Decode 노드로 넘겨야 합니다. 이 전송이 느리면 분리의 이점이 사라집니다.

Perplexity의 구현에서는 KV Cache 전송의 높은 처리량과 낮은 지연을 위해 RDMA(Remote Direct Memory Access)를 활용하며, EFA와 ConnectX NIC 모두를 지원합니다. KV Messenger는 libfabric 위에 구축되어 원격 직접 메모리 접근에 대한 고수준 저지연 추상화를 제공합니다.

주요 KV Cache 전송 방식들은 아래와 같습니다.

| 방식 | 속도 | 거리 | 사용처 |
|---|---|---|---|
| NVLink | 매우 빠름 | 같은 노드 내 | 단일 노드 |
| RDMA (InfiniBand/RoCE) | 빠름 | 같은 데이터센터 | 클러스터 |
| TCP/IP | 느림 | 원격 | 비상용 |

---

## 실제 성능: DistServe부터 NVIDIA Dynamo까지

**DistServe** (2024, OSDI): PD Disaggregation을 처음 대규모로 증명한 논문으로, 기존 혼합 방식 대비 TTFT와 TPOT를 동시에 크게 개선했습니다.

NVIDIA는 GTC 2025에서 NVIDIA Dynamo를 발표하며 DistServe가 LLM 추론 커뮤니티에서 광범위하게 인정받고 배포되는 주요 이정표가 되었습니다. Dynamo는 PD Disaggregation을 위한 가장 선진적이고 성숙한 오픈소스 데이터센터 규모 분산 추론 프레임워크 중 하나로, TensorRT-LLM, vLLM, SGLang 같은 인기 있는 추론 엔진들을 지원합니다.

SGLang의 실제 성능을 보면, SGLang은 3개 노드(24 GPU)를 Prefill에, 9개 노드(72 GPU)를 Decode에 할당하는 96개 H100 GPU로 DeepSeek-R1을 PD 분리하여 테스트한 결과 노드당 초당 52,300개 입력 토큰과 22,300개 출력 토큰을 달성했습니다. 이는 DeepSeek 블로그의 수치와 맞먹는 첫 번째 오픈소스 구현입니다.

---

## SGLang으로 PD Disaggregation 써보기

```bash
# Prefill 노드 실행
python -m sglang.launch_server \
    --model-path deepseek-ai/DeepSeek-R1 \
    --host 0.0.0.0 \
    --port 30000 \
    --disaggregation-mode prefill \
    --disaggregation-transfer-backend rdma \
    --tp 8

# Decode 노드 실행 (다른 서버에서)
python -m sglang.launch_server \
    --model-path deepseek-ai/DeepSeek-R1 \
    --host 0.0.0.0 \
    --port 30001 \
    --disaggregation-mode decode \
    --disaggregation-transfer-backend rdma \
    --prefill-server http://prefill-node:30000 \
    --tp 8
```

---

## PD 분리가 항상 정답은 아니다

PD Disaggregation이 매력적으로 들리지만, 모든 상황에 맞는 해결책은 아닙니다. 임계값이 중요합니다. 워크로드가 너무 작거나 GPU 설정이 이 방식에 맞게 조정되지 않으면 성능이 20-30% 떨어질 수 있습니다. 또한 분리는 Prefill과 Decode 워커 간 KV Cache를 빠르고 안정적으로 이동해야 하므로, 분리로 인한 성능 향상이 데이터 전송 비용을 초과하지 않으면 전반적인 성능이 오히려 저하될 수 있습니다.

**효과적인 경우**: 대규모 클러스터 환경, 입출력 비율이 불균형한 워크로드(긴 시스템 프롬프트 + 짧은 답변), TTFT와 TPOT 모두 엄격한 SLO가 있는 프로덕션 서빙

**비효과적인 경우**: 소규모 단일 노드, 짧은 프롬프트(전송 오버헤드가 이득보다 클 때), 노드 간 네트워크가 느린 환경

---

## 추론 최적화 시리즈 전체 정리

지금까지 6개의 핵심 LLM 추론 최적화 기법을 다뤘습니다.

| 기법 | 해결하는 문제 | 핵심 아이디어 |
|---|---|---|
| PagedAttention | KV Cache 메모리 단편화 | OS 페이징을 KV에 적용 |
| RadixAttention | 중복 Prefill 계산 | Radix Tree로 자동 재사용 |
| GQA / MLA | KV Cache 크기 | 헤드/차원 압축 |
| Speculative Decoding | 직렬 생성 병목 | 드래프트로 병렬 추측·검증 |
| Prefix Caching | 반복 프롬프트 재계산 | 동일 프리픽스 KV 보관 |
| PD Disaggregation | Prefill↔Decode 간섭 | 전용 GPU 풀로 독립 스케일링 |

이 기법들은 서로 독립적이지 않습니다. 실제 프로덕션 시스템에서는 여러 기법을 함께 씁니다. vLLM, SGLang 같은 현대적인 서빙 프레임워크들은 이 기법들을 조합해서 구현하고 있습니다.

---

## 마무리

PD Disaggregation은 처음에는 너무 복잡하다는 이유로 외면받았습니다. KV Cache를 네트워크로 전송한다는 아이디어 자체가 부담스러웠기 때문입니다. 하지만 모델이 커지고, 컨텍스트가 길어지고, SLO 요구사항이 엄격해지면서 혼합 방식의 한계가 분명해졌습니다.

급진적인 아키텍처 아이디어로 시작한 것이 이제 현대 추론 스택의 정의적 원칙 중 하나가 되었습니다.

**참고 자료**
- Zhong et al. (2024). "DistServe: Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving." OSDI 2024
- [NVIDIA Dynamo 공식 문서](https://github.com/ai-dynamo/dynamo)
- [Perplexity: Disaggregated Prefill and Decode](https://www.perplexity.ai/hub/blog/disaggregated-prefill-and-decode)
- [Hao AI Lab: Disaggregated Inference 18 Months Later](https://haoailab.com/blogs/distserve-retro/)

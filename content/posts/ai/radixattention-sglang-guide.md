---
title: "RadixAttention: KV Cache 재사용을 자동화하는 기발한 아이디어"
date: "2026-03-16"
description: "SGLang이 제안한 RadixAttention의 핵심 원리를 파헤칩니다. Radix Tree 자료구조로 KV Cache를 자동 재사용하는 방식, vLLM의 Prefix Caching과의 차이, 그리고 실제 성능까지 정리합니다."
tags: ["AI", "LLM", "RadixAttention", "SGLang", "KV Cache", "추론최적화", "서빙", "자료구조"]
---

# RadixAttention: KV Cache 재사용을 자동화하는 기발한 아이디어

AI/LLM 시리즈 : RadixAttention 완전 정복

지난 포스팅에서 KV Cache의 기본 개념과 GQA, MLA, Prefix Caching 같은 최적화 기법들을 다뤘습니다. 오늘은 그 흐름에서 이어지는 주제로, **SGLang**이 제안한 **RadixAttention**을 살펴보겠습니다.

Prefix Caching과 비슷해 보이지만, 접근 방식이 근본적으로 다릅니다. "수동으로 설정하는 캐싱"과 "자동으로 발견하는 캐싱"의 차이라고 할 수 있습니다.

---

## 문제: 복잡한 LLM 프로그램에서의 중복 계산

단순한 챗봇이라면 시스템 프롬프트만 캐싱해도 충분합니다. 그런데 실제 복잡한 LLM 애플리케이션은 훨씬 다양한 패턴으로 KV Cache를 재사용할 수 있습니다.

기존 시스템은 동일한 프리픽스를 가진 다른 프롬프트들이 중간 KV Cache를 공유하고 불필요한 메모리와 계산을 피할 수 있는 KV Cache 재사용 기회를 제대로 활용하지 못했습니다.

예를 들어 이런 상황들을 생각해보세요.

```
패턴 1. Few-shot 학습 (반복 예시)
  [예시 1][예시 2][예시 3] + [질문 A]
  [예시 1][예시 2][예시 3] + [질문 B]
  → 앞의 세 예시 KV 공유 가능

패턴 2. 멀티턴 대화
  [시스템][턴1][턴2] + [새 질문]
  → 이전 대화 전체 KV 공유 가능

패턴 3. Tree-of-Thought
  [프롬프트][경로 A][분기 A1]
  [프롬프트][경로 A][분기 A2]
  [프롬프트][경로 B][분기 B1]
  → 공통 경로 KV 공유 가능

패턴 4. 멀티모달 (동일 이미지, 다른 질문)
  [이미지 토큰][질문 1]
  [이미지 토큰][질문 2]
  → 이미지 KV 공유 가능
```

일부 시스템은 특정 시나리오에서 KV Cache 재사용을 처리할 수 있지만, 이는 수동 설정과 임시방편적인 조정이 필요합니다. 게다가 재사용 패턴의 다양성 때문에 수동 설정으로도 모든 시나리오를 자동으로 처리할 수 있는 기존 시스템은 없었습니다.

---

## 핵심 아이디어: Radix Tree로 KV Cache 관리하기

RadixAttention의 핵심은 자료구조 선택입니다. 기존 시스템들이 요청 완료 후 KV Cache를 버리는 것과 달리, RadixAttention은 프롬프트와 생성 결과 모두의 KV Cache를 **Radix Tree**에 보관합니다. 이 자료구조는 효율적인 프리픽스 검색, 삽입, 제거를 가능하게 합니다.

### Radix Tree란?

Radix Tree(기수 트리)는 Trie(트라이, 접두사 트리)의 공간 효율화 버전입니다.

일반 Trie가 문자 하나씩 노드를 만드는 것과 달리, Radix Tree는 공통 접두사를 하나의 엣지로 압축합니다.

```
일반 Trie:
"apple"과 "apply"를 저장하면
a → p → p → l → e
              └─> y

Radix Tree:
a → p → p → l → e
              └─> y
→ "appl"을 하나의 엣지로 압축

토큰 시퀀스에 적용:
[101, 203, 77, 55] → [900, 12, 44] → [88]  (프롬프트 A)
                  └─> [900, 12, 44] → [91]  (프롬프트 B)
→ 공통 접두사 [101, 203, 77, 55]의 KV를 한 노드로 관리
```

이 시스템은 토큰 시퀀스를 키로, 해당 KV Cache 텐서를 값으로 하는 매핑을 Radix Tree로 관리합니다. KV Cache 텐서는 GPU에 페이지 레이아웃으로 저장되며, 각 페이지 크기는 토큰 하나에 해당합니다.

---

## 실제로 어떻게 동작하는가

요청이 들어올 때 RadixAttention의 처리 흐름을 따라가 보겠습니다.

```
1. 새 요청 도착: [A][B][C][D][E][F]

2. Radix Tree에서 가장 긴 공통 프리픽스 탐색
   기존 캐시: [A][B][C] 까지 존재

3. [A][B][C]의 KV Cache 재사용 (prefill 스킵)

4. [D][E][F]만 새로 prefill 계산

5. 완료 후 [A][B][C][D][E][F] 전체를 Tree에 삽입
   (다음 요청에서 재사용 가능하도록)
```

여기서 중요한 점이 있습니다. 프론트엔드는 항상 전체 프롬프트를 런타임에 보내고, 런타임이 자동으로 프리픽스 매칭, 재사용, 캐싱을 처리합니다. 개발자가 "이 부분을 캐시해"라고 명시할 필요가 없습니다.

---

## LRU 제거 정책과 캐시 인식 스케줄링

GPU 메모리는 무한하지 않습니다. 캐시가 가득 차면 어떤 노드를 제거할지 결정해야 합니다.

RadixAttention은 **LRU(Least Recently Used) 제거 정책**을 구현합니다. 리프 노드부터 재귀적으로 제거하며, 부모 노드는 자식 노드가 모두 제거된 후에만 제거됩니다.

리프 노드부터 제거하는 이유는 명확합니다. 트리의 중간 노드(공통 프리픽스)는 여러 리프 노드가 공유하고 있기 때문에, 중간 노드를 제거하면 해당 공통 프리픽스를 사용하는 모든 캐시가 무효화됩니다.

스케줄링도 캐시를 고려합니다. 캐시 인식 스케줄링은 캐시 히트율을 높이기 위해 대기 중인 요청을 매칭된 프리픽스 길이에 따라 정렬합니다. 비슷한 프리픽스를 가진 요청들을 묶어서 처리하면 캐시 히트율이 올라갑니다.

---

## vLLM Prefix Caching과의 차이

RadixAttention과 vLLM의 Automatic Prefix Caching(APC)은 비슷해 보이지만 설계 철학이 다릅니다.

vLLM은 예측 가능하고 구조화된 캐싱 패턴을 다룰 때 뛰어납니다. 템플릿화된 프롬프트로 배치 추론을 실행하거나 일관된 요청 패턴이 있다면 vLLM의 APC가 정밀한 제어와 함께 훌륭한 성능을 제공합니다. 반면 SGLang은 대화 흐름이 다양하게 변화하는 예측 불가능한 동적 시나리오에서 빛납니다. Radix Tree 접근 방식은 vLLM에서 수동 최적화가 필요한 캐싱 기회를 자동으로 발견합니다.

| 구분 | vLLM (APC) | SGLang (RadixAttention) |
|---|---|---|
| 캐시 구조 | 해시 기반 블록 | Radix Tree |
| 매칭 방식 | 고정 블록 단위 | 가변 길이 프리픽스 |
| 설정 방식 | `enable_prefix_caching=True` | 항상 자동 활성화 |
| 강점 | 배치, 템플릿화된 요청 | 멀티턴, 동적 트리 구조 |
| 멀티모달 | 제한적 | 이미지 해시 키로 지원 |

또한 RadixAttention은 연속 배칭, PagedAttention 같은 기존 기법들과도 호환됩니다. 멀티모달 모델의 경우 입력 이미지의 해시를 Radix Tree의 키로 사용하여 동일한 이미지의 KV Cache를 재사용할 수 있도록 쉽게 확장할 수 있습니다.

---

## 실습: SGLang으로 RadixAttention 활용하기

```bash
pip install sglang[all]
```

```python
# SGLang 서버 실행
# python -m sglang.launch_server \
#     --model-path meta-llama/Llama-3.1-8B-Instruct \
#     --host 0.0.0.0 \
#     --port 30000
# (RadixAttention은 기본 활성화)
```

```python
import sglang as sgl

# Few-shot 프롬프트: 예시 3개가 모든 요청에서 공유됨
few_shot_examples = """
다음은 감성 분류 예시입니다.

입력: "이 영화 정말 재밌었어요!"
출력: 긍정

입력: "서비스가 너무 불친절해요."
출력: 부정

입력: "그냥 평범한 하루였어요."
출력: 중립

"""

@sgl.function
def classify_sentiment(s, text: str):
    s += few_shot_examples
    s += f"입력: \"{text}\"\n출력:"
    s += sgl.gen("result", max_tokens=10, stop="\n")

# 여러 요청 처리
# 첫 요청: few_shot_examples KV 계산 + 캐시 저장
# 이후 요청: few_shot_examples KV 재사용 (prefill 스킵)
texts = [
    "오늘 날씨가 정말 좋네요.",
    "배송이 너무 늦어서 화가 났어요.",
    "밥은 먹었어요.",
    "이 책 강력 추천합니다!",
]

runtime = sgl.Runtime(model_path="meta-llama/Llama-3.1-8B-Instruct")
sgl.set_default_backend(runtime)

for text in texts:
    result = classify_sentiment.run(text=text)
    print(f"'{text}' → {result['result'].strip()}")

runtime.shutdown()
```

---

## 실제 성능

SGLang은 에이전트 제어, 논리 추론, few-shot 학습 벤치마크, JSON 디코딩, RAG 파이프라인, 멀티턴 챗 등 다양한 태스크에서 최신 추론 시스템 대비 최대 **6.4배 높은 처리량**을 달성했습니다.

벤치마크 결과를 보면 신선한 컨텍스트에서는 두 엔진이 거의 비슷한 수준이지만, 캐시가 관여하는 대규모 멀티턴 대화에서는 RadixAttention이 동일한 컨텍스트 부하에서 vLLM 대비 약 10%의 성능 향상을 보였습니다.

특히 멀티모달이나 에이전트처럼 복잡한 구조의 프로그램일수록 RadixAttention의 자동 프리픽스 탐지가 빛을 발합니다.

---

## RadixAttention의 진화: HiCache

최근에는 RadixAttention을 GPU 메모리 너머로 확장한 **HiCache**도 등장했습니다.

GPU 메모리만으로는 캐싱 이점이 용량 병목으로 제한됩니다. 컨텍스트가 길어지고 더 많은 클라이언트가 멀티라운드 대화를 하면 새 데이터를 위한 공간을 확보하기 위해 대부분의 과거 KV Cache가 제거되어야 하기 때문입니다. HiCache는 RadixAttention을 계층적 메모리(GPU → CPU → SSD)로 확장한 HiRadixTree로 이 문제를 해결합니다.

25K 토큰을 초과하는 코딩 에이전트 시나리오에서 HiCache를 적용했을 때, 평균 TTFT(첫 토큰 지연)가 56% 감소하고 추론 처리량이 2배 증가했으며 캐시 히트율이 40%에서 80%로 높아졌습니다.

---

## 마무리

RadixAttention의 핵심 아이디어를 한 줄로 정리하면 이렇습니다.

> **"KV Cache를 버리지 말고, Radix Tree에 쌓아두고 자동으로 재사용하자."**

PagedAttention이 "메모리 단편화"를 해결했다면, RadixAttention은 "중복 계산"을 해결합니다. 둘 다 같은 KV Cache 문제를 서로 다른 각도에서 공략한 셈입니다. 실제로 두 기법은 서로 호환되며, 함께 쓸 때 더 큰 효과를 냅니다.

**참고 자료**
- Zheng et al. (2023). "SGLang: Efficient Execution of Structured Language Model Programs." arXiv:2312.07104
- [LMSYS 공식 블로그: RadixAttention 소개](https://lmsys.org/blog/2024-01-17-sglang/)
- [SGLang GitHub](https://github.com/sgl-project/sglang)

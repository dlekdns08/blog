---
title: "Chain-of-Tools: Utilizing Massive Unseen Tools in the CoT Reasoning of Frozen Language Models"
date: "2025-04-12"
description: "동결된 언어 모델이 학습 데이터에 없던 미사용 도구까지 CoT 추론 과정에서 활용할 수 있도록 하는 Chain-of-Tools 방법론을 소개합니다."
tags: ["AI", "LLM", "논문리뷰", "CoT", "Tool Learning", "CoTools"]
---

# Chain-of-Tools: Utilizing Massive Unseen Tools in the CoT Reasoning of Frozen Language Models

AI/LLM 시리즈 : CoT 도구 학습 연구

오늘은 Mengsong Wu et al.(2025)이 발표한 논문 **Chain-of-Tools**를 리뷰해보겠습니다. 동결된 대형 언어 모델이 학습 데이터에 포함되지 않은 미사용 도구까지도 CoT 추론 과정에서 유연하게 활용할 수 있도록 하는 새로운 도구 학습 방법론입니다.

---

## Abstract

도구 학습(Tool Learning)은 대형 언어 모델(LLM)의 활용 가능성을 더욱 넓힐 수 있습니다. 그러나 기존 방법들은 대부분 모델을 미세조정하여 학습 데이터에 등장한 도구만 사용할 수 있도록 하거나, 비효율적으로 도구 시연을 프롬프트에 추가합니다.

본 논문에서는 새로운 도구 학습 방법인 **Chain-of-Tools(CoTools)**를 제시합니다. 이 방법은 동결된 언어 모델의 강력한 의미 표현 능력을 최대한 활용해, CoT 추론 과정에서 미사용 도구를 포함한 거대하고 유연한 도구 풀(Tool Pool)을 사용하여 도구 호출을 수행합니다.

연구진은 대규모 미사용 도구 시나리오 검증을 위해 **SimpleToolQuestions** 데이터셋을 새롭게 구축하였으며, GSM8K-XL, FuncQA, KAMEL, SimpleToolQuestions 등 4개의 벤치마크에서 기존 방법보다 우수한 성능을 확인했습니다.

---

## 왜 이 연구가 중요한가?

LLM 에이전트가 날씨 API, 계산기, 일정 관리 도구 등 **외부 도구**를 활용하면 모델이 자체적으로 처리하기 어려운 작업을 대신 수행할 수 있습니다. 그러나 기존 방법들은 학습 데이터에 포함된 도구만 사용하거나, 프롬프트에 도구 시연을 추가하는 방식으로 효율성이 낮았습니다.

CoTools는 모델 가중치를 동결한 채로 **은닉 상태(hidden state) 정보를 활용**하여 도구 호출 여부와 도구 선택을 결정함으로써, 학습 데이터에 없던 새로운 도구까지 일반화할 수 있다는 점이 핵심입니다.

---

## CoTools 동작 원리

![CoTools의 이상적인 도구 호출 절차 — 사용자 쿼리에 대해 Schedule API와 Weather API를 순차적으로 호출하여 최종 답변을 생성하는 과정](/images/ai/cot1.png)

위 그림은 CoTools의 이상적인 도구 호출 절차를 보여줍니다. "내일 목적지의 날씨는 어때?"라는 쿼리가 들어오면, 모델은 먼저 일정 정보를 확인하기 위해 **Schedule API**를 호출하고, 이어서 해당 위치의 날씨를 조회하기 위해 **Weather API**를 호출합니다. 각 도구의 실행 결과가 최종 답변에 반영되어 자연스러운 응답이 생성됩니다.

---

## 전체 시스템 구조

![CoTools 전체 파이프라인 — CoT 추론 중 매 토큰 생성 시점마다 Tool Judge, Tool Retriever, Tool Calling의 세 단계를 거쳐 도구를 호출](/images/ai/cot2.png)

CoTools는 크게 세 가지 구성 요소로 이루어져 있습니다.

| 구성 요소 | 역할 |
|---|---|
| Tool Judge | 현재 토큰의 은닉 상태를 입력받아 도구 호출 여부 결정 |
| Tool Retriever | Query Encoder와 Tool Encoder를 활용하여 가장 적합한 도구 선택 |
| Tool Calling | 선택된 도구를 프롬프트 형식으로 호출하고 결과를 답변에 반영 |

**Tool Judge**는 답변 생성 중 특정 토큰의 은닉 상태를 기반으로 0과 1 사이의 점수를 산출하며, 이 값이 임계치보다 높으면 도구 호출을 시도합니다. **Tool Retriever**는 질의 벡터와 미리 준비된 도구 벡터 간의 유사도를 계산해 가장 적합한 도구를 선택합니다. 이러한 구조 덕분에 CoTools는 학습 데이터에 포함되지 않은 미사용 도구까지도 활용할 수 있습니다.

---

## 모델 세부 구조

![CoTools 모델 구성 — Foundation Model은 동결, Tool Judge와 Query/Tool Encoder만 학습](/images/ai/cot3.png)

위 그림에서 볼 수 있듯이, Foundation Model의 파라미터는 완전히 **동결(frozen)** 된 상태로 유지되며, 학습이 이루어지는 것은 **Tool Judge**, **Query Encoder**, **Tool Encoder** 세 가지뿐입니다.

특히 Encoder 구조에서는 게이트 메커니즘과 선형 변환을 적용하여 은닉 상태 중 도구 선택에 중요한 특정 차원만을 재조합합니다. 이 과정에서 불필요한 정보를 걸러내고 도구 선택과 관련된 핵심 특징을 부각함으로써, 효율성과 해석 가능성을 동시에 향상시킵니다.

---

## CoTools vs MCP: 무엇이 다른가?

CoTools는 외부 도구를 LLM에 연결한다는 점에서 MCP(Model Context Protocol)와 유사해 보입니다. 그러나 핵심적인 차이가 있습니다.

MCP가 **외부 프로토콜 레이어**를 통해 도구를 연결하는 방식이라면, CoTools는 **모델 내부의 은닉 상태**를 직접 활용하여 도구 호출 시점과 도구 선택을 결정합니다. 즉, 언어 모델이 텍스트를 생성하는 매 순간 내부 표현을 참조하여 자연스럽게 도구를 호출하는 구조입니다. 이 접근법은 모델의 내부 의미 표현 능력을 최대한 활용하면서도 기존 모델 가중치를 변경하지 않아도 되는 장점이 있습니다.

---

## 실험 결과

실험은 크게 두 종류의 벤치마크에서 진행되었습니다.

**숫자 추론** 작업(GSM8K-XL, FuncQA)에서는 기본 산술 연산과 13종의 산술 도구를 활용한 문제 해결을 평가했으며, LLaMA2-7B 및 Mistral 기반 모두에서 기존 방법(0-shot ChatGPT, ToolkenGPT) 대비 우수한 성능을 기록했습니다.

**지식 기반 질문 응답**(KAMEL, STQuestions) 작업에서는 합성 데이터 환경에서 CoTools가 ToolkenGPT보다 **20% 이상** 높은 성능을 보였으며, 도구의 수가 증가하는 상황에서도 약 **10% 이상**의 높은 선택 정확도를 유지했습니다. 특히 학습 데이터에 없던 미사용 도구 837개를 포함하는 시나리오에서도 효과적인 일반화 능력이 확인되었습니다.

---

## 결론 및 시사점

이 연구를 종합하면 다음 네 가지를 시사합니다.

**첫째**, 동결된 언어 모델의 은닉 상태에는 도구 선택에 활용 가능한 풍부한 의미 표현이 내포되어 있으며, 별도의 추가 학습 없이도 이를 활용할 수 있습니다.

**둘째**, Tool Judge와 Encoder만을 별도로 학습함으로써 기반 모델의 범용 능력을 보존하면서도 도구 호출 정확도를 크게 향상시킬 수 있습니다.

**셋째**, 학습 데이터에 포함되지 않은 미사용 도구에 대해서도 도구 설명(description)을 통해 효과적으로 일반화할 수 있어 실세계 응용에 유리합니다.

**마지막으로**, 은닉 상태의 특정 차원이 도구 선택에 중요한 역할을 한다는 분석 결과는 모델 해석 가능성(interpretability) 향상에도 기여하며, 향후 도구 학습 분야의 발전에 중요한 통찰을 제공합니다.

코드 및 데이터는 [https://github.com/fairyshine/Chain-of-Tools](https://github.com/fairyshine/Chain-of-Tools) 에서 확인할 수 있습니다.
---
title: "Improving Language Understanding by Generative Pre-Training : GPT의 시작"
date: "2025-02-12"
description: "현재 GPT 시대의 출발점이 된 GPT-1 논문을 살펴봅니다."
tags: ["AI", "GPT", "논문리뷰", "LLM"]
---

# Improving Language Understanding by Generative Pre-Training : GPT의 시작

Transformer 시리즈(3) : Improving Language Understanding by Generative Pre-Training

현재, 우리는 GPT의 시대에 살고 있다고 해도 과언이 아닙니다. 2023년 말 GPT-3.5 기반의 ChatGPT가 세상에 등장하고 나서, 그 이전과 이후의 세상은 완전히 달라졌다고 생각합니다. 사람들의 업무 일부를 GPT가 대체하기 시작했고, 그로 인해 생산성은 빠르게 올라갔습니다. 또한 GPT에 대항하기 위해 Claude, Perplexity 같은 서비스들이 출시되었습니다. 이후 GPT-4, 4o, o1 등이 차례로 공개되었는데, 그렇다면 GPT의 처음은 무엇이었을까요?

*Improving Language Understanding by Generative Pre-Training*(2018)에서 제안한 모델이 바로 GPT의 시작입니다. 사실 해당 논문에서는 "Generative Pre-Training"이라는 말만 사용하여, 직접적으로 "GPT"라는 표현이 등장하지는 않습니다. 이후 블로그 등을 통해 해당 모델을 GPT라고 명명했고, OpenAI에서는 GPT-2 논문을 공개하며 해당 모델의 이름을 공식적으로 GPT라고 지칭했습니다. 그래서 현재는 OpenAI GPT 혹은 GPT-1 등으로 불립니다.

---

## 논문의 핵심 주장

논문의 Abstract를 요약하면 다음과 같습니다.

자연어 이해(Natural Language Understanding) 태스크는 매우 다양한데, 각 태스크에 대한 라벨 데이터는 너무 적습니다. 이를 해결하기 위해 방대한 무라벨 텍스트로 **생성형 사전 학습(Generative Pre-Training)**을 수행한 뒤, 각 과제에 맞춰 **차별적 미세 조정(Discriminative Fine-tuning)**을 적용하였습니다. 그 결과, 모델 구조의 큰 변경 없이도 효과적인 전이 성능을 얻었으며, 12개 과제 중 9개에서 기존 최고 성능을 뛰어넘었습니다. 특히 상식 추론, 질의응답, 텍스트 추론 과제에서 큰 성능 개선을 보였습니다.

---

## 기존 방법의 한계

자연어 처리에서 특정 태스크에 맞게 모델을 학습하려면 라벨이 붙은 데이터가 필요합니다. 그러나 현실에서는 이런 라벨 데이터가 태스크별로 부족한 경우가 많습니다. 기존의 지도 학습(supervised learning) 방식은 각 태스크마다 별도의 모델과 데이터를 필요로 했기 때문에, 다양한 NLP 과제에 유연하게 대응하기 어려웠습니다.

이 한계를 극복하기 위해, GPT-1은 두 단계의 학습 프레임워크를 제안합니다.

---

## 모델의 프레임워크

GPT-1의 학습은 크게 두 단계로 이루어집니다.

### 1. Unsupervised Pre-training (비지도 사전 학습)

대규모 텍스트 코퍼스에서 언어 모델을 학습하여 좋은 초기 파라미터(Θ)를 얻는 것이 목표입니다. 주어진 토큰 시퀀스 U = {u₁, u₂, ..., uₙ}에 대해, 이전 k개의 토큰을 바탕으로 다음 토큰의 확률을 예측하는 **언어 모델링 목표**를 최대화합니다.

모델 아키텍처로는 **다층 Transformer 디코더**를 사용합니다. 마스크드 셀프 어텐션, 포지션 임베딩, 피드포워드 레이어를 포함하여 입력 토큰의 문맥 정보를 효과적으로 캡처하도록 구성되었습니다.

### 2. Supervised Fine-tuning (지도 미세 조정)

사전 학습된 모델을 활용하여, 라벨이 있는 데이터를 대상으로 특정 판별 작업(discriminative task)에 맞게 파인튜닝합니다. 각 입력 시퀀스와 레이블 y를 모델에 통과시켜 마지막 Transformer 블록의 활성화를 얻은 후, 선형 출력 레이어를 통해 y를 예측합니다.

또한 미세 조정 시 언어 모델링 목표(L₁)를 **보조 손실(auxiliary loss)**로 추가하여 가중치를 적용함으로써, 일반화 성능을 향상하고 수렴 속도를 개선하였습니다.

미세 조정 과정에서는 **순차적(traversal-style) 접근법**을 통해 구조화된 텍스트를 하나의 연속 토큰 시퀀스로 처리하며, 최소한의 아키텍처 변경으로 다양한 태스크에 효과적으로 적응할 수 있습니다.

---

## 실험 및 결과

### Unsupervised Pre-training 설정

BooksCorpus 데이터셋을 활용하여 비지도 학습을 진행했습니다. 이 데이터셋은 장기 의존성(long-range dependency) 학습에 유리합니다. 모델의 세부 사양은 다음과 같습니다.

- 12층의 디코더 전용 Transformer
- 768 차원의 상태, 12개의 어텐션 헤드, 피드포워드 네트워크의 내부 차원은 3072
- Adam 옵티마이저, 워밍업 후 코사인 스케줄 적용
- Byte-Pair Encoding (BPE) 방식의 40,000 단위 어휘 사용
- Dropout, L2 정규화, GELU 활성화 함수 등 다양한 정규화 기법 적용

### Supervised Fine-tuning 결과

여러 태스크에 걸쳐 높은 성능을 달성하였습니다.

**자연어 추론 (Natural Language Inference, NLI)**
- 데이터셋: SNLI, MNLI, QNLI, SciTail, RTE 등
- 결과: MNLI에서 1.5%, SciTail에서 5%, QNLI에서 5.8% 등 대부분의 데이터셋에서 기존 최고 성능 대비 향상

**질문 응답 및 상식 추론**
- 데이터셋: RACE, Story Cloze Test
- 결과: Story Cloze Test에서 최대 8.9%, RACE에서 5.7%의 향상

**의미 유사성 (Semantic Similarity)**
- 데이터셋: MRPC, Quora Question Pairs, STS Benchmark
- 결과: STS Benchmark에서 1점 이상 향상, QQP에서 4.2%의 성능 향상

**텍스트 분류 (Classification)**
- 데이터셋: CoLA (문법 적합성 평가), SST-2 (감성 분석)
- 결과: CoLA에서 이전 최고(35.0)를 크게 뛰어넘어 45.4 기록, SST-2에서 91.3%의 높은 정확도 달성

**종합 성능**
- GLUE 벤치마크 전체 점수 72.8로, 이전 최고 68.9를 뛰어넘음
- 전체 12개 평가 데이터셋 중 9개에서 새로운 최첨단(state-of-the-art) 성능 달성

---

## GPT-1의 의의

GPT-1은 GPT라는 이름을 세상에 내놓은 만큼 많은 의의를 가집니다.

1. **두 단계 학습 전략** — 비지도 사전 학습과 지도 미세 조정의 조합을 통해, 대규모 비라벨 데이터로부터 강력한 언어 표현을 학습하고 이를 다양한 NLP 작업에 효과적으로 전이함
2. **Transformer 기반 아키텍처** — LSTM 기반 모델보다 더 긴 범위의 언어 구조를 포착할 수 있어, 문장 간 관계나 긴 문맥 의존성을 효과적으로 처리
3. **태스크별 입력 변환 기법** — 구조화된 입력도 최소한의 아키텍처 변경으로 처리 가능

---

## 결론: 사전 학습과 미세 조정의 힘

GPT-1 논문은 사전 학습과 미세 조정을 결합한 접근법이 다양한 NLP 작업에서 우수한 성능을 달성할 수 있음을 처음으로 명확히 보여준 연구입니다. 이 논문은 어떻게 보면 현재 LLM을 비롯한 수많은 연구의 출발점이라 할 수 있습니다. (앞서 다루었던 Transformer가 할머니라면, GPT-1은 그 엄마 정도 되는 셈입니다.) GPT-2, GPT-3, ChatGPT, 그리고 오늘날 우리가 사용하는 수많은 AI 서비스들은 모두 이 작은 시작에서 비롯되었습니다.
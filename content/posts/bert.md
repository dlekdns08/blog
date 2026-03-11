---
title: "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding"
date: "2025-01-31"
description: "양방향 트랜스포머 기반의 언어 모델 BERT를 소개한 논문을 살펴봅니다."
tags: ["AI", "Transformer", "논문리뷰", "LLM", "BERT"]
---

# BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding

Transformers 시리즈(2) : BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding

Transformers 시리즈를 시작하며 처음으로 "Attention is all you need"(Vaswani et al., 2017) 논문을 리뷰했습니다. 이 논문은 Transformer라는 혁명적인 아키텍처를 처음으로 세상에 공개한 논문이었습니다. 그 다음으로 **BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding** 논문을 리뷰하고자 합니다.

Transformer 아키텍처를 활용한 모델 중에서 GPT보다 파급력이 약하고 일반 대중에게 인지도가 떨어지는 건 분명한 사실입니다. 그러나 BERT 역시 자연어 처리 분야 등에 미친 영향이 적지 않기에, GPT 논문을 리뷰하기 이전에 한번 리뷰하고 넘어가고자 합니다.

---

## 논문 초록

> We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers. Unlike recent language representation models, BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers. As a result, the pre-trained BERT model can be fine-tuned with just one additional output layer to create state-of-the-art models for a wide range of tasks, such as question answering and language inference, without substantial task-specific architecture modifications.
>
> BERT is conceptually simple and empirically powerful. It obtains new state-of-the-art results on eleven natural language processing tasks, including pushing the GLUE score to 80.5% (7.7% point absolute improvement), MultiNLI accuracy to 86.7% (4.6% absolute improvement), SQuAD v1.1 question answering Test F1 to 93.2 (1.5 point absolute improvement) and SQuAD v2.0 Test F1 to 83.1 (5.1 point absolute improvement).

간단히 요약하면, BERT는 양방향 트랜스포머를 기반으로 한 새로운 언어 모델로, 양쪽 문맥을 모두 활용하여 사전 학습됩니다. 단일 추가 출력 계층으로 다양한 자연어 처리 작업에 최적화될 수 있으며, 여러 벤치마크에서 기존 모델을 크게 능가하는 성능을 보였습니다.

이 논문에서 BERT의 핵심으로 꼽은 것은 **Bidirectional Encoder(양쪽 문맥을 모두 활용)**와 **단일 추가 출력 계층을 활용하여 다양한 작업을 수행**할 수 있다는 점입니다.

---

## BERT의 아키텍처: 양방향 인코더

BERT의 가장 큰 혁신 중 하나는 **양방향 인코더**의 도입입니다. 기존의 많은 언어 모델들은 주로 단방향(왼쪽→오른쪽 또는 오른쪽→왼쪽)으로 텍스트를 처리했습니다. 반면, BERT는 Transformer의 인코더 부분을 기반으로 하여 입력 문장의 양쪽 문맥을 동시에 고려합니다.

이를 통해 단어의 의미를 더 정확하게 파악할 수 있으며, 문장 내의 단어들이 서로 어떻게 상호작용하는지를 더 깊이 이해할 수 있게 됩니다.

---

## 사전 학습 목표: MLM과 NSP

BERT는 두 가지 주요 사전 학습 목표를 설정하여 언어 이해 능력을 향상시켰습니다.

### Masked Language Model (MLM)

입력 문장에서 일부 단어를 마스킹(masking)하고, 모델이 이 마스킹된 단어를 예측하도록 학습합니다. 이 과정에서 모델은 문장의 양쪽 문맥을 모두 활용하여 누락된 단어를 추론하게 됩니다. MLM은 단어 간의 복잡한 관계를 학습하는 데 도움을 주며, 모델이 보다 풍부한 언어 표현을 학습할 수 있게 합니다.

### Next Sentence Prediction (NSP)

두 개의 문장이 주어졌을 때, 두 번째 문장이 첫 번째 문장의 다음 문장인지 아닌지를 예측하도록 모델을 학습시킵니다. 이 목표는 문장 간의 관계를 이해하고 문서 수준의 이해 능력을 향상시키는 데 기여하며, 특히 질문 응답이나 자연어 추론과 같은 작업에서 유용한 정보를 제공합니다.

---

## 미세 조정(Fine-Tuning)의 단순성

BERT의 또 다른 강점은 **미세 조정 과정의 단순성**에 있습니다. 사전 학습된 BERT 모델은 다양한 자연어 처리 작업에 쉽게 적용될 수 있습니다. 특정 작업에 맞게 모델을 미세 조정할 때는 단순히 하나의 추가 출력 계층만 추가하면 됩니다. 이는 다음과 같은 장점을 제공합니다.

- **효율성**: 다양한 작업에 대해 별도의 복잡한 모델을 설계할 필요 없이, 동일한 사전 학습된 모델을 재사용할 수 있습니다.
- **일관성**: 동일한 기본 모델을 사용함으로써, 다양한 작업 간의 일관된 성능을 기대할 수 있습니다.
- **유연성**: 질문 응답, 감성 분석, 개체명 인식 등 다양한 작업에 쉽게 적용할 수 있습니다.

---

## BERT의 성과와 영향

BERT는 발표 이후 자연어 처리 분야에서 큰 반향을 일으켰습니다. 여러 벤치마크에서 기존의 최고 성능을 크게 능가했습니다.

| 벤치마크 | 기존 최고 | BERT | 향상 |
|---|---|---|---|
| GLUE | 72.8% | 80.5% | +7.7%p |
| MultiNLI | 82.1% | 86.7% | +4.6%p |
| SQuAD v1.1 F1 | 91.7 | 93.2 | +1.5 |
| SQuAD v2.0 F1 | 78.0 | 83.1 | +5.1 |

또한, BERT는 이후 등장하는 많은 언어 모델들의 기반이 되었습니다. GPT 시리즈와 마찬가지로 Transformer 아키텍처를 기반으로 하지만, 양방향 인코딩과 MLM, NSP와 같은 독특한 사전 학습 목표를 통해 차별화된 성과를 보여주었습니다.

---

## BERT의 한계와 향후 과제

비록 BERT가 많은 성공을 거두었지만, 몇 가지 한계점도 존재합니다.

- **모델 크기**: BERT는 매우 큰 모델로, 학습과 추론에 많은 계산 자원이 필요합니다. 이는 실제 응용에서의 활용을 제한할 수 있습니다.
- **사전 학습의 한계**: MLM과 NSP는 강력한 사전 학습 목표이지만, 여전히 인간 수준의 언어 이해에 도달하기에는 부족한 점이 있습니다.
- **실시간 응용**: BERT의 크기와 복잡성은 실시간 응용에서의 활용을 어렵게 만들 수 있습니다.

이러한 한계점을 극복하기 위해, 이후 등장한 다양한 경량화 모델(DistilBERT, ALBERT 등)과 효율적인 학습 방법들이 연구되고 있습니다.

---

## 결론

BERT는 자연어 처리 분야에서 혁신적인 변화를 이끌어낸 모델로, 양방향 인코더와 효과적인 사전 학습 목표(MLM, NSP)를 통해 뛰어난 성능을 발휘했습니다. 단순한 미세 조정 과정과 다양한 작업에의 유연한 적용 가능성 덕분에, BERT는 많은 연구자들과 실무자들에게 사랑받는 도구가 되었습니다.

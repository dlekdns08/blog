---
title: "An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale"
date: "2025-03-15"
description: "텍스트 중심이었던 Transformer를 이미지 인식에 직접 적용한 Vision Transformer(ViT) 논문을 살펴봅니다."
tags: ["AI", "Transformer", "ViT", "논문리뷰", "ComputerVision"]
---

# An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale

Transformer 시리즈(5) : An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale

이번 논문을 Transformer 시리즈의 마지막으로 선택한 이유는, 그동안 텍스트 처리에 집중되어 있던 Transformer를 **이미지에서도 사용할 수 있다**는 점을 보여준 좋은 사례이기 때문입니다. 돌아보면 이번 시리즈는 다음과 같은 흐름으로 이어졌습니다.

- **Attention is All You Need** — Transformer의 탄생
- **BERT, GPT** — Transformer를 어떻게 사용할지에 대한 로드맵 제시
- **Transformer-XL** — 고정된 문맥 길이 문제의 해결책
- **ViT (이번 논문)** — Transformer의 활용 영역을 이미지로 확장

---

## 논문의 핵심 주장

논문의 Abstract를 요약하면 다음과 같습니다.

Transformer 아키텍처는 자연어 처리의 사실상 표준이 되었지만, 컴퓨터 비전 분야에서의 적용은 여전히 제한적이었습니다. 기존 비전 연구들은 CNN과 self-attention을 결합하거나 일부 구성 요소만 대체하는 방식을 취했습니다. 이 논문은 **CNN 없이 순수 Transformer만으로도** 이미지 분류에서 우수한 성능을 낼 수 있음을 보여줍니다. 대규모 데이터로 사전 학습한 후 ImageNet, CIFAR-100, VTAB 등의 벤치마크에 전이하면, 기존 최첨단 CNN 대비 뛰어난 성능을 훨씬 적은 계산 자원으로 달성합니다.

---

## 기존 방법의 한계

자연어 처리 분야에서는 Transformer가 대규모 텍스트 데이터로 사전 학습하고 이후 미세 조정하는 방식으로 큰 성공을 거두었습니다. 수백억 개의 파라미터를 가진 모델도 탄생했습니다. 반면 컴퓨터 비전 분야에서는 여전히 CNN이 주도적으로 사용되어 왔습니다.

일부 연구에서 CNN과 self-attention을 결합하거나 완전히 self-attention으로 대체하려는 시도가 있었지만, 이들은 최적화된 하드웨어에서 효과적으로 확장되지 못했습니다. 이 논문의 연구자들은 NLP에서 Transformer가 거둔 성공에 영감을 받아, 이미지를 패치 단위로 나누고 각 패치를 단어처럼 취급하여 Transformer에 입력하는 **Vision Transformer(ViT)**를 제안합니다.

---

## Vision Transformer(ViT)의 구조

ViT는 원래의 Transformer 구조를 최대한 유지하여, NLP에서 쓰이던 확장 가능한 아키텍처를 이미지 처리에 바로 적용할 수 있도록 설계되었습니다.

### 1. 입력 이미지 처리

Transformer는 순차적 데이터를 처리하도록 설계되었기 때문에, 2차원 구조의 이미지를 그대로 입력하면 공간 정보를 제대로 활용하기 어렵습니다. ViT는 이 문제를 다음과 같이 해결합니다.

**(1) 이미지 패치 분할**

원본 이미지 $x \in \mathbb{R}^{H \times W \times C}$ (H, W는 해상도, C는 채널 수)를 크기 $P \times P$인 패치들로 나눕니다. 패치의 총 개수는 다음과 같습니다.

$$N = HW / P^{2}$$

**(2) 패치 임베딩**

각 패치를 평탄화한 후, 학습 가능한 선형 변환 $E$를 통해 고정 차원 $D$의 벡터로 매핑합니다. 여기에 분류를 위한 특별한 클래스 토큰 $x_{class}$와 학습 가능한 위치 임베딩 $E_{pos}$를 추가합니다.

$$z_{0} = [x_{class}; x_{1}^{p}E; x_{2}^{p}E; \dots; x_{N}^{p}E] + E_{pos}$$

위치 임베딩을 통해 모델은 각 패치가 이미지 내 어디에 위치했는지를 인지하고 전역적인 관계를 학습할 수 있습니다.

### 2. Transformer 인코더 구조

Transformer 인코더는 $L$개의 층으로 구성되며, 각 층은 두 블록으로 이루어집니다.

**(1) Multi-Head Self-Attention (MSA) 블록**

층 정규화(LayerNorm)를 먼저 적용한 후 self-attention을 수행하고, 잔차 연결(residual connection)을 더합니다.

$$z'_l = \text{MSA}(\text{LN}(z_{l-1})) + z_{l-1}, \quad l = 1, \dots, L$$

**(2) MLP 블록**

다시 층 정규화를 거친 후 다층 퍼셉트론(MLP) 블록을 통과시키고 잔차 연결을 더합니다.

$$z_l = \text{MLP}(\text{LN}(z'_l)) + z'_l, \quad l = 1, \dots, L$$

**(3) 최종 출력**

인코더 마지막 층에서 클래스 토큰에 층 정규화를 적용하여 최종 이미지 표현 $y$를 얻고, 이를 분류 헤드에 입력하여 최종 분류 결과를 도출합니다.

$$y = \text{LN}(z_0^L)$$

### 3. Inductive Bias (유도 편향)

CNN은 지역성(locality), 2차원 이웃 구조, 이동 불변성(translation equivariance) 등 이미지에 특화된 유도 편향을 내재하고 있습니다. 반면 ViT는 이러한 정보가 거의 없습니다. MLP 블록만 국소적으로 동작하고, self-attention은 전역적으로(globally) 동작하기 때문입니다. 실제 2D 구조 정보는 이미지 패치를 만드는 과정과 미세 조정 시 위치 임베딩을 보정하는 단계에서만 명시적으로 주입됩니다.

### 4. Hybrid Architecture (혼합형 아키텍처)

원시 이미지 패치 대신, CNN으로 추출된 피처 맵(feature map)에서 패치를 추출하여 Transformer에 입력하는 방식도 사용할 수 있습니다. CNN의 공간적 피처 추출 능력과 Transformer의 전역적 관계 학습을 결합한 접근입니다.

### 5. 사전 학습과 미세 조정

ViT는 대규모 데이터셋에서 사전 학습한 후 다운스트림 태스크에 미세 조정합니다. 미세 조정 시에는 사전 학습된 예측 헤드를 제거하고, 클래스 수 $K$에 맞는 새로운 $D \times K$ 크기의 피드포워드 레이어를 추가합니다.

### 6. 고해상도 입력 적용

미세 조정 단계에서 사전 학습보다 높은 해상도 이미지를 사용하면 성능이 향상될 수 있습니다. 패치 크기 $P$는 그대로 유지되므로 고해상도 이미지를 입력하면 더 많은 패치(더 긴 시퀀스)가 생성됩니다. 이때 기존 위치 임베딩이 맞지 않을 수 있으므로, 2D 보간법(interpolation)으로 위치 임베딩을 보정합니다. 이 과정이 ViT에 이미지의 2D 구조 정보를 수동으로 주입하는 유일한 단계입니다.

---

## ViT의 한계와 극복

중간 규모 데이터셋(ImageNet 등)에서는 CNN(ResNet) 대비 약간 낮은 성능을 보였습니다. Transformer가 CNN처럼 이미지의 위치나 국소적 특징을 자동으로 학습하는 유도 편향을 갖고 있지 않기 때문입니다.

그러나 **대규모 데이터셋(수천만~수억 장)** 에서 사전 학습할 경우, 이러한 단점이 극복되어 ViT가 CNN 기반 모델을 능가하는 성능을 보였습니다. 데이터 규모가 유도 편향의 부재를 보완하는 셈입니다.

---

## 결론: 이미지도 단어처럼 다룰 수 있다

ViT는 "이미지를 16×16 크기의 단어들로 보면 어떨까?"라는 단순한 아이디어에서 출발했지만, 그 결과는 컴퓨터 비전 연구의 패러다임을 바꾸었습니다. 텍스트와 이미지를 동일한 Transformer 프레임워크로 처리할 수 있다는 가능성을 열어주었고, 이후 멀티모달 AI 연구의 토대가 되었습니다.

Transformer 시리즈를 마무리하며, Attention is All You Need에서 시작된 작은 아이디어가 텍스트를 넘어 이미지까지 뻗어나가는 과정을 살펴보았습니다. 앞으로도 Transformer가 어떤 영역까지 확장될지 기대됩니다.
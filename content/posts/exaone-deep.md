---
title: "EXAONE-Deep : 국내 최초 Notable AI Models 등재 추론 모델"
date: "2025-03-22"
description: "LG AI 연구원이 공개한 오픈소스 추론 모델 EXAONE-Deep의 학습 방식과 사용법을 살펴봅니다."
tags: ["AI", "LLM", "EXAONE", "추론모델", "오픈소스", "논문리뷰"]
---

# EXAONE-Deep : 국내 최초 Notable AI Models 등재 추론 모델

AI/LLM 시리즈 : EXAONE-Deep

현재 OpenAI의 o3, Anthropic의 Claude 3.7 Sonnet 같은 폐쇄형 LLM에서 Reasoning이 대세가 되고 있습니다. 오픈소스 LLM 시장에서도 DeepSeek R1, Google의 Gemma-3 같은 추론 모델이 연이어 출시되면서 Reasoning이 확실한 트렌드로 자리잡는 모습입니다. (OpenAI는 GPT-4.5를 출시하며 "마지막 비추론 모델"이라고 언급하기도 했습니다.)

이런 흐름 속에서, 국내에서 꾸준히 뛰어난 성능의 오픈소스 LLM을 공개해온 **LG AI 연구원**이 EXAONE 라인업으로 **EXAONE-Deep**을 공개했습니다. 직접 테스트까지 진행해본 결과를 기술 리포트와 함께 정리해보겠습니다.

---

## EXAONE-Deep 개요

EXAONE-Deep은 총 3가지 사이즈로 출시되었습니다.

| 모델 | 파라미터 |
|---|---|
| EXAONE Deep | 2.4B |
| EXAONE Deep | 7.8B |
| EXAONE Deep | 32B |

특히 **32B 모델**은 미국 비영리 연구 기관인 Epoch AI의 **Notable AI Models** 리스트에 등재되며 성능을 공식 인정받았습니다. EXAONE 3.5에 이어 연이어 등재된 것으로, 최근 2년간 해당 리스트에 등재된 대한민국 모델은 EXAONE이 유일합니다.

---

## 모델 성능

Technical Report의 Abstract를 요약하면 다음과 같습니다.

수학과 코딩 벤치마크 등 다양한 추론 작업에서 뛰어난 성능을 보입니다. 소형 모델인 **EXAONE Deep 2.4B와 7.8B**는 동일 크기의 다른 모델을 능가했으며, **EXAONE Deep 32B**는 선도적인 오픈웨이트 모델과 경쟁력 있는 성능을 나타냈습니다. 모든 모델은 연구 목적으로 공개되어 있으며 [HuggingFace](https://huggingface.co/LGAI-EXAONE)에서 다운로드할 수 있습니다.

---

## 학습 방법론

EXAONE-Deep은 세 가지 학습 기법을 순차적으로 적용하여 추론 능력을 강화했습니다.

| 학습 기법 | 데이터 규모 |
|---|---|
| Supervised Fine-Tuning (SFT) | 160만 인스턴스 (약 120억 토큰) |
| Direct Preference Optimization (DPO) | 2만 선호도 데이터 |
| Online Reinforcement Learning (Online RL) | 1만 인스턴스 |

- **DPO** 학습에는 **SimPER** 알고리즘을 사용했습니다.
- **Online RL** 학습에는 DeepSeek R1에서도 사용된 **GRPO의 변형 알고리즘**을 사용했습니다.
- 학습 인프라는 Google Cloud Platform의 **NVIDIA H100 GPU 클러스터**와 **NVIDIA NeMo Framework**를 활용했습니다.

### 기반 모델 및 학습 데이터 구조

EXAONE Deep의 기반 모델은 **EXAONE 3.5 Instruct** 모델입니다. 추론 능력 강화를 위해 각 학습 인스턴스를 다음과 같은 구조로 구성했습니다.

- `<thought>` ~ `</thought>` 태그 내에서 단계별 논리 전개, 반성, 자기 점검 및 수정 과정을 수행
- 최종 답변은 사고 과정을 요약한 자립적인 답변으로 설계

이 구조화된 접근 방식을 통해 EXAONE Deep이 근거 있는 답변을 제공할 수 있도록 설계되었습니다.

---

## 사용 방법

모델은 HuggingFace `transformers` 라이브러리를 통해 사용할 수 있습니다.

```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, TextIteratorStreamer
from threading import Thread

model_name = "LGAI-EXAONE/EXAONE-Deep-32B"
streaming = True

model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.bfloat16,
    trust_remote_code=True,
    device_map="auto"
)
tokenizer = AutoTokenizer.from_pretrained(model_name)

# 프롬프트 예시 (AIME 2024 수학 문제)
prompt = r"""Let $x,y$ and $z$ be positive real numbers that satisfy the following system of equations:
\[\log_2\left({x \over yz}\right) = {1 \over 2}\]\[\log_2\left({y \over xz}\right) = {1 \over 3}\]\[\log_2\left({z \over xy}\right) = {1 \over 4}\]
Then the value of $\left|\log_2(x^4y^3z^2)\right|$ is $\tfrac{m}{n}$ where $m$ and $n$ are relatively prime positive integers. Find $m+n$.

Please reason step by step, and put your final answer within \boxed{}."""

messages = [{"role": "user", "content": prompt}]
input_ids = tokenizer.apply_chat_template(
    messages,
    tokenize=True,
    add_generation_prompt=True,
    return_tensors="pt"
)

if streaming:
    streamer = TextIteratorStreamer(tokenizer)
    thread = Thread(target=model.generate, kwargs=dict(
        input_ids=input_ids.to("cuda"),
        eos_token_id=tokenizer.eos_token_id,
        max_new_tokens=32768,
        do_sample=True,
        temperature=0.6,
        top_p=0.95,
        streamer=streamer
    ))
    thread.start()
    for text in streamer:
        print(text, end="", flush=True)
else:
    output = model.generate(
        input_ids.to("cuda"),
        eos_token_id=tokenizer.eos_token_id,
        max_new_tokens=32768,
        do_sample=True,
        temperature=0.6,
        top_p=0.95,
    )
    print(tokenizer.decode(output[0]))
```

### 설치 시 주의사항

EXAONE-Deep 사용에는 **flash-attention** 라이브러리 설치가 필요한데, 설치 과정이 까다롭습니다. HuggingFace에서도 권장하듯이 Docker Hub의 PyTorch 공식 이미지를 활용하는 것을 추천합니다.

```
pytorch/pytorch:2.6.0-cuda12.4-cudnn9-runtime
```

---

## 직접 사용해본 후기

RTX 3090 4장 환경에서 추론 시 결과가 출력될 때까지 체감상 꽤 느렸습니다. 추론 과정(Chain-of-Thought)이 길어지다 보니 어쩔 수 없는 부분인 것 같습니다.

이 문제에서 자유로운 모델은 사용 경험상 Google의 동급 추론 모델인 `google/gemma-3-27b-it`이 유일했습니다. 어떤 최적화를 적용했는지 궁금합니다. 다만 성능 자체는 매우 뛰어나다는 인상을 받았습니다.

> EXAONE은 자체 라이센스를 사용하기 때문에 상업적 활용이 제한됩니다. AI 어플리케이션 개발보다는 연구·테스트 목적으로 활용하는 것이 적합합니다.
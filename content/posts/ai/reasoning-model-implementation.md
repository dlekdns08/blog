---
title: "추론 모델을 구현해보자! (ft. S1, Budget Forcing)"
date: "2025-03-22"
description: "Test-Time Scaling 기법을 활용해 추론(Reasoning) 모델을 직접 구현해봅니다. CoT 프롬프팅부터 Budget Forcing, LoRA 파인튜닝까지."
tags: ["AI", "LLM", "Reasoning", "추론모델", "EXAONE", "S1", "LoRA", "Fine-tuning"]
---

# 추론 모델을 구현해보자!

앞선 포스팅에서 EXAONE-Deep 관련 내용을 다루면서 추론 모델들이 굉장히 큰 인기를 끌면서 많은 추론 모델들이 출시되었다고 했는데요. 저는 Deepseek R1과 같은 모델들을 사용만 했지 실제로 어떻게 구현되는지에 대해서는 무관심했던 것 같아서 이번 포스팅에서는 실제로 어떻게 구현되는지에 대해서 작성해보고자 합니다.

이번 포스팅은 SK DEVOCEAN 사이트에 올라와 있는 **"생각하는 AI? 추론 모델 빠르게 구현해 보기 (ft. S1)"** 이라는 포스팅을 참고하여 작성되었습니다. 해당 포스팅에서는 스탠포드 대학교의 연구진이 공개한 S1 모델과 함께 상대적으로 적은 비용으로도 높은 추론 성능을 달성할 수 있는 **Test-Time Scaling** 기법을 소개하고 있습니다.

---

## Inference vs Reasoning: 추론이란?

추론이라는 단어가 사실 가장 헷갈리는 부분일 수 있습니다. 추론은 두 가지를 의미하기 때문입니다.

| 용어 | 설명 |
|------|------|
| **Inference (추론)** | 주어진 정보나 데이터를 바탕으로 결론을 도출하는 과정. 관찰된 사실에서 논리적으로 결론을 이끌어내는 구체적인 행위 |
| **Reasoning (사고 과정)** | 문제를 해결하거나 의사결정을 내리기 위해 여러 정보를 종합하고 논리적 관계를 파악하는 전반적인 사고 과정. 단순한 결론 도출을 넘어 다양한 가능성을 고려하고 스스로 반성하며 수정하는 복잡한 인지 활동 |

간단히 말해, Inference는 결론을 도출하는 행위이고, Reasoning은 그 결론에 도달하기 위한 전반적인 사고의 흐름입니다. 이 포스팅에서 구현하고자 하는 것은 **Reasoning(사고 과정)** 이며, 이하 **"사고"** 라는 표현을 사용하겠습니다.

---

## Train-Time Scaling의 한계

LLM을 만드는 과정은 크게 두 단계로 나뉩니다.

1. **사전 학습 (Pre-Training)** — 방대한 텍스트 데이터로 언어의 패턴과 구조를 학습. 확률적 언어 모델링을 통해 문맥을 이해하고 다음 단어를 예측하는 능력을 갖춤
2. **후처리 학습 (Post-Training)** — SFT, RLHF, DPO 등의 기법으로 원하는 방식의 출력을 만들도록 미세 조정

두 단계 모두 더 많은 데이터와 연산 자원이 필요하기 때문에, 이를 **Train-Time Scaling** 이라고 부릅니다.

그러나 이 방식에는 한계가 있습니다.

- 모델이 학습한 데이터에만 의존하여 답변을 생성
- 출력이 한 번에 이루어지기 때문에 추론 중 잘못된 답변이 발생해도 수정 불가
- 잘못된 출력을 고치려면 추가 튜닝과 재학습이 필요 → 지속적인 비용 발생

---

## Test-Time Scaling

**Test-Time Scaling** 은 학습 시점이 아니라, **추론(Inference) 과정에서 컴퓨팅 자원을 활용해 성능을 개선**하는 방법입니다.

OpenAI의 o1 모델이 대표적인 예로, 사용자의 질문에 즉각 답변하는 대신 여러 차례의 추론과 자기 검증 과정을 거쳐 "깊이 생각"하도록 설계되었습니다.

### CoT와의 차이점

CoT(Chain of Thought) 프롬프팅과 비슷해 보이지만 핵심적인 차이가 있습니다.

| | CoT 프롬프팅 | Test-Time Scaling |
|--|--|--|
| 중간 단계 검증 | 어려움 | 반복적으로 검증 및 오류 수정 |
| 잘못된 추론 수정 | 불가 | 가능 |

다만 Test-Time Scaling의 한계도 있습니다. 모델이 충분한 내재적 지식과 문제 해결 능력을 갖추고 있어야 효과를 발휘합니다. 초등학교 수준의 수학 지식을 가진 모델이 대학 수준의 문제를 아무리 오래 생각해도 정답에 도달하기 어렵다는 점은 명심해야 합니다.

---

## 1단계: CoT 프롬프팅 구현

CoT 프롬프팅은 모델이 최종 답변만 내놓는 것이 아니라, 문제 해결 과정을 여러 단계의 사고로 진행하도록 유도하는 기법입니다.

> 참고 포스팅 및 S1 논문에서는 Qwen2.5-7B를 사용하였으나, 이 포스팅에서는 **EXAONE-3.5-7.8B-Instruct** 를 활용하였습니다.

```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

model_name = "LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct"

model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.bfloat16,
    trust_remote_code=True,
    device_map="auto"
)
tokenizer = AutoTokenizer.from_pretrained(model_name)

prompt = """
문제:
한 직사각형의 너비를 x라고 하고, 길이가 너비의 3배라고 합시다.
이 직사각형의 둘레가 64cm일 때, 직사각형의 넓이를 구하세요.

요청:
문제를 풀 때, 먼저 너비와 길이의 관계를 파악하고, 둘레의 공식을 이용해
x의 값을 찾은 다음, 넓이를 계산하는 과정을 단계별로 상세하게 설명해 주세요.
"""

messages = [
    {"role": "system",
     "content": "You are EXAONE model from LG AI Research, a helpful assistant."},
    {"role": "user", "content": prompt}
]

input_ids = tokenizer.apply_chat_template(
    messages,
    tokenize=True,
    add_generation_prompt=True,
    return_tensors="pt"
)

output = model.generate(
    input_ids.to("cuda"),
    eos_token_id=tokenizer.eos_token_id,
    max_new_tokens=128,
    do_sample=False,
)
print(tokenizer.decode(output[0]))
```

이런 식으로, 답변 과정에서 최종 답변을 도출하기 위한 과정을 설명합니다.

그러나 **CoT 프롬프팅의 한계**는 명확합니다. 중간에 잘못된 방향으로 추론이 흘러가더라도 수정할 수 없습니다. 풀이 과정과 답이 틀리는 경우, 해당 패턴에 대한 데이터셋을 새로 만들어 재학습시켜야만 올바른 사고 과정을 만들어낼 수 있습니다.

---

## 2단계: Budget Forcing — 사고 과정을 제어하라

S1 논문에서 사용한 핵심 기법이 바로 **Budget Forcing** 입니다. 디코딩 단계에서 모델의 추론 과정을 직접 제어하는 방식으로, 두 가지 메커니즘으로 작동합니다.

### 메커니즘 1: 최대 사고 토큰 수 제한

모델이 정해진 토큰 수를 초과해 추론할 경우, 강제로 `end-of-thinking` 토큰과 `Final Answer:` 를 삽입해 사고를 종료하고 최종 답변을 생성하게 합니다.

### 메커니즘 2: 최소 사고 토큰 수 보장

모델이 충분한 추론 없이 답변을 너무 빨리 끝내려 할 때, `end-of-thinking` 토큰 생성을 억제하고 **"Wait"** 이라는 단어를 삽입해 모델이 더 깊이 생각하고 검증하는 과정을 반복하도록 유도합니다.

### Budget Forcing 예시

논문에서는 라즈베리(raspberry)에 포함된 "r"의 개수를 묻는 질문에서 이 기법을 설명합니다.

1. 모델이 처음에 "2"라는 잘못된 답을 제시
2. 최소 사고 토큰 보장에 의해 출력에 **"Wait"** 이 추가
3. 모델이 "Wait" 이후 다시 추론을 진행
4. 최종적으로 `Final Answer:` 와 함께 올바른 정답 도출

이 과정을 통해 모델은 반복적으로 사고를 진행하며 정답에 도달할 수 있게 됩니다.

---

## 3단계: LoRA 파인튜닝으로 Reasoning 모델 만들기

이제 실제로 추론 모델을 학습시켜 보겠습니다. 전체 코드는 [GitHub](https://github.com/superdom/blog/tree/main/030925-reasoning-model) 에서 확인하실 수 있습니다.

### 라이브러리 임포트

```python
from datasets import load_dataset, Dataset
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import prepare_model_for_kbit_training, LoraConfig
from trl import SFTConfig, SFTTrainer
from typing import Dict
```

### 모델 로드 및 토크나이저 설정

```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

model_name = "LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct"

model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.bfloat16,
    trust_remote_code=True,
).to("cuda:0")

tokenizer = AutoTokenizer.from_pretrained(model_name)
tokenizer.pad_token = "<|fim_pad|>"
tokenizer.pad_token_id = 151662
tokenizer.padding_side = 'left'
```

### 데이터셋 로드 및 전처리

사고 과정 구분자(`<|im_start|>think`, `<|im_start|>answer`)를 추가해 Reasoning 패턴을 학습시킵니다.

```python
dataset = load_dataset("werty1248/s1k-1.1-Ko-ReGenerated-Formatted", split='train')

QUERY_TEMPLATE_NOANSWER = """{Question}""".strip()

def process_cot_example(example: Dict, tokenizer):
    thinking_trajectory = example["reasoning_ko"]
    question = example["question_ko"]
    answer = example["answer_ko"]

    prompt = QUERY_TEMPLATE_NOANSWER.format(Question=question)
    answer = "Answer: " + answer if "Answer:" not in answer else answer

    text = tokenizer.apply_chat_template([
        {"role": "user", "content": prompt},
        {
            "role": "assistant",
            "content": "<|im_start|>think\n" + thinking_trajectory.strip() +
                       "\n<|im_start|>answer\n" + answer.strip()
        }
    ], tokenize=False)
    return dict(text=text)

dataset = dataset.map(lambda example: process_cot_example(example, tokenizer))
dataset = dataset.remove_columns([col for col in dataset.column_names if col != "text"])
```

### LoRA 설정 및 학습

```python
lora_config = LoraConfig(
    task_type="CAUSAL_LM",
    r=32,
    lora_alpha=32,
    lora_dropout=0.05,
    bias="none",
    target_modules=['k_proj', 'o_proj', 'q_proj', 'v_proj',
                    'up_proj', 'down_proj', 'gate_proj'],
)

training_arguments = SFTConfig(
    output_dir="./output",
    optim="adamw_8bit",
    per_device_train_batch_size=1,
    gradient_accumulation_steps=32,
    gradient_checkpointing=True,
    log_level="debug",
    save_strategy="epoch",
    logging_steps=2,
    learning_rate=5e-5,
    bf16=True,
    num_train_epochs=6,
    weight_decay=1e-4,
    warmup_ratio=0.1,
    lr_scheduler_type="linear",
    dataset_text_field="text",
    max_seq_length=20000,
    report_to='none'
)

trainer = SFTTrainer(
    model=model,
    train_dataset=dataset,
    peft_config=lora_config,
    args=training_arguments,
)

model.config.use_cache = False
trainer.train()
```

---

## 4단계: vLLM으로 추론 모델 테스트

학습된 모델을 vLLM을 활용해 인퍼런스합니다. Budget Forcing의 핵심인 반복 사고 루프를 직접 구현합니다.

```python
from vllm import LLM, SamplingParams
from vllm.lora.request import LoRARequest

MAX_TOKENS_THINKING = 20000  # 최대 사고 토큰 수
NUM_IGNORE = 2               # 반복 사고 횟수

# 첫 번째 추론 단계
prompt = "<|im_start|>system\nYou are Exaone, You are a helpful assistant.<|im_end|>\n"
prompt += "<|im_start|>user\n" + prompts[0] + "<|im_end|>\n<|im_start|>assistant\n"

stop_token_ids = tok("<|im_start|><|im_end|>")["input_ids"]

sampling_params = SamplingParams(
    max_tokens=MAX_TOKENS_THINKING,
    min_tokens=0,
    stop_token_ids=stop_token_ids,
    skip_special_tokens=False,
    temperature=0,
)

prompt += "<|im_start|>think"

o = model.generate(prompt, sampling_params=sampling_params)
print(prompt + o[0].outputs[0].text)

# 반복 사고 단계 (Budget Forcing: "Wait" 삽입)
ignore_str = "잠깐,"
max_tokens_thinking_tmp = MAX_TOKENS_THINKING

for i in range(NUM_IGNORE):
    max_tokens_thinking_tmp -= len(o[0].outputs[0].token_ids)
    prompt += o[0].outputs[0].text + ignore_str  # "잠깐," 삽입으로 재사고 유도

    sampling_params = SamplingParams(
        max_tokens=max_tokens_thinking_tmp,
        min_tokens=0,
        stop_token_ids=stop_token_ids,
        skip_special_tokens=False,
        temperature=0.0,
    )
    o = model.generate(prompt, sampling_params=sampling_params)

print(prompt + o[0].outputs[0].text)
```

---

## 마치며

이와 같이 Test-Time Scaling과 Budget Forcing을 활용해 추론 모델을 직접 구현해볼 수 있습니다.

단, 위의 학습은 실습 목적으로 **7.8B의 작은 모델, 적은 에폭, LoRA** 를 활용했기 때문에 기대하시는 수준의 성능을 얻기 어려울 수 있습니다. 만족스러운 성능을 위해서는 다음이 필요합니다.

- 더 큰 모델 (30B 이상)
- 더 많은 데이터셋
- Full Fine-Tuning (FFT)

그럼에도 불구하고, "추론 모델이 어떻게 동작하는가"를 직접 손으로 구현해보는 경험은 충분히 가치 있다고 생각합니다. Deepseek R1이나 o1이 단순히 "더 잘 생각하는 모델"이 아니라, 디코딩 단계에서 명시적으로 사고 과정을 제어하는 구조라는 점을 이해하는 것이 출발점이 됩니다.

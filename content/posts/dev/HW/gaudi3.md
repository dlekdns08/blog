---
title: "AI 가속기 시리즈 - Intel Gaudi (3)"
date: "2025-04-11"
description: "Intel Gaudi2에서 FP8 양자화 모델을 구동하고 fine-tuning하는 방법을 소개합니다."
tags: ["AI", "Gaudi", "양자화", "Fine-Tuning", "Intel", "AI가속기"]
---

# AI 가속기 시리즈 - Intel Gaudi (3)

AI 가속기 시리즈 : Intel Gaudi — 양자화 및 파인튜닝

지난 포스팅에서는 Intel Gaudi2와 vLLM-fork를 활용하여 LLM을 서빙하는 방법을 다루었습니다. 이번에는 **양자화(Quantization)된 모델을 구동하는 방법**과 **Fine-tuning 방법**에 대해 정리해보겠습니다.

---

## 준비 사항: Docker 컨테이너 구동

```bash
docker pull vault.habana.ai/gaudi-docker/1.20.0/ubuntu22.04/habanalabs/pytorch-installer-2.6.0:latest

docker run -it --runtime=habana \
  -e HABANA_VISIBLE_DEVICES=all \
  -e OMPI_MCA_btl_vader_single_copy_mechanism=none \
  --cap-add=sys_nice --net=host --ipc=host --restart always \
  -e HUGGINGFACE_HUB_CACHE=/hf_cache \
  -e HF_TOKEN=<hf_token> \
  -p <port>:<port> \
  --name gaudi3 \
  vault.habana.ai/gaudi-docker/1.20.0/ubuntu22.04/habanalabs/pytorch-installer-2.6.0:latest
```

---

## 1. 모델 양자화 (FP8 Quantization)

현재 Intel Gaudi는 NVIDIA와 같은 다양한 양자화 포맷을 완전히 지원하지는 않습니다. UINT, GGUF 형식도 제공하고 있으나 독자 규격이며 안정성에 의문이 있습니다. 따라서 이번 포스팅에서는 **FP8 양자화** 방법을 소개합니다.

### Step 1. vllm-hpu-extension 클론

```bash
git clone https://github.com/HabanaAI/vllm-hpu-extension.git
cd vllm-hpu-extension/calibration
```

### Step 2. Calibration 데이터셋 준비

양자화 calibration에서는 모델의 가중치와 활성값을 낮은 정밀도로 표현하기 위한 스케일과 제로포인트를 결정합니다. 이 과정에서 실제 데이터 분포를 반영하는 **대표성 있는 데이터셋**이 매우 중요합니다.

아래 명령어로 calibration 데이터셋을 다운로드할 수 있습니다. ([다운로드 스크립트 참고](https://github.com/HabanaAI/Gaudi-tutorials/blob/main/PyTorch/vLLM_Tutorials/FP8_Quantization_using_INC/download_dataset.sh))

```bash
wget https://rclone.org/install.sh
chmod a+x ./install.sh
bash install.sh

rclone config create mlc-inference s3 \
  provider=Cloudflare \
  access_key_id=f65ba5eef400db161ea49967de89f47b \
  secret_access_key=fbea333914c292b854f14d3fe232bad6c5407bf0ab1bebf78833c2b359bdfd2b \
  endpoint=https://c2686074cb2caf5cbaf6d134bdba8b47.r2.cloudflarestorage.com

rclone copy mlc-inference:mlcommons-inference-wg-public/open_orca /root/open_orca -P

gzip -c -d /root/open_orca/open_orca_gpt4_tokenized_llama.sampled_24576.pkl.gz \
  > /root/open_orca/open_orca_gpt4_tokenized_llama.sampled_24576.pkl
```

### Step 3. Calibration 실행

```bash
./calibrate_model.sh \
  -m Llama-3.1-405B-Instruct/ \
  -d dataset-processed.pkl \
  -o ./inc \
  -b 128 \
  -t 8 \
  -l 4096
```

주요 옵션은 다음과 같습니다.

| 옵션 | 설명 |
|---|---|
| `-m` | 모델 경로 또는 ID |
| `-d` | Calibration 데이터셋 경로 (pkl 파일) |
| `-o` | measurement 파일이 저장될 출력 경로 |
| `-t` | Tensor Parallelism 크기 (1~8, 메모리 오류 시 높은 값 사용) |

### Step 4. FP8 양자화 모델 서빙

```bash
PT_HPU_ENABLE_LAZY_COLLECTIVES=true
EXPERIMENTAL_WEIGHT_SHARING="0"
VLLM_SKIP_WARMUP="true"
QUANT_CONFIG="/data/llama3.1_405b/measure_files/maxabs_quant.json"

vllm serve Meta-Llama-3.1-405B-Instruct \
  --quantization inc \
  --kv-cache-dtype fp8_inc \
  --weights-load-device cpu \
  --tensor-parallel-size 8 \
  --max-model-len $MAX_MODEL_LEN \
  --max-num-seqs $BS \
  --max-num-batched-tokens $MAX_NUM_TOKENS
```

---

## 2. 모델 파인튜닝 (Fine-tuning)

GPU가 아닌 AI 가속기에서의 학습은 생태계 미성숙 등의 문제로 쉽지 않습니다. Intel Gaudi(HPU)도 마찬가지이므로, 여러 참고 문서를 꼼꼼히 확인하면서 진행하는 것을 권장합니다.

### Step 1. optimum-habana 설치

```bash
pip install --upgrade-strategy eager optimum[habana]
```

### Step 2. optimum-habana 레포지토리 클론

```bash
git clone https://github.com/huggingface/optimum-habana
cd optimum-habana
# git checkout v1.16.0  # 버전 고정이 필요한 경우
```

> **주의**: 여러 예제에서 `v1.17.0.dev` 이상을 요구하는 경우가 있습니다. 문서가 업데이트되지 않아 발생하는 문제로 보이니, 최신 버전을 사용하는 것을 권장합니다.

### Step 3. 의존성 설치 및 파인튜닝 실행

```bash
cd examples
pip install -r requirements.txt
```

파인튜닝 방법은 아래 공식 예제를 참고하세요.

- [optimum-habana language-modeling 예제](https://github.com/huggingface/optimum-habana/tree/main/examples/language-modeling)
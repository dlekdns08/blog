---
title: "AI 가속기 시리즈 - Intel Gaudi (2)"
date: "2025-03-29"
description: "Intel Gaudi2에서 vLLM-fork를 활용하여 LLM 추론 서버를 구축하는 방법을 소개합니다."
tags: ["AI", "Gaudi", "vLLM", "Intel", "LLM", "AI가속기", "추론"]
---

# AI 가속기 시리즈 - Intel Gaudi (2)

AI 가속기 시리즈 : Intel Gaudi 실전 사용법

지난 포스팅에서 소개한 Intel Gaudi를 실질적으로 사용하는 방법을 다루어 보겠습니다.

> 이 글의 모든 내용은 **Gaudi2** 기준으로 작성되었습니다.

---

## Gaudi에서 사용 가능한 라이브러리

Gaudi는 NVIDIA GPU에서 사용 가능했던 많은 라이브러리를 그대로 사용하기 어렵습니다. 특히 추론 시 자주 활용되는 **ollama**와 **llama.cpp**는 Gaudi에서 사용이 불가능합니다.

다행히 **vLLM**은 사용 가능합니다. HabanaAI에서 vLLM을 fork하여 Intel HPU에서 동작하도록 수정한 버전을 제공합니다.

- **vllm-fork**: [https://github.com/HabanaAI/vllm-fork](https://github.com/HabanaAI/vllm-fork)
- **하바나 공식 문서**: [vLLM Inference Server with Gaudi](https://docs.habana.ai/en/latest/PyTorch/Inference_on_PyTorch/vLLM_Inference.html)

> 참고로 vllm-fork의 README.md는 원본 vLLM 기준으로 되어 있어, 공식 문서를 함께 참조하는 것을 추천합니다.

---

## vLLM-fork를 활용한 추론 서버 구축

### 1. 레포지토리 클론

```bash
git clone https://github.com/HabanaAI/vllm-fork
cd vllm-fork
```

### 2. Dockerfile 수정

`Dockerfile.hpu`를 활용하여 Docker 이미지를 빌드합니다. 기본 Dockerfile은 아래와 같습니다.

```dockerfile
FROM vault.habana.ai/gaudi-docker/1.20.0/ubuntu22.04/habanalabs/pytorch-installer-2.6.0:latest

COPY ./ /workspace/vllm

WORKDIR /workspace/vllm

RUN pip install --upgrade pip && \
    pip install -v -r requirements-hpu.txt

ENV no_proxy=localhost,127.0.0.1
ENV PT_HPU_ENABLE_LAZY_COLLECTIVES=true

RUN VLLM_TARGET_DEVICE=hpu python3 setup.py install

RUN python3 -m pip install -e tests/vllm_test_utils

WORKDIR /workspace/

RUN ln -s /workspace/vllm/tests && ln -s /workspace/vllm/examples && ln -s /workspace/vllm/benchmarks

ENTRYPOINT ["python3", "-m", "vllm.entrypoints.openai.api_server"]
```

### 3. requirements-common.txt 수정 (중요)

기본 설정으로 빌드하면 다음과 같은 에러가 발생합니다.

```
pynvml.NVMLError_LibraryNotFound: NVML Shared Library Not Found
```

이는 HuggingFace `transformers` 라이브러리의 최신 버전이 HPU에서 지원되지 않기 때문입니다. `requirements-common.txt`에서 `transformers` 버전을 아래와 같이 고정해야 합니다.

```text
psutil
sentencepiece
numpy < 2.0.0
requests >= 2.26.0
tqdm
blake3
py-cpuinfo
transformers >= 4.48.2, < 4.49  # HPU 호환 버전으로 고정
tokenizers >= 0.19.1
protobuf
fastapi[standard] >= 0.107.0, < 0.113.0; python_version < '3.9'
fastapi[standard] >= 0.107.0, != 0.113.*, != 0.114.0; python_version >= '3.9'
aiohttp
openai >= 1.52.0
pydantic >= 2.9
prometheus_client >= 0.18.0
pillow
prometheus-fastapi-instrumentator >= 7.0.0
tiktoken >= 0.6.0
lm-format-enforcer >= 0.10.9, < 0.11
outlines == 0.1.11
lark == 1.2.2
xgrammar == 0.1.11; platform_machine == "x86_64"
typing_extensions >= 4.10
filelock >= 3.16.1
partial-json-parser
pyzmq
msgspec
gguf == 0.10.0
importlib_metadata
mistral_common[opencv] >= 1.5.0
pyyaml
six>=1.16.0; python_version > '3.11'
setuptools>=74.1.1; python_version > '3.11'
einops
compressed-tensors == 0.9.1
depyf==0.18.0
cloudpickle
```

> 최근 commit에서 이 문제가 수정된 것으로 보입니다. 최신 버전 사용 시 이 단계를 건너뛰어도 됩니다.

### 4. Docker 이미지 빌드

```bash
docker build -f Dockerfile.hpu -t vllm-fork:hpu .
```

### 5. Docker 컨테이너 실행

```bash
docker run -it --runtime=habana \
  -e HABANA_VISIBLE_DEVICES=all \
  -e OMPI_MCA_btl_vader_single_copy_mechanism=none \
  --cap-add=sys_nice --net=host --ipc=host \
  --entrypoint /bin/bash \
  -p <your_port>:<your_port> \  # 사용할 포트로 수정
  vllm-fork:hpu
```

### 6. 추론 서버 실행

Docker 터미널 진입 후 아래 명령어로 vLLM API 서버를 실행합니다.

```bash
python -m vllm.entrypoints.openai.api_server \
  --model=Qwen/QwQ-32B \
  --tensor-parallel-size 8 \
  --port 12251
```

> `--tensor-parallel-size`는 현재 사용 가능한 HPU 개수 이하로 설정해주세요.

---

## 주의사항

현재 vllm-fork에서 아직 지원되지 않는 최신 모델들이 있습니다. 대표적으로 **Gemma3**과 **EXAONE 추론 모델** 등이 해당됩니다. 이러한 모델을 사용하려면 vLLM 코드 일부를 직접 수정해야 합니다.

다음 포스팅에서는 Gaudi의 **Habana Framework**에 대해 더 자세히 다루어 보겠습니다.
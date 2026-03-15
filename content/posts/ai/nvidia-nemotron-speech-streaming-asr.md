---
title: "NVIDIA Nemotron Speech Streaming ASR"
date: "2026-01-12"
description: "NVIDIA가 개발한 캐시 인식 스트리밍 ASR 모델 Nemotron Speech를 소개합니다. FastConformer + RNN-T 아키텍처로 기존 대비 3배 효율성 향상, 재훈련 없는 런타임 지연 조정까지 상세히 정리합니다."
tags: ["AI", "ASR", "음성인식", "NVIDIA", "NeMo", "스트리밍", "FastConformer", "RNN-T"]
---

# NVIDIA Nemotron Speech Streaming ASR

AI 시리즈 : NVIDIA Nemotron Speech Streaming ASR

실시간 음성 인식 기술은 음성 비서, 실시간 자막, 대화형 AI 시스템 등 다양한 분야에서 필수적인 기술로 자리잡았습니다. 그러나 전통적인 ASR 시스템은 속도와 정확도 사이의 트레이드오프, 높은 계산 비용, 그리고 동시 처리 시 발생하는 지연 증가 등의 문제를 안고 있었습니다.

NVIDIA는 이러한 문제를 해결하기 위해 **Nemotron Speech Streaming ASR** 모델을 개발했습니다. 혁신적인 캐시 인식(cache-aware) 아키텍처를 통해 기존 시스템 대비 최대 3배 향상된 효율성을 달성하면서도 높은 정확도를 유지합니다.

---

## 1. 이론적 배경: 음성 인식의 진화

### 1.1 전통적인 스트리밍 ASR의 한계

기존의 스트리밍 ASR 시스템은 주로 **버퍼링 추론(buffered inference)** 방식을 사용했습니다. 슬라이딩 윈도우를 통해 오디오를 처리하며, 각 새로운 윈도우는 이전 윈도우와 중복됩니다. 이는 컨텍스트를 유지하기 위한 방법이지만 본질적으로 비효율적입니다.

버퍼링 추론의 문제점으로는 이미 처리한 오디오를 반복 재처리하는 **중복 계산**, 동시 스트림 수 증가 시 급격히 증가하는 **메모리 폭발**, 높은 동시성 환경에서의 **지연 시간 증가**, 그리고 특정 부하를 넘어서면 성능이 급격히 저하되는 **'scaling cliff' 현상**이 있습니다.

### 1.2 종단 간(End-to-End) ASR 모델의 발전

현대의 E2E ASR 접근법은 크게 세 가지로 분류됩니다.

| 방식 | 특징 | 스트리밍 적합성 |
|---|---|---|
| **CTC** | 간단하지만 출력 간 독립성 가정으로 언어 모델링 제한 | 보통 |
| **AED** | 높은 정확도, 전체 입력 시퀀스 필요 | 낮음 |
| **RNN-T** | 스트리밍 지원과 언어 모델링 모두 제공 | 높음 |

### 1.3 RNN-T (Recurrent Neural Network Transducer)

RNN-T는 Alex Graves가 2012년 제안한 시퀀스-투-시퀀스 모델로, 세 개의 핵심 네트워크로 구성됩니다.

- **전사 네트워크(Encoder)**: 음향 특징을 추출하여 고수준 표현 생성
- **예측 네트워크(Prediction Network)**: 이전에 출력된 토큰 기반으로 다음 토큰 예측. 오디오가 아닌 텍스트만 보기 때문에 대규모 텍스트 데이터로 사전 훈련 가능
- **조인트 네트워크(Joint Network)**: 인코더와 디코더의 출력을 결합하여 최종 출력 확률 계산

단방향 인코더를 사용해 온라인/스트리밍 방식으로 작동 가능하며, CTC의 프레임 독립성 가정을 극복하여 더 나은 언어 모델링이 가능합니다. 디코더 그래프가 필요 없어 온디바이스 ASR에 이상적입니다.

---

## 2. Nemotron Speech Streaming 아키텍처

### 2.1 FastConformer: 효율적인 음성 인코더

Nemotron Speech 모델의 핵심은 **FastConformer** 아키텍처입니다. 원래의 Conformer 모델은 높은 정확도를 제공하지만 계산 비용이 매우 높았습니다. FastConformer는 네 가지 주요 개선사항을 통해 이 문제를 해결했습니다.

**1) 효율적인 다운샘플링**: 기존 4배(10ms → 40ms) 다운샘플링에서 8배(10ms → 80ms)로 확장. 어텐션 레이어가 처리해야 할 시퀀스 길이를 절반으로 줄여 계산량과 메모리 사용량을 크게 감소시킵니다.

**2) 선형 확장 가능 어텐션**: 전역 어텐션을 제한된 컨텍스트 어텐션으로 대체하고 글로벌 토큰을 추가하여 최대 11시간의 긴 형식 음성 처리를 가능하게 합니다. 표준 어텐션의 O(T²) 복잡도를 선형 시간으로 감소시킵니다.

결과적으로 FastConformer는 원래 Conformer보다 **2.8배 빠르면서도 동등하거나 더 나은 정확도**를 달성합니다.

### 2.2 캐시 인식 스트리밍: 게임 체인저

Nemotron Speech의 가장 혁신적인 특징은 **캐시 인식(cache-aware) 스트리밍 메커니즘**입니다.

버퍼링 추론과 달리, 캐시 인식 시스템은 모든 인코더 셀프 어텐션 레이어와 컨볼루션 레이어에 대한 내부 캐시를 유지합니다. **각 오디오 프레임은 정확히 한 번만 처리되며, 중복이나 겹침이 없습니다.**

- **셀프 어텐션 캐싱**: 이전 청크의 키(K)와 값(V) 벡터를 캐시. 새로운 청크가 들어오면 캐시된 K, V를 현재 청크의 것과 연결하여 과거 컨텍스트를 유지하면서 재계산을 피합니다.
- **컨볼루션 캐싱**: 컨볼루션에 필요한 이전 프레임들을 저장하여, 각 새로운 청크가 올바른 컨텍스트로 처리되도록 합니다.

### 2.3 모델 사양

| 구성 요소 | 사양 |
|---|---|
| 인코더 | 캐시 인식 FastConformer (24 레이어) |
| 디코더 | RNN-T |
| 파라미터 수 | 600M (6억 개) |
| 다운샘플링 | 8x (10ms → 80ms) |
| 입력 형식 | 16kHz 모노 오디오 (최소 80ms) |
| 출력 | 영어 텍스트 (구두점 및 대문자 포함) |
| 학습 데이터 | 285,000시간 (Granary 데이터셋 포함) |

### 2.4 청크 크기와 지연-정확도 트레이드오프

Nemotron Speech의 핵심 혁신 중 하나는 **재훈련 없이 런타임에 청크 크기를 동적으로 조정**할 수 있다는 점입니다.

| 청크 크기 | att_context_size | 평균 WER | 사용 사례 |
|---|---|---|---|
| 1.12초 | [70, 13] | 7.16% | 배치 전사, 높은 정확도 |
| 0.56초 | [70, 6] | 7.22% | 균형잡힌 지연/정확도 |
| 0.16초 | [70, 1] | 7.84% | 저지연 음성 비서 |
| 0.08초 | [70, 0] | 8.53% | 초저지연 실시간 |

---

## 3. 실전 사용 가이드

### 환경 설정

```bash
# 시스템 라이브러리 설치
apt-get update && apt-get install -y libsndfile1 ffmpeg

# Python 패키지 설치
pip install Cython packaging
pip install git+https://github.com/NVIDIA/NeMo.git@main#egg=nemo_toolkit[asr]
```

### 기본 사용법

```python
import nemo.collections.asr as nemo_asr

# 모델 로드
asr_model = nemo_asr.models.ASRModel.from_pretrained(
    model_name="nvidia/nemotron-speech-streaming-en-0.6b"
)

# 오디오 파일 전사
transcripts = asr_model.transcribe(["path/to/audio.wav"])
print(transcripts[0])
```

### 고급 스트리밍 추론

```bash
cd NeMo
python examples/asr/asr_cache_aware_streaming/speech_to_text_cache_aware_streaming_infer.py \
    model_path=nvidia/nemotron-speech-streaming-en-0.6b \
    dataset_manifest=my_dataset.json \
    batch_size=16 \
    att_context_size="[70,13]" \
    output_path=./results
```

### 파이프라인 기반 추론 (PnC 및 ITN 포함)

```python
from nemo.collections.asr.inference.factory.pipeline_builder import PipelineBuilder
from omegaconf import OmegaConf

cfg = OmegaConf.load('cache_aware_rnnt.yaml')
audios = ['/path/to/your/audio.wav']

pipeline = PipelineBuilder.build_pipeline(cfg)
output = pipeline.run(audios)

for entry in output:
    print(entry['text'])
```

### 청크 크기 동적 조정

```bash
# 초저지연 (80ms) — 실시간 대화용
att_context_size="[70,0]"

# 저지연 (160ms) — 음성 비서용
att_context_size="[70,1]"

# 균형 (560ms) — 일반 실시간 애플리케이션
att_context_size="[70,6]"

# 높은 정확도 (1120ms) — 배치 전사용
att_context_size="[70,13]"
```

**청크 크기 선택 가이드**는 실시간 음성 에이전트/대화형 AI에는 80~160ms, 실시간 자막/라이브 전사에는 560ms, 배치 처리/오프라인 전사에는 1120ms가 적합합니다.

---

## 4. 성능 분석 및 벤치마크

### 정확도 벤치마크

| 데이터셋 | 1.12s | 0.56s | 0.16s | 0.08s |
|---|---|---|---|---|
| AMI | 11.58% | 11.69% | 13.88% | 16.05% |
| LibriSpeech test-clean | 2.31% | 2.40% | 2.43% | 2.55% |
| LibriSpeech test-other | 4.75% | 4.97% | 5.33% | 5.79% |
| **평균 WER** | **7.16%** | **7.22%** | **7.84%** | **8.53%** |

### 효율성 및 확장성

캐시 인식 아키텍처의 핵심 이점은 기존 버퍼링 방식 대비 **최대 3배 향상된 처리량**, 동시성이 3배 증가해도 거의 일정한 **안정적인 지연 시간**, **선형 메모리 확장**으로 예측 가능한 배치 처리, 그리고 LLM 추론 및 TTS를 포함한 전체 음성 에이전트 파이프라인의 **엔드투엔드 지연 감소**입니다.

---

## 5. 결론 및 향후 전망

NVIDIA Nemotron Speech Streaming ASR은 실시간 음성 인식의 패러다임을 변화시키는 혁신적인 모델입니다.

**핵심 성과**는 기존 버퍼링 시스템 대비 **3배 향상된 효율성**, **7.16%의 경쟁력 있는 평균 WER**(1.12초 청크), **재훈련 없는 런타임 지연 조정**(80ms~1120ms), 그리고 **예측 가능한 선형 확장성**과 안정적인 고동시성 처리입니다.

향후 발전 방향으로는 다국어 지원 확대(현재 영어만 지원), 더 작은 모델 크기로 엣지 디바이스 배포 강화, 도메인 특화 파인튜닝 지원 확대, 그리고 소음 환경 및 원거리 음성 인식 성능 개선이 있습니다.

---

## 참고 문헌

- Rekesh, D., et al. (2023). "Fast Conformer with Linearly Scalable Attention for Efficient Speech Recognition." arXiv:2305.05084
- Kim, J., et al. (2023). "Stateful Conformer with Cache-based Inference for Streaming Automatic Speech Recognition." arXiv:2312.17279
- Rao, K., et al. (2018). "Exploring Architectures, Data and Units For Streaming End-to-End Speech Recognition with RNN-Transducer." arXiv:1801.00841
- [NVIDIA NeMo Framework Documentation](https://docs.nvidia.com/nemo-framework/)
- [HuggingFace Model Card: nvidia/nemotron-speech-streaming-en-0.6b](https://huggingface.co/nvidia/nemotron-speech-streaming-en-0.6b)

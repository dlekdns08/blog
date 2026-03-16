---
title: "Meta의 Omnilingual ASR: 1,600개 이상의 언어를 지원하는 혁신적인 음성 인식 기술"
date: "2025-11-12"
description: "Meta FAIR 팀이 발표한 Omnilingual ASR은 1,600개 이상의 언어를 지원하는 오픈소스 음성 인식 시스템입니다. Zero-shot 학습, Bring Your Own Language 기능, Whisper와의 비교까지 정리합니다."
tags: ["AI", "ASR", "음성인식", "Meta", "다국어", "오픈소스", "LLM", "wav2vec"]
---

# Meta의 Omnilingual ASR: 1,600개 이상의 언어를 지원하는 혁신적인 음성 인식 기술

AI 시리즈 : Meta Omnilingual ASR

오늘은 Meta에서 신규로 발표한 **Omnilingual ASR** 모델에 대해서 말씀드리려 합니다. 1,600여 개 이상의 언어를 지원한다고 하는데요. 전 세계 언어가 1,600여 개 이상이라는 사실이 더 놀라울 따름입니다.

2025년 11월 10일, Meta는 AI 음성 인식 분야에서 획기적인 발표를 했습니다. Omnilingual ASR은 기존 OpenAI의 Whisper 모델이 지원하는 99개 언어를 훨씬 뛰어넘는 규모이며, 더욱 놀라운 것은 이 중 **500개 이상의 언어가 이전에는 어떤 ASR 모델에서도 지원되지 않았던 저자원 언어**라는 점입니다.

---

## Omnilingual ASR이란?

Omnilingual ASR은 Meta FAIR(Fundamental AI Research) 팀이 개발한 다국어 음성을 텍스트로 변환하는 시스템입니다.

### 주요 특징

**1. 전례 없는 언어 지원 규모**는 기본 1,600개 이상의 언어를 지원하며, Zero-shot 학습을 통해 5,400개 이상의 언어로 확장 가능합니다. 한국어를 포함한 일본어, 중국어 등 주요 아시아 언어도 지원합니다.

**2. "Bring Your Own Language" 기능**을 통해 사용자가 몇 개의 오디오-텍스트 샘플만 제공하면 새로운 언어를 즉시 추가할 수 있습니다. 대규모 데이터셋이나 모델 재학습이 필요 없어 멸종 위기 언어나 디지털 발자국이 없는 언어에도 적용 가능합니다.

**3. 뛰어난 성능**으로 430만 시간의 다국어 오디오 데이터로 학습하였으며, 지원되는 언어의 78%에서 문자 오류율(CER) 10% 미만을 달성했습니다. 최대 70억 파라미터 모델을 제공합니다.

**4. 완전한 오픈소스**로 Apache 2.0 라이선스를 통해 상업적 사용이 가능하며, GitHub과 Hugging Face를 통해 모델, 데이터셋, 코드를 모두 공개했습니다.

---

## 기술적 혁신

### LLM 기술의 적용

Omnilingual ASR의 가장 혁신적인 부분은 **LLM 기술을 ASR에 적용**한 것입니다.

- **wav2vec 2.0 인코더**: 70억 파라미터로 확장된 음성 인코더가 원시 음성 데이터에서 풍부한 다국어 의미 표현을 생성
- **트랜스포머 디코더**: LLM에서 사용되는 전통적인 트랜스포머 디코더를 통해 음성을 문자 토큰으로 변환

### 모델 패밀리

| 모델 | 파라미터 | 용도 | VRAM (BF16) | 처리 속도 |
|---|---|---|---|---|
| omniASR_LLM_300M | 300M | 경량 디바이스, 빠른 처리 | ~2GB | 가장 빠름 |
| omniASR_LLM_1B | 1B | 균형잡힌 성능 | ~5GB | 빠름 |
| omniASR_LLM_3B | 3B | 높은 정확도 | ~12GB | 보통 |
| omniASR_LLM_7B | 7B | 최고 정확도 | ~28GB | 기준 |

---

## 사용 방법

### 설치

```bash
# pip을 사용한 설치
pip install omnilingual-asr

# uv를 사용한 설치
uv add omnilingual-asr

# Mac 사용자는 우선 아래를 설치해야 합니다
brew install libsndfile
```

### 기본 사용법

```python
from omnilingual_asr.models.inference.pipeline import ASRInferencePipeline

# 모델 파이프라인 초기화 (7B LLM 모델 사용)
pipeline = ASRInferencePipeline(model_card="omniASR_LLM_7B")

audio_file = "/path/to/your/audio.wav"
transcription = pipeline.transcribe(audio_file)
print(transcription)
```

### 다중 언어 처리 배치

```python
from omnilingual_asr.models.inference.pipeline import ASRInferencePipeline

pipeline = ASRInferencePipeline(model_card="omniASR_LLM_7B")

audio_files = [
    "/path/to/korean_audio.flac",
    "/path/to/english_audio.wav",
    "/path/to/japanese_audio.mp3"
]
languages = ["kor_Hang", "eng_Latn", "jpn_Jpan"]

transcriptions = pipeline.transcribe(audio_files, lang=languages, batch_size=2)

for file, transcription in zip(audio_files, transcriptions):
    print(f"{file}: {transcription}")
```

### 지원 언어 확인

```python
from omnilingual_asr.models.wav2vec2_llama.lang_ids import supported_langs

print(f"지원되는 언어 수: {len(supported_langs)}")

if "kor_Hang" in supported_langs:
    print("한국어(한글)가 지원됩니다!")
```

언어 코드는 `{언어코드}_{문자체계}` 형식을 따릅니다. 예를 들어 `eng_Latn`은 영어(라틴 문자), `kor_Hang`은 한국어(한글), `jpn_Jpan`은 일본어, `cmn_Hans`는 중국어 간체입니다.

### Omnilingual ASR Corpus 활용

```python
from datasets import load_dataset
from omnilingual_asr.models.inference.pipeline import ASRInferencePipeline

# 특정 언어 데이터셋 로드 (예: 리구리아어)
dataset = load_dataset(
    "facebook/omnilingual-asr-corpus",
    "lij_Latn",
    split="train",
    streaming=True
)

batch = next(dataset.iter(5))

audio_data = [
    {"waveform": x["array"], "sample_rate": x["sampling_rate"]}
    for x in batch["audio"]
]

pipeline = ASRInferencePipeline(model_card="omniASR_LLM_7B")
transcriptions = pipeline.transcribe(audio_data, batch_size=2)

for i, (transcription, original_text) in enumerate(
    zip(transcriptions, batch["raw_text"]), 1
):
    print(f"\n샘플 {i}:")
    print(f"  정답: {original_text}")
    print(f"  예측: {transcription}")
```

### 모델 선택 기준

- **모바일/엣지 디바이스**: 300M 모델
- **일반적인 사용**: 1B 또는 3B 모델
- **최고 품질이 필요한 경우**: 7B 모델
- **새로운 언어 적응**: omniASR_LLM_7B_ZS (Zero-Shot 모델)

> **주의사항**: 현재 40초 이하의 오디오 파일만 지원하며, 7B 모델 사용 시 최소 28GB VRAM이 필요합니다. 첫 실행 시 모델이 자동으로 다운로드되어 `~/.cache/fairseq2/assets/`에 저장됩니다.

---

## Zero-Shot 학습: 새로운 언어 추가하기

Omnilingual ASR의 가장 혁신적인 기능 중 하나는 **in-context learning** 능력입니다. 몇 개의 예제만으로 새로운 언어를 즉시 추가할 수 있습니다.

```python
from omnilingual_asr.models.inference.pipeline import ASRInferencePipeline

# Zero-Shot 모델 로드
pipeline = ASRInferencePipeline(model_card="omniASR_LLM_7B_ZS")

# 새로운 언어의 예제 (오디오-텍스트 쌍)
context_examples = [
    {"audio": "/path/to/example1.wav", "text": "예제 텍스트 1"},
    {"audio": "/path/to/example2.wav", "text": "예제 텍스트 2"}
]

new_audio = "/path/to/new_audio.wav"
transcription = pipeline.transcribe(new_audio, context=context_examples)
print(transcription)
```

이 기능은 공식적으로 지원되지 않는 방언이나 지역 언어, 학습 데이터가 부족한 소수 언어, 특수한 도메인이나 전문 용어가 많은 경우에 특히 유용합니다.

---

## Whisper와의 비교

| 특징 | Omnilingual ASR | Whisper |
|---|---|---|
| 지원 언어 | 1,600+ | 99 |
| Zero-shot 확장 | 5,400+ 언어 | 제한적 |
| 모델 크기 | 300M ~ 7B | 39M ~ 1.5B |
| 라이선스 | Apache 2.0 | MIT |
| 저자원 언어 지원 | 500+ 새로운 언어 | 제한적 |
| In-context learning | ✅ | ❌ |

---

## 활용 사례

**저자원 언어 보존**은 멸종 위기 언어나 문서화되지 않은 언어의 구술 기록을 텍스트로 변환하여 보존할 수 있습니다. **다국어 콘텐츠 제작**에서는 유튜브, 팟캐스트 등 다양한 언어로 제작된 콘텐츠에 자막을 자동으로 생성할 수 있으며, **음성 비서 개발**, **언어학 연구**, **청각 장애인을 위한 접근성 향상** 등 다양한 분야에 활용 가능합니다.

---

## Meta의 오픈소스 전략

Omnilingual ASR 릴리스는 Meta의 AI 전략에서 중요한 전환점을 나타냅니다. Llama 4의 미온적인 반응 이후, Meta는 오픈소스 커뮤니티와의 협력을 강화하며 진정한 글로벌 언어 포용을 목표로 하고 있습니다.

데이터 수집을 위해 Mozilla Common Voice, Lanfrica/NaijaVoices, African Next Voices 등과 협력했으며, 이렇게 수집된 Omnilingual ASR Corpus는 현재까지 공개된 초저자원 자연 음성 ASR 데이터셋 중 가장 큰 규모입니다.

---

## 결론

Omnilingual ASR은 단순한 음성 인식 모델을 넘어 **언어 장벽을 허무는 포용적인 기술**입니다. 1,600개 이상의 언어를 지원하고, 누구나 새로운 언어를 쉽게 추가할 수 있으며, 완전히 오픈소스로 제공되는 이 시스템은 AI 기술의 민주화를 보여주는 훌륭한 사례입니다.

**참고 자료**: [공식 블로그](https://ai.meta.com) · [GitHub](https://github.com/facebookresearch/omnilingual-asr) · [Hugging Face 데이터셋](https://huggingface.co/datasets/facebook/omnilingual-asr-corpus)
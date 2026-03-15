---
title: "이미지 핸들링: 번호판 이미지 생성 총정리"
date: "2025-11-25"
description: "한국의 7가지 유형 번호판 합성 데이터 70,000장 생성부터 YOLOv8 학습, Ensemble 추론까지 전체 파이프라인을 총정리합니다. F1-Score 0.945 달성."
tags: ["Python", "OpenCV", "YOLO", "딥러닝", "번호판인식", "데이터증강", "대학원", "컴퓨터비전", "Ensemble"]
---

# 이미지 핸들링: 번호판 이미지 생성 총정리

대학원 수업/이미지 핸들링

이번 포스팅에서는 이미지 핸들링 수업에서 진행하였던 **한국의 7가지 유형 번호판을 생성하고 YOLO 모델에 학습시키는 프로젝트**를 총정리합니다. 7가지 타입의 번호판에 대해 각각 10,000장씩 총 70,000장의 합성 이미지를 생성하고, YOLOv8 모델을 학습시켜 Ensemble 추론까지 구현했습니다.

---

## 번호판의 7가지 유형

| # | 타입 | 형식 | 용도 | 크기 |
|---|---|---|---|---|
| 1 | LICENSE_PLATE_2007_520x110 | `12가3456` | 자가용 승용차 | 520×110mm |
| 2 | LICENSE_PLATE_2007_520x110_YELLOW | `서울12바3456` | 영업용 (택시, 버스 등) | 520×110mm |
| 3 | LICENSE_PLATE_2007_335x170_YELLOW | `서울12 / 바3456` (2줄) | 영업용 소형 차량 | 335×170mm |
| 4 | LICENSE_PLATE_2007_335x155_WHITE | `서울12 / 가3456` (2줄) | 자가용 소형 차량 | 335×155mm |
| 5 | LICENSE_PLATE_2007_520x110_EV | `12가3456` (하늘색) | 전기차 전용 | 520×110mm |
| 6 | LICENSE_PLATE_2019_520x110 | `서울12가3456` | 2019년 이후 신규 발급 | 520×110mm |
| 7 | LICENSE_PLATE_2020_520x110 | `서울12가3456` | 2020년 이후 신규 발급 | 520×110mm |

---

## 합성 데이터 생성 전략

### 핵심 아이디어

실제 번호판 폰트를 배경 제거하여 개별 문자로 분리한 후, 이를 조합하여 다양한 번호판 이미지를 생성합니다.

### 생성 파이프라인

```
1. 원본 폰트 이미지 준비       → fonts/org/
2. 배경 제거                  → fonts/bg_removed/
3. 번호판 조합 생성            → train_datasets/images/
4. YOLO 라벨 자동 생성         → train_datasets/labels/
```

### 코드 구조

```python
import random
import numpy as np
from lpimage import LicensePlate, LicensePlateType

# 재현성을 위한 Seed 설정
random.seed(2007520110)
np.random.seed(2007520110)

for i in range(10000):
    sequence = f"{random.randint(0, 99):02d}가{random.randint(0, 9999):04d}"

    lp = LicensePlate(
        LicensePlateType.LICENSE_PLATE_2007_520x110,
        sequence,
        'train_datasets'
    )

    # 데이터 증강 적용
    lp.apply_perspective_transform(skew_intensity=0.25)
    lp.applyGaussianNoise(mean=3, stdev=3, from_image='skewed')
    lp.applyGaussianBlur(k=7, from_image='skewed')
    lp.adjustContrastAndBrightness(contrast=1.0, brightness=0)

    lp.save_all()
```

---

## 데이터 증강 기법

실제 환경의 다양한 조건을 시뮬레이션하기 위해 4가지 증강 기법을 적용했습니다.

### 1. 원근 변환 (Perspective Transform)

```python
skew_intensity = random.uniform(0.2, 0.3)
lp.apply_perspective_transform(skew_intensity=skew_intensity)
# 효과: 카메라 각도에 따른 왜곡 — 좌우 기울임, 상하 왜곡, 회전 효과
```

### 2. 가우시안 노이즈 (Gaussian Noise)

```python
lp.applyGaussianNoise(mean=3, stdev=3, from_image='skewed')
# 효과: 저조도 환경이나 센서 노이즈 — 야간 촬영, 낮은 카메라 품질, 전자 노이즈
```

### 3. 가우시안 블러 (Gaussian Blur)

```python
k = random.randrange(3, 16, 2)  # 홀수 커널 크기
lp.applyGaussianBlur(k=k, from_image='skewed')
# 효과: 초점 이탈이나 움직임 블러 — 이동 중 촬영, 카메라 초점 문제, 날씨 영향
```

### 4. 대비 및 밝기 조정 (Contrast & Brightness)

```python
contrast = random.uniform(0.7, 1.3)
lp.adjustContrastAndBrightness(contrast=contrast, brightness=0, from_image='skewed')
# 효과: 다양한 조명 조건 — 역광, 그림자, 밝은 햇빛
```

### 증강 비교: 학습 vs 테스트

| 구분 | 왜곡 강도 | 블러 범위 | 목적 |
|---|---|---|---|
| 학습 데이터 | 0.2 ~ 0.3 | k = 3~15 | 다양성 확보 |
| 테스트 데이터 | 0.3 ~ 0.4 | k = 3~11 | 난이도 증가 |

테스트 데이터는 더 어려운 조건으로 설정하여 모델의 견고성을 평가합니다.

---

## YOLO 모델 학습

### 학습 환경

- **Model**: YOLOv8n (Nano)
- **Input Size**: 640×640
- **Batch Size**: 64
- **Epochs**: 10
- **Optimizer**: Adam
- **환경**: Google Colab T4 GPU (약 4시간 소요)

### 학습 데이터 구조

```
train_datasets/
├── images/
│   ├── 2007_520x110/         # 10,000장
│   ├── 2007_520x110_yellow/  # 10,000장
│   └── ...                   # (총 7개 타입)
└── labels/
    ├── 2007_520x110/         # YOLO 형식 라벨
    └── ...
```

### 자동화된 학습 스크립트

```python
from ultralytics import YOLO
from datetime import datetime
import os, shutil

plate_types = [
    'LICENSE_PLATE_2007_520x110',
    'LICENSE_PLATE_2007_520x110_YELLOW',
    # ... (총 7개)
]

for plate_type in plate_types:
    print(f'Training: {plate_type}')

    model = YOLO("yolov8n.pt")

    os.system(f"sed -i 's/images\\/[^ ]*/images\\/{plate_type}/g' license_plate.yaml")

    model.train(
        data="license_plate.yaml",
        epochs=10,
        batch=64,
        imgsz=640,
        project=f'weights/{datetime.now():%Y%m%d}_{plate_type}'
    )

    shutil.copy('weights/.../best.pt', f'{plate_type}.pt')
```

---

## Ensemble 추론 전략

각 번호판 타입마다 특화된 모델을 학습했기 때문에, 테스트 이미지에 대해 7개 모델 모두 추론한 후 **최고 평균 Confidence를 가진 모델의 결과를 선택**하는 전략입니다.

### Confidence 기반 선택

```python
def calculate_average_confidence(confidences, max_objects):
    """
    평균 confidence 계산
    감지된 객체가 적으면 0.0으로 페널티 부여 (FN 페널티)
    """
    total_objects = len(confidences)
    if total_objects < max_objects:
        confidences += [0.0] * (max_objects - total_objects)
    return sum(confidences) / max_objects
```

### FN(False Negative) 페널티

모델이 객체를 감지하지 못한 경우 0.0 confidence로 처리하여 완전한 감지를 장려합니다.

```python
# 예시: 7개 문자 중 5개만 감지
confidences = [0.9, 0.85, 0.88, 0.92, 0.87]
confidences += [0.0, 0.0]  # 미감지 2개에 페널티
# 평균 = (0.9 + 0.85 + 0.88 + 0.92 + 0.87 + 0.0 + 0.0) / 7 = 0.617
```

### Ensemble 프로세스

```
1. 7개 모델로 각각 추론
   ├─> 2007_520x110         → conf: 0.85
   ├─> 2007_520x110_YELLOW  → conf: 0.92 ⭐
   └─> ...

2. 평균 Confidence 계산
3. 최고 Confidence 모델 선택 → 2007_520x110_YELLOW 결과 채택
4. 최종 결과 저장 → ensemble_result/
```

```python
# 7개 모델 추론
for model_name, model in models.items():
    do_inference(model, testsets, model_name, max_objects)

# Ensemble 수행
best_annotations = choose_best_annotations(max_objects_dict)

for image, annotation in best_annotations.items():
    best_model = annotation[0]
    avg_conf   = annotation[1]
    shutil.copy(best_model, f'ensemble_result/{image}')
```

---

## 성능 평가 및 결과

**평가 지표**: F1-Score

```
F1 = 2 × (Precision × Recall) / (Precision + Recall)
Precision = TP / (TP + FP)
Recall    = TP / (TP + FN)
```

**테스트 데이터**: 각 타입당 1,000장 (총 7,000장)

> **F1-Score: 0.945**

| 강점 | 약점 |
|---|---|
| ✅ 높은 전체 정확도 (F1 > 0.94) | ⚠️ 극단적인 왜곡에 취약 |
| ✅ 타입별로 균일한 성능 | ⚠️ 심한 오염/손상 번호판 인식 어려움 |
| ✅ Ensemble로 안정적인 결과 | ⚠️ 실제 환경 데이터와의 차이 |

---

## 배운 점과 개선 방향

### 주요 학습 내용

**합성 데이터의 힘**: 실제 데이터 없이도 충분히 높은 성능의 모델을 만들 수 있었습니다. 하지만 합성과 실제의 간극을 줄이는 것이 중요합니다.

**데이터 증강의 중요성**: 다양한 증강 기법 적용으로 모델의 일반화 성능이 크게 향상되었습니다. 특히 원근 변환과 블러가 가장 효과적이었습니다.

**Ensemble의 효과**: 단일 모델보다 Ensemble이 약 3~5% 성능 향상을 가져왔습니다. 각 타입별 특화 모델의 장점을 활용할 수 있었습니다.

**재현성의 중요성**: `random.seed()`와 `np.random.seed()` 설정으로 완벽한 재현이 가능했습니다.

### 개선 방향

**1. 실제 데이터 혼합**

```python
# 합성 데이터 80% + 실제 데이터 20%
synthetic_ratio = 0.8
real_ratio = 0.2
```

**2. 더 다양한 증강 기법**: 날씨 효과(비, 눈, 안개), 빛 반사 시뮬레이션, 오염/손상 효과, 그림자 효과 추가

**3. 더 큰 모델 사용**

```
YOLOv8n → YOLOv8s → YOLOv8m → YOLOv8l
```

**4. 온라인 학습 (Online Learning)**

```python
if confidence < threshold:
    add_to_training_set(image, corrected_label)
    retrain_model()
```

**5. 모델 경량화**

```python
model.export(format="onnx", quantize=True)
```

---

## 결론

이 프로젝트를 통해 다음을 달성했습니다.

- ✅ 70,000장의 합성 데이터 생성 파이프라인 구축
- ✅ 7개의 특화 모델 학습 및 Ensemble 구현
- ✅ **F1-Score 0.945** 달성
- ✅ 완전 자동화된 데이터 생성-학습-평가 시스템

**실전 적용을 위한 체크리스트**

- [ ] 실제 환경 데이터로 추가 검증
- [ ] 엣지 케이스 테스트 (오염, 손상, 특수 각도)
- [ ] 실시간 추론 속도 최적화
- [ ] 모니터링 및 로깅 시스템 구축
- [ ] A/B 테스트로 실사용 성능 검증
---
title: "[이미지 핸들링] 6, 7주차 수업 내용 정리"
date: "2025-10-23"
description: "이미지 핸들링 수업 6~7주차 정리. 번호판 데이터 자동 생성 시스템(Data Augmentation, 대량 생성)과 YOLO 모델 학습 및 추론까지 전체 파이프라인을 코드와 함께 정리합니다."
tags: ["Python", "OpenCV", "YOLO", "딥러닝", "대학원", "번호판인식", "데이터증강", "Colab"]
---

# [이미지 핸들링] 6, 7주차 수업 내용 정리

대학원 수업/이미지 핸들링

8주차 시험을 앞두고 정리하는 이미지 핸들링 수업 내용입니다. 마지막으로 6, 7주차 수업을 정리해보겠습니다.

---

## 6주차: 번호판 데이터 자동 생성 시스템

5주차에서 배운 내용을 자동화하여 **대량의 학습 데이터**를 생성합니다.

**전략**: 5주차 함수들을 `lpimage` 라이브러리로 모듈화 → 다양한 번호판 규격 지원 → 랜덤 번호 생성 → Data Augmentation 자동 적용

### lpimage 라이브러리

5주차에서 작성한 코드를 라이브러리로 패키징했습니다. 지원하는 번호판 규격은 아래와 같습니다.

```python
class LicensePlateType:
    LICENSE_PLATE_2007_335x170_YELLOW = 0  # 2007년형 노란색 (335×170)
    LICENSE_PLATE_2007_520x110_YELLOW = 1  # 2007년형 노란색 (520×110)
    LICENSE_PLATE_2007_520x110        = 2  # 2007년형 흰색 (520×110)
    LICENSE_PLATE_2007_335x155_WHITE  = 3  # 2007년형 흰색 (335×155)
    LICENSE_PLATE_2019_520x110_WHITE  = 4  # 2019년형 흰색 (520×110)
    LICENSE_PLATE_2007_520x110_EV     = 5  # 전기차 (520×110)
```

**기본 사용법**

```python
from lpimage import LicensePlate, LicensePlateType

lp = LicensePlate(
    LicensePlateType.LICENSE_PLATE_2007_335x170_YELLOW,
    '인천33사8765',
    'train_datasets'
)
lp.imshow()
```

---

### Data Augmentation (데이터 증강)

모델이 정면 번호판만 학습하면 실전 인식률이 낮아집니다. 학습 데이터에 인위적으로 변형을 추가해 다양한 상황에 대응할 수 있게 합니다.

**1. Perspective Transform (원근 변환)**

```python
lp.apply_perspective_transform(skew_intensity=0.2)
# skew_intensity: 0.0~1.0, 권장 0.2~0.3
```

**2. Gaussian Noise**

```python
lp.applyGaussianNoise(
    mean=3,
    stdev=3,
    from_image='skewed'  # 'org': 원본, 'skewed': 기울어진 번호판(추천)
)
```

**3. Gaussian Blur**

```python
lp.applyGaussianBlur(
    k=7,                 # 커널 크기 (홀수: 3, 5, 7, 9, 11...)
    from_image='skewed'
)
```

**4. Contrast & Brightness 조정**

```python
lp.adjustContrastAndBrightness(
    contrast=0.8,    # alpha
    brightness=5,    # beta
    from_image='skewed'
)
```

**종합 예제: 한 번에 모든 변형 적용**

```python
from lpimage import LicensePlate, LicensePlateType

lp = LicensePlate(
    LicensePlateType.LICENSE_PLATE_2007_335x170_YELLOW,
    '인천33사8765',
    'train_datasets'
)

lp.apply_perspective_transform(skew_intensity=0.2)      # 1. 기울이기 (먼저!)
lp.applyGaussianNoise(mean=3, stdev=3, from_image='skewed')
lp.applyGaussianBlur(k=7, from_image='skewed')
lp.adjustContrastAndBrightness(contrast=0.8, brightness=5, from_image='skewed')

lp.imshow()
lp.save_all()  # 이미지 + Annotation 저장
```

> **처리 순서**: Perspective Transform을 먼저 적용한 후 Noise/Blur/Brightness를 적용해야 자연스럽습니다.

---

### 대량 데이터 생성

**번호 생성 함수**

```python
import numpy as np
import random
from lpimage import purpose_letters

def generate_2019_sequence():
    """2019년형: 123가4567"""
    car_type       = f'{np.random.randint(0,10)}{np.random.randint(0,10)}{np.random.randint(0,10)}'
    purpose_letter = random.choice(purpose_letters)
    last_sequence  = ''.join([str(np.random.randint(0,10)) for _ in range(4)])
    return car_type + purpose_letter + last_sequence

def generate_2007_sequence():
    """2007년형: 12가3456"""
    car_type       = f'{np.random.randint(0,10)}{np.random.randint(0,10)}'
    purpose_letter = random.choice(purpose_letters)
    last_sequence  = ''.join([str(np.random.randint(0,10)) for _ in range(4)])
    return car_type + purpose_letter + last_sequence
```

**대량 생성 코드 (7가지 규격 × 1,000장 = 7,000장)**

```python
np.random.seed(0)

for license_plate_type in range(7):
    for n in range(1000):
        # 규격에 따라 번호 생성 방식 선택
        if license_plate_type in [
            LicensePlateType.LICENSE_PLATE_2007_335x170_YELLOW,
            LicensePlateType.LICENSE_PLATE_2007_520x110_YELLOW
        ]:
            sequence = generate_yellow_sequence()
        elif license_plate_type in [
            LicensePlateType.LICENSE_PLATE_2007_520x110,
            LicensePlateType.LICENSE_PLATE_2007_520x110_EV
        ]:
            sequence = generate_2007_sequence()
        elif license_plate_type == LicensePlateType.LICENSE_PLATE_2007_335x155_WHITE:
            sequence = generate_2007_old_sequence()
        else:
            sequence = generate_2019_sequence()

        lp = LicensePlate(license_plate_type, sequence, 'train_datasets')

        # 랜덤 Augmentation
        lp.apply_perspective_transform(skew_intensity=np.random.uniform(0.15, 0.35))

        if np.random.rand() > 0.5:
            lp.applyGaussianNoise(
                mean=np.random.randint(1, 5),
                stdev=np.random.randint(1, 5),
                from_image='skewed'
            )
        if np.random.rand() > 0.5:
            lp.applyGaussianBlur(
                k=np.random.choice([3, 5, 7, 9]),
                from_image='skewed'
            )

        lp.adjustContrastAndBrightness(
            contrast=np.random.uniform(0.7, 1.3),
            brightness=np.random.randint(-20, 20),
            from_image='skewed'
        )

        lp.save_all()

        if n % 100 == 0:
            print(f"Type {license_plate_type}, Progress: {n}/1000")

print("데이터 생성 완료!")
```

### 6주차 핵심 개념 정리

| 개념 | 설명 |
|---|---|
| 모듈화 | 반복 코드를 라이브러리로 패키징 |
| Data Augmentation | Perspective Transform, Noise, Blur, Brightness로 데이터 다양화 |
| 랜덤 생성 | 자동으로 다양한 번호 조합 생성 |
| 대량 생성 | 수천 장의 학습 데이터 자동 생성 |
| from_image 파라미터 | 변형 적용 순서 제어 |

---

## 7주차: YOLO 모델 학습 및 추론

생성한 데이터로 실제 객체 탐지 모델을 학습합니다.

### Google Colab 환경 설정

Colab을 사용하는 이유는 무료 GPU(NVIDIA T4) 제공, 로컬 PC보다 빠른 학습, 환경 설정이 불필요하기 때문입니다.

```python
# GPU 확인
!nvidia-smi

# Google Drive 마운트
from google.colab import drive
drive.mount('/content/drive')
```

**Colab 사용 전략**

```
로컬 PC (데이터 생성)  →  Google Drive (저장)
    →  Colab 컨테이너 (GPU 학습)  →  Google Drive (결과 저장)
```

로컬 PC CPU가 Colab CPU보다 빠르므로 데이터 생성은 로컬에서, GPU 학습은 Colab에서 진행합니다.

---

### YOLO 설치 및 샘플 학습

```python
!pip install ultralytics

from ultralytics import YOLO

# 새로운 모델 (처음부터 학습)
model = YOLO("yolov8n.yaml")

# 사전 학습된 모델 (전이 학습 — 추천)
model = YOLO("yolov8n.pt")

# COCO128으로 테스트 학습
model.train(data="coco128.yaml", epochs=3)
metrics = model.val()
```

---

### YAML 설정 파일

**COCO128 구조**

```yaml
path: ../datasets/coco128
train: images/train2017
val: images/val2017

names:
  0: person
  1: bicycle
  2: car
  # ... (총 80개 클래스)
```

**번호판 데이터셋 설정 (license_plate.yaml)**

```yaml
path: /content/train_datasets
train: images
val: images

names:
  0:  '0'
  1:  '1'
  # ... (숫자 0~9)
  10: '가'
  11: '나'
  # ... (한글 용도 문자)
  19: '서울'
  20: '부산'
  # ... (지역명)
```

---

### 우리 데이터로 학습

**1. 데이터 준비**

```bash
# 로컬 PC에서 압축
zip -r train_datasets.zip train_datasets/
# → Google Drive의 image_handling/ 폴더에 업로드
```

```python
# Colab에서 다운로드 및 압축 해제
!cp /content/drive/MyDrive/image_handling/train_datasets.zip .
!unzip train_datasets.zip
```

**2. 학습 시작**

```python
from ultralytics import YOLO

model = YOLO("yolov8n.pt")

model.train(
    data="license_plate.yaml",
    epochs=50,
    imgsz=640,
    batch=16,
    name='license_plate_model'
)

metrics = model.val()
print(f"mAP50:    {metrics.box.map50}")
print(f"mAP50-95: {metrics.box.map}")
```

**3. 학습 결과 저장**

```python
!zip -r runs.zip /content/runs
!cp runs.zip /content/drive/MyDrive/image_handling/
```

저장되는 주요 파일은 `best.pt`(최고 성능 가중치), `last.pt`(마지막 에폭 가중치), `results.png`(학습 곡선), `confusion_matrix.png`(혼동 행렬)입니다.

---

### 모델 추론 (Inference)

**단일 이미지 추론**

```python
model = YOLO('/content/runs/detect/train/weights/best.pt', task='detect')

results = model.predict(
    'test_image.png',
    save=True,
    conf=0.25  # 신뢰도 임계값
)

for r in results:
    for box in r.boxes:
        cls  = int(box.cls[0])
        conf = float(box.conf[0])
        xyxy = box.xyxy[0].tolist()
        print(f"감지: {r.names[cls]}, 신뢰도: {conf:.2f}")
        print(f"좌표: xmin={xyxy[0]:.1f}, ymin={xyxy[1]:.1f}, xmax={xyxy[2]:.1f}, ymax={xyxy[3]:.1f}")
```

**실시간 웹캠 추론 (로컬 환경)**

```python
from ultralytics import YOLO
import cv2

model = YOLO('best.pt')
cap   = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break
    results   = model(frame)
    annotated = results[0].plot()
    cv2.imshow('License Plate Detection', annotated)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
```

---

### 학습 결과 분석

**학습 곡선 해석**

| 지표 | 좋은 학습 | 과적합 징후 |
|---|---|---|
| train/box_loss | 꾸준히 감소 | 계속 감소 |
| val/box_loss | 꾸준히 감소 | 증가 시작 |
| mAP50 | 0.8 이상 | 학습/검증 격차 큼 |

과적합 발생 시 데이터 증강 강화 또는 에폭 수를 줄입니다.

**모델 재학습 (Fine-tuning)**

```python
model = YOLO('/content/runs/detect/train/weights/last.pt')
model.train(
    data="license_plate.yaml",
    epochs=30,
    resume=True,
    name='license_plate_finetune'
)
```

**모델 내보내기**

```python
model.export(format='onnx')    # 범용
model.export(format='tflite')  # 모바일
model.export(format='coreml')  # iOS
```

---

### 전체 파이프라인 요약

```python
# 1. 로컬 PC: 데이터 생성 (7,000장)
from lpimage import LicensePlate, LicensePlateType
# ... lpimage로 대량 생성

# 2. Google Drive에 업로드
# zip -r train_datasets.zip train_datasets/

# 3. Colab: YOLO 학습
from ultralytics import YOLO
model = YOLO("yolov8n.pt")
model.train(data="license_plate.yaml", epochs=50)

# 4. 추론
results = model.predict('test_image.png')
for r in results:
    for box in r.boxes:
        print(f"감지: {r.names[int(box.cls[0])]}")
```

### 7주차 핵심 개념 정리

| 개념 | 설명 |
|---|---|
| GPU 활용 | Colab의 무료 GPU로 빠른 학습 |
| YOLO | 실시간 객체 탐지 모델 |
| 전이 학습 | 사전 학습된 가중치로 시작 (yolov8n.pt 추천) |
| YAML 설정 | 데이터셋 경로와 클래스 정의 |
| 학습-검증-평가 | train / val / test 분리 |
| mAP | 모델 성능 지표 (높을수록 좋음) |

---

## 1~7주차 전체 파이프라인 정리

| 주차 | 주제 | 핵심 |
|---|---|---|
| 1주차 | OpenCV 기초 | 이미지는 숫자 배열 |
| 2주차 | Annotation, 라벨링 | 라벨도 숫자 |
| 3주차 | Perspective Transform | 좌표 변환도 숫자 연산 |
| 4주차 | 이미지 효과 | 픽셀 연산 = 이미지 효과 |
| 5주차 | 번호판 데이터 생성 | 데이터를 직접 만들기 |
| 6주차 | 데이터 자동화 | 모듈화 + 대량 생성 |
| 7주차 | YOLO 학습 및 추론 | 데이터 → 모델 → 서비스 |
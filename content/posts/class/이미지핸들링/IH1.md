---
title: "이미지 핸들링 수업 1~3주차"
date: "2025-10-22"
description: "서울시립대학교 도시빅데이터융합학과 이미지 핸들링 수업 정리. OpenCV 기초, Annotation 및 라벨링, Perspective Transform(원근 변환)까지 1~3주차 내용을 코드와 함께 정리합니다."
tags: ["Python", "OpenCV", "컴퓨터비전", "딥러닝", "이미지처리", "대학원", "YOLO", "번호판인식"]
---

# 이미지 핸들링 수업 1~3주차

대학원 수업/이미지 핸들링

> 해당 내용은 서울시립대학교 도시빅데이터융합학과 이미지 핸들링 수업을 재구성한 내용입니다.

2025학년도 2학기 이미지 핸들링 수업은 말 그대로 이미지를 다루는 수업입니다. OpenCV, CLIP, YOLO 등을 다루며, 강사님의 경험에 맞춰 **번호판 인식**을 중심으로 진행됩니다.

---

## 1주차: OpenCV 사용법

OpenCV(Open Source Computer Vision Library)는 컴퓨터 비전과 머신러닝을 위한 오픈소스 라이브러리입니다. 실시간 이미지 처리, 다양한 색상 변환 및 필터링 기능, 크로스 플랫폼 지원(Windows, Linux, macOS, Android, iOS), Python/C++/Java 등 다중 언어를 지원합니다.

> **BGR 색상 순서**: OpenCV는 일반적인 RGB와 반대인 BGR(Blue-Green-Red) 순서를 사용합니다. 이는 역사적인 이유로 채택된 규칙입니다.

### 설치 및 기본 사용법

```python
pip3 install opencv-python
```

```python
import cv2
import numpy as np
from matplotlib import pyplot as plt

# 이미지 읽기
img = cv2.imread('test.bmp')
print(type(img))  # <class 'numpy.ndarray'>

# 이미지 저장
cv2.imwrite('test.jpg', img)   # 손실 압축
cv2.imwrite('test2.bmp', img)  # 무손실
cv2.imwrite('test2.png', img)  # 무손실
```

### 색상 변환

```python
# BGR → RGB 변환
img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

# BGR → Grayscale
img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Grayscale → BGR (3채널로 변환, 색상 정보 없음)
img_gray_to_color = cv2.cvtColor(img_gray, cv2.COLOR_GRAY2BGR)

# matplotlib로 이미지 표시 (BGR→RGB 변환 필수)
plt.imshow(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
plt.axis('off')
plt.show()
```

### 이미지 변환 (Flip / Rotate / Crop)

```python
# Flip
aeroplane_flip = cv2.flip(myimage, 0)   # 상하 반전
aeroplane_flip = cv2.flip(myimage, 1)   # 좌우 반전
aeroplane_flip = cv2.flip(myimage, -1)  # 상하좌우 반전

# Rotate
aeroplane_rotate = cv2.rotate(myimage, cv2.ROTATE_90_CLOCKWISE)        # 시계방향 90도
aeroplane_rotate = cv2.rotate(myimage, cv2.ROTATE_180)                 # 180도
aeroplane_rotate = cv2.rotate(myimage, cv2.ROTATE_90_COUNTERCLOCKWISE) # 반시계방향 90도

# Crop — 배열 슬라이싱으로 이미지 일부 추출
broccoli = img[235:480, 278:550]  # [높이_시작:끝, 너비_시작:끝]
img[100:345, 0:272] = broccoli    # 다른 위치에 붙여넣기
```

### 이미지를 텍스트 파일로 저장/복원

```python
# 이미지 → 텍스트 파일
height, width, channel = myimage.shape
with open('myimage.txt', 'w') as f:
    f.write(f"{height}\n{width}\n{channel}\n")
    for h in range(height):
        for w in range(width):
            for c in range(channel):
                f.write(f"{myimage[h][w][c]}\n")

# 텍스트 파일 → 이미지 복원
with open('myimage.txt', 'r') as f:
    height = int(f.readline().strip())
    width = int(f.readline().strip())
    channel = int(f.readline().strip())
    myimg = np.zeros((height, width, channel))
    for h in range(height):
        for w in range(width):
            for c in range(channel):
                myimg[h][w][c] = int(f.readline().strip())
    myimg = myimg.astype(np.uint8)  # uint8 타입 변환 필수 (0-255 범위)
```

### 1주차 핵심 개념 정리

| 개념 | 설명 |
|---|---|
| 이미지 = 숫자 배열 | 이미지는 단순히 숫자들이 담긴 NumPy 배열 |
| 3차원 구조 | (높이, 너비, 채널) 형태 |
| BGR 순서 | OpenCV는 BGR 채널 순서 사용 |
| 픽셀 값 범위 | 0~255 (uint8 타입) |
| 손실/무손실 압축 | JPG(손실) vs BMP/PNG(무손실) |

---

## 2주차: Annotation, 이미지 라벨링

딥러닝 모델은 함수와 같습니다. 입력(이미지)을 받아서 출력(인식 결과)을 내놓습니다. 1주차에서 이미지가 숫자라는 것을 배웠다면, 2주차에서는 **출력(라벨)도 숫자**라는 점을 이해할 수 있습니다.

### MNIST 데이터셋 실습

```python
from tensorflow.keras.datasets import mnist

(x_train, y_train), (x_test, y_test) = mnist.load_data()
print(f'학습용 입력이미지: {len(x_train)}장')   # 60,000장
print(f'테스트용 입력이미지: {len(x_test)}장')   # 10,000장

# 입력 데이터 전처리
x_train = x_train.reshape(-1, 28, 28, 1).astype('float32') / 255.0
x_test = x_test.reshape(-1, 28, 28, 1).astype('float32') / 255.0
```

출력은 단순히 "7"이라는 숫자가 아닌 **10개의 확률 값**으로 표현됩니다. 손글씨가 7일 경우 `[0.0001, ..., 0.9989, ...]` 처럼 7번 인덱스가 가장 높은 확률을 가집니다.

### CNN 모델 학습

```python
import tensorflow as tf
from tensorflow.keras import layers, models

model = models.Sequential([
    layers.Conv2D(16, (3,3), activation='relu', input_shape=(28,28,1)),
    layers.MaxPooling2D((2,2)),
    layers.Conv2D(32, (3,3), activation='relu'),
    layers.MaxPooling2D((2,2)),
    layers.Flatten(),
    layers.Dense(128, activation='relu'),
    layers.Dense(10, activation='softmax')  # 10개 클래스 출력
])

model.compile(optimizer='adam',
              loss='sparse_categorical_crossentropy',
              metrics=['accuracy'])
model.fit(x_train, y_train, epochs=5, validation_split=0.2)
```

### 주의사항: 배경색 문제

MNIST는 검은 배경에 흰 글씨지만, 직접 그린 이미지는 보통 흰 배경에 검은 글씨입니다. 이 차이로 인식률이 급격히 떨어질 수 있습니다.

**해결 방법 1: 이미지 반전**

```python
img = cv2.imread("3.png", cv2.IMREAD_GRAYSCALE)
img = 255 - img  # 반전
```

**해결 방법 2: 반전 데이터로 재학습**

```python
x_train_inverted = 255 - x_train
x_train = np.concatenate([x_train, x_train_inverted], axis=0)
y_train = np.concatenate([y_train, y_train], axis=0)  # 라벨은 동일
```

### 객체 탐지와 YOLO 라벨링

분류(Classification)와 달리 객체 탐지(Object Detection)는 객체의 **위치까지** 찾아야 합니다. YOLO 형식은 정규화된 좌표를 사용합니다.

```
<class_index> <x_center> <y_center> <width> <height>
```

```python
# YOLO → Pascal VOC 변환
xmin = (x_center - width/2) * image_width
ymin = (y_center - height/2) * image_height
xmax = (x_center + width/2) * image_width
ymax = (y_center + height/2) * image_height

# Pascal VOC → YOLO 변환
x_center = (xmin + (xmax - xmin)/2) / image_width
y_center = (ymin + (ymax - ymin)/2) / image_height
width = (xmax - xmin) / image_width
height = (ymax - ymin) / image_height
```

### 2주차 핵심 개념 정리

라벨링도 숫자(클래스명 → 숫자 인덱스, 위치 → 정규화된 좌표)이며, 정규화를 통해 이미지 크기와 무관하게 0~1 범위로 통일할 수 있습니다. YOLO, Pascal VOC 등 다양한 형식이 존재하며, labelImg 같은 도구로도 수작업 라벨링은 시간이 많이 소요되므로 자동화가 중요합니다.

---

## 3주차: Perspective Transform (원근 변환)

번호판 인식 시스템의 핵심 기술인 **원근 변환**을 배웁니다. 기울어진 번호판을 정면으로 보이게 만들고, 다른 차량 이미지에 합성하는 과정을 실습합니다.

### Step 1: 기울어진 번호판 → 정면 뷰 변환

Perspective Transform의 핵심은 Source Points(원본 4개 꼭짓점)와 Destination Points(목표 4개 꼭짓점)의 대응 관계로 변환 행렬을 자동 계산하는 것입니다.

```python
import cv2 as cv
import numpy as np

# 원본 번호판의 4개 꼭짓점
source_pts = np.float32([
    [80, 151],   # 좌상단
    [131, 155],  # 우상단
    [131, 173],  # 우하단
    [80, 165]    # 좌하단
])

# 목표 좌표 (정면으로 펼친 직사각형)
deskewed_pts = np.float32([
    [0, 0],
    [520, 0],
    [520, 110],
    [0, 110]
])

# 변환 행렬 계산 및 적용
deskew_matrix = cv.getPerspectiveTransform(source_pts, deskewed_pts)
deskewed_plate = cv.warpPerspective(license_plate1_image, deskew_matrix, (520, 110))
```

### Step 2: 정면 번호판 → 다른 차량에 합성

```python
# 목표 위치의 4개 꼭짓점 (차량2의 번호판 위치)
target_pts = np.float32([
    [159, 179], [248, 180], [248, 198], [159, 198]
])

warp_matrix = cv.getPerspectiveTransform(deskewed_pts, target_pts)
warped_plate = cv.warpPerspective(deskewed_plate, warp_matrix, (400, 265))
```

### Step 3: 마스크를 이용한 자연스러운 합성

단순히 이미지를 덮어쓰면 네모난 경계가 보입니다. 마스크를 사용하여 번호판 영역만 정확히 합성합니다.

```python
# 흰색 마스크 생성 및 동일한 변환 적용
deskewed_mask = np.zeros_like(deskewed_plate)
deskewed_mask.fill(255)
mask_image = cv.warpPerspective(deskewed_mask, warp_matrix, (400, 265))

# 마스크가 흰색인 부분만 번호판 픽셀로 교체
license_plate2_image[mask_image == (255, 255, 255)] = \
    warped_plate[mask_image == (255, 255, 255)]

cv.imwrite('result.jpg', license_plate2_image)
```

### Annotation 좌표도 함께 변환하기

이미지만 변환하면 끝이 아닙니다. **Annotation 좌표도 함께 변환**해야 합니다.

```python
import cv2 as cv
import numpy as np

transformed_annotations = []

for ann in annotations:
    # 바운딩 박스의 4개 꼭짓점
    corners = np.float32([
        [ann['xmin'], ann['ymin']],
        [ann['xmax'], ann['ymin']],
        [ann['xmax'], ann['ymax']],
        [ann['xmin'], ann['ymax']]
    ]).reshape(-1, 1, 2)
    
    # 좌표 변환
    transformed_corners = cv.perspectiveTransform(corners, warp_matrix)
    transformed_corners = transformed_corners.reshape(-1, 2)
    
    transformed_annotations.append({
        'name': ann['name'],
        'xmin': int(np.min(transformed_corners[:, 0])),
        'ymin': int(np.min(transformed_corners[:, 1])),
        'xmax': int(np.max(transformed_corners[:, 0])),
        'ymax': int(np.max(transformed_corners[:, 1]))
    })
```

### 주의사항: 왜곡 문제

변환 후 바운딩 박스 주변에 의도하지 않은 공간이 생길 수 있습니다. 기울어진 번호판의 실제 영역은 평행사변형인데, 직사각형 바운딩 박스로 근사하면 불필요한 배경이 포함되기 때문입니다. 해결 방안으로는 실제 4개 꼭짓점을 직접 라벨링하거나, Segmentation 기법 활용, 또는 변환 전 회전 보정이 있습니다.

### 3주차 핵심 개념 정리

| 개념 | 설명 |
|---|---|
| Perspective Transform | 4개 점 대응으로 원근 변환 가능 |
| 마스크 활용 | 자연스러운 이미지 합성의 핵심 |
| Annotation 변환 | 이미지뿐 아니라 좌표도 함께 변환 필수 |
| 왜곡 주의 | 바운딩 박스 변환 시 Skew 정도에 따라 오차 발생 |
| 실용적 응용 | 번호판 인식, 문서 스캔 앱 등에 활용 |

---

## 1~3주차 총정리

- **1주차**: 이미지는 숫자
- **2주차**: 라벨도 숫자
- **3주차**: 좌표 변환도 숫자 연산
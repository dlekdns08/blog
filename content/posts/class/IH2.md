---
title: "[이미지 핸들링] 4, 5주차 수업 내용 정리"
date: "2025-10-23"
description: "이미지 핸들링 수업 4~5주차 정리. Contrast/Brightness 조절, Blending, Blur, Noise 처리부터 번호판 데이터 자동 생성 프로젝트까지 코드와 함께 정리합니다."
tags: ["Python", "OpenCV", "컴퓨터비전", "이미지처리", "대학원", "번호판인식", "데이터생성"]
---

# [이미지 핸들링] 4, 5주차 수업 내용 정리

대학원 수업/이미지 핸들링

이제 시험 주간인 8주차입니다. 지난 1~3주차 수업 내용을 복습했던 것과 마찬가지로 4, 5주차 수업에 대해서도 정리해보겠습니다.

---

## 4주차: 이미지에 효과 적용하기

이전 주차까지 이미지가 숫자 배열이라는 것을 배웠습니다. 4주차에서는 그 숫자 배열에 연산을 적용해 다양한 이미지 효과를 만들어봅니다.

### Contrast와 Brightness

핵심 수식은 다음과 같습니다.

```
g(x) = α × f(x) + β
```

- **α (alpha)**: Contrast 계수 (gain, 곱셈)
- **β (beta)**: Brightness 값 (bias, 덧셈)
- **f(x)**: 원본 픽셀 값 / **g(x)**: 변환된 픽셀 값

픽셀 값이 클수록 밝고 작을수록 어두우므로, 값을 증가시키면 이미지가 밝아집니다.

### Overflow와 Underflow

픽셀 값의 데이터 타입은 `uint8`로 **0~255** 범위를 가집니다. 이 범위를 벗어나면 wrap around가 발생해 잘못된 색상이 출력됩니다.

```python
import cv2 as cv
import numpy as np

# Overflow된 이미지 (이상한 색상)
plt.imshow(cv.cvtColor(img + 100, cv.COLOR_BGR2RGB))
plt.title('Overflowed')
plt.show()
```

**해결: Clipping** — Overflow 시 255, Underflow 시 0으로 제한합니다.

```python
# int로 변환 → 연산 → clip → uint8 변환
img_modified = np.clip(img.astype(int) - 100, 0, 255).astype(np.uint8)
```

### Contrast와 Brightness 동시 조정

```python
alpha = 2.0  # Contrast
beta = 10    # Brightness

# 수동 연산
img_modified = np.clip(img.astype(int) * alpha + beta, 0, 255).astype(np.uint8)

# OpenCV의 자동 Clipping 함수 (동일한 결과)
new_image = cv.convertScaleAbs(img, alpha=alpha, beta=beta)

print(np.all(img_modified == new_image))  # True
```

> **주의**: alpha, beta가 소수일 때는 부동소수점 정밀도 차이로 약간 다를 수 있습니다.

---

### Blending (이미지 합성)

```python
# 단순 덧셈 — Overflow 발생!
result = src1 + src2  # 잘못된 결과

# Clipping 적용
blended_img = np.clip(src1.astype(int) + src2.astype(int), 0, 255).astype(np.uint8)

# 가중치 블렌딩 (OpenCV 자동 clipping)
alpha = 0.7  # src1의 비율
beta = 0.3   # src2의 비율
blended_img = cv.addWeighted(src1, alpha, src2, beta, 0.0)
```

**실용 예제: 빨간색 필터 적용**

```python
# 이미지와 같은 크기의 빨간색 이미지 생성 (BGR이므로 [0,0,255])
red = np.full(img.shape, [0, 0, 255], dtype=np.uint8)

blended_img = cv.addWeighted(img, 0.8, red, 0.2, 0.0)
```

---

### Blur (흐림 효과)

Blur는 커널(Kernel)을 이용해 주변 픽셀의 가중 평균값으로 각 픽셀을 대체합니다.

```
평균 커널 (3×3):
┌─────────────────┐
│ 1/9  1/9  1/9  │
│ 1/9  1/9  1/9  │
│ 1/9  1/9  1/9  │
└─────────────────┘
→ 주변 9개 픽셀의 평균값으로 대체
```

```python
import numpy as np

# 커널 크기에 따른 Blur 효과 비교
kernel3  = np.ones((3,  3),  np.float32) / 9
kernel9  = np.ones((9,  9),  np.float32) / 81
kernel31 = np.ones((31, 31), np.float32) / 961

dst3  = cv.filter2D(img, -1, kernel3)
dst9  = cv.filter2D(img, -1, kernel9)
dst31 = cv.filter2D(img, -1, kernel31)

# cv.blur() — 커널 크기만 지정하면 자동 생성 (filter2D와 동일)
blur = cv.blur(img, (21, 21))
```

| 커널 크기 | 효과 |
|---|---|
| 1×1 | 변화 없음 (원본과 동일) |
| 3×3 | 약한 블러 |
| 31×31 | 강한 블러 |

### Gaussian Blur

일반 Blur보다 **중앙에 더 큰 가중치**를 주는 블러입니다. 가장자리로 갈수록 가중치가 감소하여 더 자연스러운 효과를 냅니다.

```python
# sigma=0: 커널 크기에 따라 자동 계산
gaussian_blur = cv.GaussianBlur(img, (11, 11), sigmaX=0, sigmaY=0)

# sigma=1 지정
gaussian_blur2 = cv.GaussianBlur(img, (13, 13), sigmaX=1, sigmaY=1)
```

> **중요**: 커널 크기는 반드시 **홀수**여야 합니다. 짝수 크기는 중심점이 없어 사용 불가합니다. (O: 3×3, 5×5, 11×11 / X: 4×4, 10×10)

---

### Noise (노이즈)

```python
h, w, c = img.shape

# 가우시안 분포를 따르는 랜덤 노이즈 생성 (평균=2, 표준편차=3)
gaussian_noise = np.random.normal(2, 3, size=h * w * c)
gaussian_noise = gaussian_noise.astype(np.uint8).reshape((h, w, c))

# 단순 덧셈 — Modulo 연산 발생 (잘못된 결과)
noisy_image = img + gaussian_noise

# cv.add() — 자동 Clipping (올바른 결과)
noisy_image = cv.add(img, gaussian_noise)
```

**Blur로 노이즈 제거**

```python
blur = cv.blur(noisy_image, (11, 11))
gaussian_blur = cv.GaussianBlur(noisy_image, (11, 11), sigmaX=10, sigmaY=10)
```

### 4주차 핵심 개념 정리

| 개념 | 설명 |
|---|---|
| 픽셀 연산 = 이미지 효과 | 덧셈/곱셈으로 밝기/대비 조절 |
| Clipping 필수 | Overflow/Underflow 방지를 위한 0~255 범위 제한 |
| Blending | 두 이미지의 가중치 합으로 합성 |
| Blur | 커널을 이용한 주변 픽셀 평균으로 흐림 효과 |
| Gaussian Blur | 중심에 더 큰 가중치를 주는 자연스러운 블러 |
| Noise 제거 | Blur를 적용하여 노이즈 감소 |

---

## 5주차: 차량 번호판 인식기 만들기 프로젝트

지금까지 배운 이미지 핸들링 기술을 모두 활용하여 실제 학습 데이터를 생성합니다.

> **핵심 철학: 모델이 아닌 데이터를 가꾼다**

**프로젝트 목표**는 국가법령 폰트에서 배경 제거, 깨끗한 문자 이미지 추출, 번호판 규격에 맞춰 문자 배치, Annotation 파일 자동 생성입니다.

---

### Step 1: 배경 제거 (Background Removal)

국가법령 폰트 이미지에는 그리드(격자) 배경이 포함되어 있습니다. **원본 - 배경 = 문자**의 원리로 배경을 제거합니다.

```python
import cv2 as cv
import numpy as np

# 한글 파일명 처리를 위한 특수 읽기 방법
org_img = cv.imdecode(np.fromfile('바.png', np.uint8), cv.IMREAD_COLOR)
bg_img  = cv.imdecode(np.fromfile('바_bg.png', np.uint8), cv.IMREAD_COLOR)

# 1. Grayscale 변환
original_gray   = cv.cvtColor(org_img, cv.COLOR_BGR2GRAY)
background_gray = cv.cvtColor(bg_img,  cv.COLOR_BGR2GRAY)

# 2. 절대 차이 계산 (원본 - 배경 = 문자만)
diff_img = cv.absdiff(original_gray, background_gray)

# 3. Thresholding (이진화) — 50보다 크면 240, 작으면 0
_, mask = cv.threshold(diff_img, 50, 240, cv.THRESH_BINARY)

# 4. 반전 (번호판 문자는 검은색)
inverted_mask = cv.bitwise_not(mask)
```

**배경 제거 함수화**

```python
def bg_removal(original_image_path, background_image_path):
    org_img = cv.imdecode(np.fromfile(original_image_path, np.uint8), cv.IMREAD_COLOR)
    bg_img  = cv.imdecode(np.fromfile(background_image_path, np.uint8), cv.IMREAD_COLOR)
    
    original_gray   = cv.cvtColor(org_img, cv.COLOR_BGR2GRAY)
    background_gray = cv.cvtColor(bg_img,  cv.COLOR_BGR2GRAY)
    
    diff_img = cv.absdiff(original_gray, background_gray)
    _, mask  = cv.threshold(diff_img, 50, 240, cv.THRESH_BINARY)
    
    return cv.bitwise_not(mask)

# 여러 문자에 적용
font_seoul = cv.cvtColor(bg_removal('서울.png', '서울_bg.png'), cv.COLOR_GRAY2BGR)
font_ba    = cv.cvtColor(bg_removal('바.png',   '바_bg.png'),   cv.COLOR_GRAY2BGR)
font_2     = cv.cvtColor(bg_removal('2.png',    '2_bg.png'),    cv.COLOR_GRAY2BGR)
font_3     = cv.cvtColor(bg_removal('3.png',    '3_bg.png'),    cv.COLOR_GRAY2BGR)
```

---

### Step 2: 번호판 캔버스 생성

한국 번호판 규격: **335×170 픽셀**

```python
# 흰색 캔버스 생성
license_plate = np.arange(335 * 170 * 3)
license_plate.fill(255)
license_plate = license_plate.reshape(170, 335, 3).astype(np.uint8)
```

---

### Step 3: Annotation XML 생성 및 문자 배치

```python
from xml.dom import minidom
import xml.etree.ElementTree as ET

# XML 구조 생성
annotation = ET.Element('annotation')
filename = ET.SubElement(annotation, 'filename')
filename.text = 'result.jpg'

size = ET.SubElement(annotation, 'size')
ET.SubElement(size, 'width').text  = '335'
ET.SubElement(size, 'height').text = '170'
ET.SubElement(size, 'depth').text  = '3'

def add_object(annotation, name, xmin, ymin, xmax, ymax):
    """Annotation에 객체 정보 추가"""
    obj     = ET.SubElement(annotation, 'object')
    ET.SubElement(obj, 'name').text = str(name)
    bndbox  = ET.SubElement(obj, 'bndbox')
    ET.SubElement(bndbox, 'xmin').text = str(xmin)
    ET.SubElement(bndbox, 'ymin').text = str(ymin)
    ET.SubElement(bndbox, 'xmax').text = str(xmax)
    ET.SubElement(bndbox, 'ymax').text = str(ymax)
    return annotation
```

**예시: "서울23 바2323" 번호판 생성**

```python
# 상단 "서울" 배치
xmin, ymin, xmax, ymax = 82, 9, 177, 57
add_object(annotation, '서울', xmin, ymin, xmax, ymax)
license_plate[ymin:ymax, xmin:xmax] = cv.resize(font_seoul, (xmax-xmin, ymax-ymin))

# 상단 "2", "3" 배치
xmin, ymin, xmax, ymax = 177, 9, 215, 57
add_object(annotation, '2', xmin, ymin, xmax, ymax)
license_plate[ymin:ymax, xmin:xmax] = cv.resize(font_2, (38, 48))

xmin, ymin, xmax, ymax = 215, 9, 253, 57
add_object(annotation, '3', xmin, ymin, xmax, ymax)
license_plate[ymin:ymax, xmin:xmax] = cv.resize(font_3, (38, 48))

# 하단 "바", "2323" 배치 (y좌표 = 10 + 48 + 11 = 69)
xmin, ymin, xmax, ymax = 10, 69, 70, 161
add_object(annotation, '바', xmin, ymin, xmax, ymax)
license_plate[ymin:ymax, xmin:xmax] = cv.resize(font_ba, (60, 92))

for i, font in enumerate([font_2, font_3, font_2, font_3]):
    x = 70 + i * 62
    add_object(annotation, '2' if i % 2 == 0 else '3', x, 69, x+62, 161)
    license_plate[69:161, x:x+62] = cv.resize(font, (62, 92))
```

> **주의**: NumPy 배열은 `[y, x]` 순서로 인덱싱합니다.

---

### Step 4: 최종 저장

```python
# 이미지 저장
cv.imwrite('result.png', license_plate)

# Annotation XML 저장
xml_str = minidom.parseString(ET.tostring(annotation)).toprettyxml(indent="   ")
with open('result.xml', 'w') as f:
    f.write(xml_str)

print("생성 완료! — result.png / result.xml")
```

생성된 XML 예시:

```xml
<?xml version="1.0" ?>
<annotation>
   <filename>result.jpg</filename>
   <size>
      <width>335</width>
      <height>170</height>
      <depth>3</depth>
   </size>
   <object>
      <name>서울</name>
      <bndbox>
         <xmin>82</xmin>
         <ymin>9</ymin>
         <xmax>177</xmax>
         <ymax>57</ymax>
      </bndbox>
   </object>
   <!-- 나머지 객체들... -->
</annotation>
```

### 5주차 핵심 개념 정리

| 개념 | 설명 |
|---|---|
| 배경 제거 | 차이 계산 → Thresholding → 반전 |
| 함수화 | 반복 작업을 함수로 만들어 재사용 |
| 정밀한 배치 | 번호판 규격에 맞춰 픽셀 단위로 정확히 배치 |
| 자동 Annotation | 코드로 XML 파일 자동 생성 |
| 데이터 생성 | 모델 학습용 데이터를 직접 만들기 |

**다음 단계**는 다양한 번호 조합으로 수천 장을 생성하고, Perspective Transform으로 각도 변화를 추가하며, 노이즈/블러로 현실감을 더한 후 YOLO 모델로 학습하는 것입니다.
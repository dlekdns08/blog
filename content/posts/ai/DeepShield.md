---
title: "DeepShield: Fortifying Deepfake Video Detection"
date: "2025-12-01"
description: "ICCV 2025에 발표된 DeepShield 논문 리뷰. 로컬 민감도(LPG)와 글로벌 일반화(GFD)를 동시에 해결하는 딥페이크 탐지 프레임워크를 PyTorch 구현 코드와 함께 정리합니다."
tags: ["AI", "딥페이크", "논문리뷰", "ICCV", "CLIP", "ViT", "PyTorch", "컴퓨터비전", "보안"]
---

# DeepShield: Fortifying Deepfake Video Detection

AI 시리즈 : ICCV 2025 딥페이크 탐지 논문 리뷰

지난번에 이어서 이번에는 **ICCV 2025**에 등재된 딥페이크 감지 관련 논문을 다루어 보고자 합니다.

DeepShield는 딥페이크 비디오 탐지의 두 가지 핵심 과제를 동시에 해결하는 프레임워크입니다.

- **로컬 민감도(Local Sensitivity)**: 미세한 위조 흔적까지 포착
- **글로벌 일반화(Global Generalization)**: 학습 시 보지 못한 새로운 딥페이크에도 강건

> 해당 논문의 코드가 직접적으로 업로드되어 있지 않아서 논문 내용을 바탕으로 Claude와 함께 작성한 코드입니다.

---

## 문제 인식: 기존 딥페이크 탐지기의 한계

**일반화 능력 부족**: 기존 탐지 모델들은 학습 데이터에 포함된 특정 딥페이크 생성 기법에는 강하지만, 새로운 기법이나 다른 데이터셋에는 성능이 크게 떨어집니다.

**미세한 위조 신호 간과**: 대부분의 모델은 얼굴의 주요 변조 영역에만 집중하고, 블렌딩 경계(blending boundary)나 미묘한 불일치 같은 세밀한 단서를 놓칩니다.

**특정 위조 기법에 과적합**: 특정 GAN이나 face-swap 기법의 아티팩트에만 의존하면, 새로운 생성 모델(예: Diffusion Model)에는 무용지물이 됩니다.

---

## DeepShield의 핵심 아이디어

DeepShield는 **CLIP-ViT(Vision Transformer) 인코더**를 기반으로 두 가지 핵심 컴포넌트를 추가합니다.

### 1. Local Patch Guidance (LPG) — 로컬 패치 가이던스

Spatiotemporal Artifact Modeling(SAM)을 통해 가짜 비디오를 생성하고, 패치별 감독 학습을 수행하여 글로벌 모델이 놓치기 쉬운 미세한 불일치를 포착합니다.

### 2. Global Forgery Diversification (GFD) — 글로벌 위조 다양화

Domain Feature Augmentation(DFA)으로 다양한 위조 표현을 합성합니다. Domain-Bridging은 실제와 가짜 사이의 중간 특징을 생성하고, Boundary-Expanding은 경계 영역의 특징을 확장하여 크로스 도메인 적응성을 향상시킵니다.

---

## DeepShield 아키텍처

```
Input Video
    ↓
CLIP-ViT Encoder (with ST-Adapters)
    ↓
┌──────────────────────┬──────────────────────┐
│  Local Patch         │  Global Forgery       │
│  Guidance (LPG)      │  Diversification(GFD) │
└──────────────────────┴──────────────────────┘
    ↓
Combined Loss Function
    ↓
Real / Fake Classification
```

---

## 실험 결과

**Cross-Dataset Evaluation (Video-level AUC %)**

| Method | CelebDF | DFDC | DFDCP | DFDA | Average |
|---|---|---|---|---|---|
| Xception | 65.5 | 70.2 | 73.8 | 69.4 | 69.7 |
| CLIP-ViT | 85.3 | 82.7 | 87.1 | 84.2 | 84.8 |
| **DeepShield** | **93.2** | **89.6** | **94.3** | **91.8** | **92.2** |

FF++ 데이터셋 학습 후 크로스 데이터셋 평가에서 **평균 92.2% AUC** 달성, SOTA 모델 대비 **7.4% 향상**을 이루었습니다.

---

## 실습: DeepShield 핵심 컴포넌트 구현

### 환경 설정

```bash
pip install torch>=2.0.0 torchvision>=0.15.0 transformers>=4.30.0
pip install opencv-python>=4.8.0 dlib>=19.24.0 numpy>=1.24.0 pillow>=10.0.0
```

### 1. ST-Adapter 구현

```python
import torch
import torch.nn as nn

class SpatioTemporalAdapter(nn.Module):
    """Spatiotemporal Adapter for CLIP-ViT"""

    def __init__(self, d_model=768, kernel_size=3, num_frames=12):
        super().__init__()
        self.d_model = d_model
        self.num_frames = num_frames

        # Depth-wise 3D Convolution
        self.conv3d = nn.Conv3d(
            in_channels=d_model, out_channels=d_model,
            kernel_size=(kernel_size, kernel_size, kernel_size),
            padding=(kernel_size//2, kernel_size//2, kernel_size//2),
            groups=d_model
        )
        self.layer_norm = nn.LayerNorm(d_model)
        self.gate = nn.Sequential(nn.Linear(d_model, d_model), nn.Sigmoid())

    def forward(self, x):
        """Args: x: (B, T, N, D)"""
        B, T, N, D = x.shape
        H = W = int(N ** 0.5)
        x_reshaped = x.reshape(B, T, H, W, D).permute(0, 4, 1, 2, 3)
        conv_out = self.conv3d(x_reshaped)
        conv_out = conv_out.permute(0, 2, 3, 4, 1).reshape(B, T, N, D)
        gate_values = self.gate(conv_out)
        output = x + gate_values * conv_out
        return self.layer_norm(output)
```

### 2. Spatiotemporal Artifact Modeling (SAM)

```python
import cv2
import numpy as np
import dlib

class SpatiotemporalArtifactModeling:
    """SAM: 시공간적 블렌딩으로 pseudo-fake 비디오 생성"""

    def __init__(self, blend_alpha_range=(0.3, 0.7)):
        self.blend_alpha_range = blend_alpha_range
        self.detector = dlib.get_frontal_face_detector()
        self.predictor = dlib.shape_predictor("shape_predictor_68_face_landmarks.dat")

    def extract_facial_landmarks(self, frame):
        gray = cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY)
        faces = self.detector(gray)
        if len(faces) == 0:
            return None
        landmarks = self.predictor(gray, faces[0])
        return np.array([[p.x, p.y] for p in landmarks.parts()])

    def create_blending_mask(self, frame_shape, landmarks, smooth_kernel=21):
        mask = np.zeros(frame_shape[:2], dtype=np.uint8)
        hull = cv2.convexHull(landmarks)
        cv2.fillConvexPoly(mask, hull, 255)
        mask = cv2.GaussianBlur(mask, (smooth_kernel, smooth_kernel), 0)
        return mask.astype(np.float32) / 255.0

    def blend_frames(self, source_frame, target_frame, mask, alpha=0.5):
        mask_3d = np.stack([mask] * 3, axis=2)
        blended = (alpha * source_frame * mask_3d +
                   (1 - alpha) * target_frame * mask_3d +
                   target_frame * (1 - mask_3d))
        return blended.astype(np.uint8), mask

    def generate_pseudo_fake_video(self, video_frames):
        T = len(video_frames)
        pseudo_fakes, masks = [], []
        source_idx = np.random.randint(0, T)

        for t, target_frame in enumerate(video_frames):
            if t == source_idx:
                pseudo_fakes.append(target_frame)
                masks.append(np.zeros(target_frame.shape[:2]))
                continue
            landmarks = self.extract_facial_landmarks(target_frame)
            if landmarks is None:
                pseudo_fakes.append(target_frame)
                masks.append(np.zeros(target_frame.shape[:2]))
                continue
            mask = self.create_blending_mask(target_frame.shape, landmarks)
            alpha = np.random.uniform(*self.blend_alpha_range)
            blended_frame, blend_mask = self.blend_frames(
                video_frames[source_idx], target_frame, mask, alpha
            )
            pseudo_fakes.append(blended_frame)
            masks.append(blend_mask)

        return np.array(pseudo_fakes), np.array(masks)
```

### 3. Domain Feature Augmentation (DFA)

```python
class DomainFeatureAugmentation(nn.Module):
    """DFA: 도메인 특징 증강으로 일반화 성능 향상"""

    def __init__(self, feature_dim=768):
        super().__init__()
        self.feature_dim = feature_dim

    def domain_bridging_generation(self, real_features, fake_features, num_bridges=4):
        """실제와 가짜 사이의 중간 특징 생성"""
        bridged_features = []
        alphas = torch.linspace(0, 1, num_bridges + 2)[1:-1]
        for alpha in alphas:
            bridged = alpha * real_features + (1 - alpha) * fake_features
            bridged_features.append(bridged)
        return torch.stack(bridged_features, dim=1)

    def boundary_expanding_generation(self, features, labels, margin=0.1):
        """결정 경계 근처의 hard examples 생성"""
        B, D = features.shape
        real_mask = (labels == 0).unsqueeze(1)
        fake_mask = (labels == 1).unsqueeze(1)
        real_center = (features * real_mask).sum(0) / real_mask.sum()
        fake_center = (features * fake_mask).sum(0) / fake_mask.sum()
        boundary_direction = fake_center - real_center
        boundary_direction = boundary_direction / torch.norm(boundary_direction)

        expanded_features = []
        for i in range(B):
            noise = torch.randn_like(features[i]) * 0.1
            if labels[i] == 0:
                expanded = features[i] + margin * boundary_direction + noise
            else:
                expanded = features[i] - margin * boundary_direction + noise
            expanded_features.append(expanded)
        return torch.stack(expanded_features)

    def forward(self, real_features, fake_features, labels):
        bridged = self.domain_bridging_generation(real_features, fake_features)
        all_features = torch.cat([real_features, fake_features], dim=0)
        all_labels = torch.cat([
            torch.zeros(real_features.size(0), device=labels.device),
            torch.ones(fake_features.size(0), device=labels.device)
        ], dim=0)
        expanded = self.boundary_expanding_generation(all_features, all_labels)
        return bridged, expanded
```

### 4. DeepShield 전체 모델

```python
from transformers import CLIPVisionModel

class DeepShield(nn.Module):
    """DeepShield: 로컬-글로벌 분석 기반 딥페이크 탐지 모델"""

    def __init__(self, clip_model_name='openai/clip-vit-large-patch14',
                 num_frames=12, num_classes=2, use_lpg=True, use_gfd=True):
        super().__init__()
        self.clip_vision = CLIPVisionModel.from_pretrained(clip_model_name)
        self.feature_dim = self.clip_vision.config.hidden_size

        self.st_adapters = nn.ModuleList([
            SpatioTemporalAdapter(d_model=self.feature_dim, num_frames=num_frames)
            for _ in range(4)
        ])

        self.use_lpg = use_lpg
        if use_lpg:
            self.patch_classifier = nn.Sequential(
                nn.Linear(self.feature_dim, 512), nn.ReLU(),
                nn.Dropout(0.3), nn.Linear(512, 2)
            )

        self.use_gfd = use_gfd
        if use_gfd:
            self.dfa = DomainFeatureAugmentation(feature_dim=self.feature_dim)

        self.global_classifier = nn.Sequential(
            nn.Linear(self.feature_dim, 512), nn.ReLU(),
            nn.Dropout(0.5), nn.Linear(512, num_classes)
        )
        self.projection_head = nn.Sequential(
            nn.Linear(self.feature_dim, 256), nn.ReLU(), nn.Linear(256, 128)
        )

    def forward(self, video_frames, patch_labels=None, return_features=False):
        B, T, C, H, W = video_frames.shape
        frame_features = []
        for t in range(T):
            outputs = self.clip_vision(pixel_values=video_frames[:, t])
            frame_features.append(outputs.last_hidden_state)

        video_features = torch.stack(frame_features, dim=1)
        adapted_features = video_features
        for adapter in self.st_adapters:
            adapted_features = adapter(adapted_features)

        cls_tokens   = adapted_features[:, :, 0, :]   # (B, T, D)
        patch_tokens = adapted_features[:, :, 1:, :]  # (B, T, N, D)
        aux_outputs = {}

        if self.use_lpg and patch_labels is not None:
            B_p, T_p, N_p, D_p = patch_tokens.shape
            patch_logits = self.patch_classifier(patch_tokens.reshape(B_p * T_p * N_p, D_p))
            aux_outputs['patch_logits'] = patch_logits.reshape(B_p, T_p, N_p, 2)

        global_features = cls_tokens.mean(dim=1)
        global_logits   = self.global_classifier(global_features)
        aux_outputs['projected_features'] = self.projection_head(global_features)

        if return_features:
            aux_outputs['global_features'] = global_features
            aux_outputs['patch_features']  = patch_tokens

        return global_logits, aux_outputs
```

---

## 핵심 인사이트 & 활용 팁

**하이퍼파라미터 튜닝**에서 `lambda_patch`는 0.3~0.7 범위(논문 권장 0.5), `lambda_contrastive`는 0.2~0.5 범위가 적합합니다. Learning rate는 CLIP 레이어는 작게(1e-5), 다른 레이어는 크게(1e-4) 설정합니다.

**실전 배포 시 고려사항**으로는 Knowledge distillation으로 경량화, 프레임 샘플링 간격 조정(4프레임마다 1프레임)으로 실시간 처리, Gradient checkpointing으로 메모리 최적화가 있습니다.

**성능 향상 팁**으로는 여러 체크포인트 앙상블(2~3% AUC 향상), Multi-scale testing, TTA(Test-Time Augmentation: Horizontal flip, slight rotation)가 효과적입니다.

---

## 향후 연구 방향

최신 Stable Diffusion, DALL-E 생성 이미지 탐지를 위한 **Diffusion Model 기반 딥페이크 대응**, 소량의 새로운 딥페이크로 빠른 적응이 가능한 **Few-shot Learning 적용**, 왜 가짜로 판단했는지 시각적으로 설명하는 **설명 가능한 AI(XAI)**, 그리고 오디오-비주얼 불일치 탐지로 성능을 강화하는 **Multi-modal 확장**이 주요 연구 방향입니다.

---

## 마치며

DeepShield는 로컬 민감도와 글로벌 일반화라는 두 마리 토끼를 모두 잡은 혁신적인 딥페이크 탐지 프레임워크입니다.

- **실용성**: CLIP 기반으로 추가 학습 비용 최소화
- **확장성**: 새로운 딥페이크 기법에도 강건
- **성능**: SOTA 대비 **7.4% AUC 향상**

**참고 자료**: Cai et al., "DeepShield: Fortifying Deepfake Video Detection with Local and Global Forgery Analysis", ICCV 2025
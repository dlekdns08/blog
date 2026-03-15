---
title: "Audiovisual Deepfake Detection: 주요 방법론과 실습 코드"
date: "2025-10-22"
description: "오디오-비주얼 딥페이크 탐지의 주요 방법론(Audio-Visual Sync, Multimodal Fusion, Temporal Analysis)과 PyTorch 실습 코드를 함께 정리합니다."
tags: ["AI", "딥페이크", "PyTorch", "멀티모달", "컴퓨터비전", "딥러닝", "실습코드"]
---

# Audiovisual Deepfake Detection: 주요 방법론과 실습 코드

AI/LLM 시리즈 : 딥페이크 탐지 방법론 실습

이번 글에서는 오디오-비주얼 딥페이크 탐지의 주요 방법론들을 살펴보고, 실제로 실습 가능한 파이썬 코드와 함께 정리해보겠습니다.

---

## 1. 주요 탐지 방법론

### 1.1 Audio-Visual Synchronization 기반 탐지

오디오와 비디오 간의 **동기화 불일치**를 감지하는 방법입니다. 진짜 비디오에서는 입 모양과 음성이 정확히 일치하지만, 딥페이크에서는 미세한 시간차나 불일치가 발생합니다.

핵심 원리는 립싱크(Lip-sync) 오류 검출, 시간적 일관성 분석, 크로스모달 상관관계 측정입니다.

**대표 논문**: "Emotions Don't Lie: An Audio-Visual Deepfake Detection Method using Affective Cues" (2020), "Deepfake Detection based on Audio-Visual Consistency" (2022)

### 1.2 Multimodal Feature Fusion 방법

오디오와 비주얼 특징을 추출하여 결합하는 방법으로, 각 모달의 강점을 활용해 더 robust한 탐지가 가능합니다.

핵심 원리는 CNN/ResNet 기반 비주얼 특징 추출, MFCC/Wav2Vec 기반 오디오 특징 추출, Attention 메커니즘을 통한 특징 융합입니다.

**대표 논문**: "AVDF: Audio-Visual DeepFake Detection via Multimodal Feature Fusion" (2023), "MultiModal DeepFake Detection" (2021)

### 1.3 Temporal Inconsistency 기반 탐지

시간에 따른 불일치를 탐지하는 방법으로, LSTM, GRU, Transformer 등을 활용합니다. 핵심 원리는 프레임 간 불연속성 검출, 시계열 패턴 분석, 장기 의존성 학습입니다.

---

## 2. 실습 코드

### 2.1 Audio-Visual Sync 기반 딥페이크 탐지

```python
import torch
import torch.nn as nn
import torchaudio
import torchvision.models as models
from torchvision import transforms
import cv2
import numpy as np

class AudioVisualSyncDetector(nn.Module):
    """
    오디오-비주얼 동기화 기반 딥페이크 탐지 모델
    """
    def __init__(self, num_classes=2):
        super(AudioVisualSyncDetector, self).__init__()
        
        # Visual Feature Extractor (ResNet50)
        self.visual_encoder = models.resnet50(pretrained=True)
        self.visual_encoder.fc = nn.Identity()  # Remove final layer
        
        # Audio Feature Extractor
        self.audio_encoder = nn.Sequential(
            nn.Conv2d(1, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.AdaptiveAvgPool2d((1, 1))
        )
        
        # Sync Detector
        self.sync_fc = nn.Sequential(
            nn.Linear(2048 + 128, 512),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, num_classes)
        )
        
    def forward(self, video_frames, audio_mel):
        # Video features
        batch_size, num_frames, c, h, w = video_frames.shape
        video_frames = video_frames.view(batch_size * num_frames, c, h, w)
        visual_features = self.visual_encoder(video_frames)
        visual_features = visual_features.view(batch_size, num_frames, -1)
        visual_features = torch.mean(visual_features, dim=1)  # Temporal pooling
        
        # Audio features
        audio_features = self.audio_encoder(audio_mel)
        audio_features = audio_features.view(batch_size, -1)
        
        # Concatenate and classify
        combined = torch.cat([visual_features, audio_features], dim=1)
        output = self.sync_fc(combined)
        
        return output


def extract_frames(video_path, num_frames=16):
    """비디오에서 균등하게 프레임 추출"""
    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    frame_indices = np.linspace(0, total_frames - 1, num_frames, dtype=int)
    frames = []
    
    transform = transforms.Compose([
        transforms.ToPILImage(),
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406],
                             std=[0.229, 0.224, 0.225])
    ])
    
    for idx in frame_indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ret, frame = cap.read()
        if ret:
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frame_tensor = transform(frame)
            frames.append(frame_tensor)
    
    cap.release()
    return torch.stack(frames)


def extract_audio_features(audio_path, duration=3.0):
    """오디오에서 Mel-spectrogram 추출"""
    waveform, sample_rate = torchaudio.load(audio_path)
    
    if sample_rate != 16000:
        resampler = torchaudio.transforms.Resample(sample_rate, 16000)
        waveform = resampler(waveform)
    
    if waveform.shape[0] > 1:
        waveform = waveform[0:1, :]
    
    mel_spectrogram = torchaudio.transforms.MelSpectrogram(
        sample_rate=16000,
        n_fft=512,
        hop_length=256,
        n_mels=128
    )(waveform)
    
    mel_spectrogram = torch.log(mel_spectrogram + 1e-9)
    
    return mel_spectrogram


def detect_deepfake(video_path, audio_path, model):
    """딥페이크 탐지 추론"""
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model.eval()
    
    video_frames = extract_frames(video_path).unsqueeze(0).to(device)
    audio_mel = extract_audio_features(audio_path).unsqueeze(0).to(device)
    
    with torch.no_grad():
        outputs = model(video_frames, audio_mel)
        probabilities = torch.softmax(outputs, dim=1)
        prediction = torch.argmax(probabilities, dim=1)
    
    result = "FAKE" if prediction.item() == 1 else "REAL"
    confidence = probabilities[0][prediction.item()].item()
    
    print(f"Prediction: {result}")
    print(f"Confidence: {confidence:.4f}")
    
    return result, confidence


if __name__ == "__main__":
    model = AudioVisualSyncDetector(num_classes=2)
    print("Model initialized successfully!")
    print(f"Total parameters: {sum(p.numel() for p in model.parameters()):,}")
```

### 2.2 Multimodal Feature Fusion with Attention

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class MultimodalAttentionFusion(nn.Module):
    """
    Attention 메커니즘을 활용한 멀티모달 특징 융합
    """
    def __init__(self, visual_dim=2048, audio_dim=128, hidden_dim=512, num_classes=2):
        super(MultimodalAttentionFusion, self).__init__()
        
        self.visual_fc = nn.Linear(visual_dim, hidden_dim)
        self.audio_fc = nn.Linear(audio_dim, hidden_dim)
        
        # Cross-modal attention
        self.attention_v2a = nn.MultiheadAttention(hidden_dim, num_heads=8)
        self.attention_a2v = nn.MultiheadAttention(hidden_dim, num_heads=8)
        
        self.fusion_fc = nn.Sequential(
            nn.Linear(hidden_dim * 2, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(hidden_dim, num_classes)
        )
        
    def forward(self, visual_features, audio_features):
        v_feat = self.visual_fc(visual_features).unsqueeze(0)
        a_feat = self.audio_fc(audio_features).unsqueeze(0)
        
        v_attended, _ = self.attention_v2a(v_feat, a_feat, a_feat)
        a_attended, _ = self.attention_a2v(a_feat, v_feat, v_feat)
        
        v_attended = v_attended.squeeze(0)
        a_attended = a_attended.squeeze(0)
        
        fused = torch.cat([v_attended, a_attended], dim=1)
        output = self.fusion_fc(fused)
        
        return output


if __name__ == "__main__":
    batch_size = 4
    visual_features = torch.randn(batch_size, 2048)
    audio_features = torch.randn(batch_size, 128)
    
    model = MultimodalAttentionFusion()
    output = model(visual_features, audio_features)
    
    print(f"Input shapes — Visual: {visual_features.shape}, Audio: {audio_features.shape}")
    print(f"Output shape: {output.shape}")
    print(f"Predictions: {torch.softmax(output, dim=1)}")
```

### 2.3 Temporal Analysis with LSTM

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class TemporalDeepfakeDetector(nn.Module):
    """
    시계열 분석 기반 딥페이크 탐지
    """
    def __init__(self, input_dim=2176, hidden_dim=256, num_layers=2, num_classes=2):
        super(TemporalDeepfakeDetector, self).__init__()
        
        # Bidirectional LSTM
        self.lstm = nn.LSTM(
            input_dim,
            hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            bidirectional=True,
            dropout=0.3
        )
        
        self.attention = nn.Linear(hidden_dim * 2, 1)
        
        self.classifier = nn.Sequential(
            nn.Linear(hidden_dim * 2, 128),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(128, num_classes)
        )
        
    def forward(self, x):
        # x: (batch, sequence_length, input_dim)
        lstm_out, _ = self.lstm(x)
        
        attention_weights = F.softmax(self.attention(lstm_out), dim=1)
        attended = torch.sum(attention_weights * lstm_out, dim=1)
        
        output = self.classifier(attended)
        
        return output


if __name__ == "__main__":
    batch_size = 2
    sequence_length = 16
    input_dim = 2176  # 2048(visual) + 128(audio)
    
    x = torch.randn(batch_size, sequence_length, input_dim)
    model = TemporalDeepfakeDetector(input_dim=input_dim)
    output = model(x)
    
    print(f"Input shape: {x.shape}")
    print(f"Output shape: {output.shape}")
    print(f"Predictions: {torch.softmax(output, dim=1)}")
```

---

## 3. 실전 활용 팁

### 3.1 데이터셋 다운로드

주요 공개 데이터셋은 **FaceForensics++**(얼굴 조작 데이터셋), **DFDC**(Facebook 딥페이크 탐지 챌린지), **Celeb-DF**(고품질 딥페이크 비디오)입니다.

```python
def download_faceforensics():
    """
    FaceForensics++ 데이터셋 다운로드
    https://github.com/ondyari/FaceForensics
    """
    print("Visit: https://github.com/ondyari/FaceForensics")
    print("Register and download the dataset")
```

### 3.2 성능 평가

```python
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, roc_auc_score
import numpy as np

def evaluate_model(model, test_loader, device):
    """모델 성능 평가"""
    model.eval()
    
    all_predictions = []
    all_labels = []
    all_probs = []
    
    with torch.no_grad():
        for video_frames, audio_mels, labels in test_loader:
            video_frames = video_frames.to(device)
            audio_mels = audio_mels.to(device)
            
            outputs = model(video_frames, audio_mels)
            probs = torch.softmax(outputs, dim=1)
            predictions = torch.argmax(probs, dim=1)
            
            all_predictions.extend(predictions.cpu().numpy())
            all_labels.extend(labels.numpy())
            all_probs.extend(probs[:, 1].cpu().numpy())
    
    accuracy = accuracy_score(all_labels, all_predictions)
    precision, recall, f1, _ = precision_recall_fscore_support(
        all_labels, all_predictions, average='binary'
    )
    auc = roc_auc_score(all_labels, all_probs)
    
    print(f"Accuracy:  {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall:    {recall:.4f}")
    print(f"F1-Score:  {f1:.4f}")
    print(f"AUC-ROC:   {auc:.4f}")
    
    return {'accuracy': accuracy, 'precision': precision,
            'recall': recall, 'f1': f1, 'auc': auc}
```

---

## 4. 주요 과제와 향후 연구 방향

**일반화 문제**는 학습 데이터에 없는 새로운 딥페이크 생성 기법에 취약하다는 점입니다. 해결 방안으로 Domain adaptation, Meta-learning, Self-supervised learning이 연구되고 있습니다.

**실시간 처리** 측면에서 고해상도 비디오의 실시간 처리가 어렵습니다. 모델 경량화(pruning, quantization)와 효율적인 아키텍처 설계가 핵심 과제입니다.

**설명 가능성** 문제도 중요합니다. 왜 딥페이크로 판단했는지 설명이 부족한 만큼, Attention visualization, GradCAM, LIME 등 XAI 기법 활용이 필요합니다.

---

## 5. 참고 자료

**주요 논문**은 "Deepfakes and Beyond: A Survey of Face Manipulation and Fake Detection" (2020), "AudioVisual Person Recognition in Multimedia Data from the IARPA Janus Program" (2022) 등이 있습니다.

**유용한 라이브러리**로는 OpenCV(비디오 처리), Librosa/Torchaudio(오디오 분석), Timm(사전 학습된 비전 모델), Hugging Face Transformers(최신 딥러닝 모델)가 있습니다.

다음 글에서는 특정 SOTA 모델(MesoNet, Xception-based detector 등)의 세부 구현과 실제 데이터셋을 활용한 학습 과정을 다뤄보겠습니다.
---
title: "Seeing Through Deepfakes: A Human-Inspired Framework for Multi-Face Detection"
date: "2025-11-25"
description: "ICCV 2025 딥페이크 탐지 논문 리뷰. 인간의 4가지 인지 단서를 AI에 적용한 HICOM 프레임워크를 소개하고, 다중 얼굴 시나리오에서의 탐지 방법을 Python 코드와 함께 정리합니다."
tags: ["AI", "딥페이크", "논문리뷰", "ICCV", "컴퓨터비전", "멀티페이스", "보안", "Python"]
---

# Seeing Through Deepfakes: A Human-Inspired Framework for Multi-Face Detection

AI 시리즈 : ICCV 2025 딥페이크 탐지 논문 리뷰

이번 ICCV에 흥미로운 딥페이크 감지 관련 논문이 올라와서 리뷰해보고자 합니다. 얼마 전 홍콩에서 실제로 벌어졌던 사건인데요. 사기범들이 CFO와 여러 직원들의 얼굴을 딥페이크로 만들어 화상 회의를 진행했고, 그 결과 **2,500만 홍콩달러(약 42억원)를 편취**하는 데 성공했습니다.

이 사건이 시사하는 것은 명확합니다. 이제 딥페이크는 단순히 한 사람의 얼굴만 바꾸는 게 아니라, **여러 사람이 등장하는 그룹 상황**에서도 활용되고 있습니다. 하지만 기존 딥페이크 탐지 기술은 대부분 단일 얼굴에만 초점을 맞췄기 때문에 이런 복잡한 상황에서는 제대로 작동하지 않습니다.

---

## 인간이 딥페이크를 탐지하는 방법

연구팀은 매우 독특한 접근을 시도했습니다. **"인간이 딥페이크를 어떻게 탐지하는가?"** 를 먼저 연구한 것입니다. 인간 대상 실험을 통해 사람들이 다음 4가지 주요 단서를 활용한다는 것을 발견했습니다.

### 1. 장면-모션 일관성 (Scene-Motion Coherence)

영상 속 여러 사람들이 같은 공간에 있다면 그들의 움직임이 일관성을 가져야 합니다. 카메라가 흔들리면 모든 사람이 함께 흔들려야 하고, 조명 변화는 모든 얼굴에 동일하게 영향을 미쳐야 합니다.

### 2. 얼굴 간 외관 호환성 (Inter-Face Appearance Compatibility)

같은 환경에 있는 사람들의 얼굴은 조명 방향과 색온도, 그림자 패턴, 전체적인 화질과 노이즈 레벨 등 비슷한 특성을 공유해야 합니다.

### 3. 대인 시선 정렬 (Interpersonal Gaze Alignment)

사람들이 대화할 때 시선의 방향은 서로 일치해야 합니다. A가 B를 보면 B의 시선도 그에 상응해야 하고, 여러 사람이 한 사람을 볼 때 시선이 수렴해야 합니다.

### 4. 얼굴-신체 일관성 (Face-Body Consistency)

얼굴과 몸의 움직임은 자연스럽게 연결되어야 합니다. 고개를 돌리면 어깨도 함께 움직이고, 표정 변화가 목 근육에도 반영됩니다.

---

## HICOM 프레임워크

연구팀은 이 4가지 인간의 인지 단서를 기반으로 **HICOM(Human-Inspired COherence Model)** 프레임워크를 개발했습니다.

### 주요 성능 지표

| 환경 | 성능 향상 |
|---|---|
| 일반 데이터셋 | 평균 정확도 **3.3%** 향상 |
| 실제 환경 (압축, 노이즈 등) | **2.8%** 향상 |
| 미확인 데이터셋 | 기존 방법 대비 **5.8%** 향상 |

### 설명 가능한 탐지

HICOM의 가장 큰 강점 중 하나는 **LLM을 통합하여** 탐지 결과를 사람이 이해할 수 있는 언어로 설명한다는 점입니다.

```
"이 영상에서 왼쪽 사람의 얼굴은 가짜로 판단됩니다.
이유:
1. 다른 사람들과 달리 조명 방향이 일치하지 않습니다
2. 오른쪽 사람을 보고 있지만 시선이 정확히 맞지 않습니다
3. 고개를 돌릴 때 몸의 움직임이 부자연스럽습니다"
```

---

## 예시 코드

> 논문의 4가지 핵심 탐지 기법을 Python으로 구현한 교육 목적의 시연용 코드입니다.

```python
import numpy as np
import cv2
from typing import List, Tuple, Dict
from dataclasses import dataclass
import matplotlib.pyplot as plt


@dataclass
class FaceInfo:
    """얼굴 정보를 담는 데이터 클래스"""
    bbox: Tuple[int, int, int, int]   # (x, y, w, h)
    landmarks: np.ndarray             # 얼굴 랜드마크 좌표
    gaze_vector: np.ndarray           # 시선 벡터
    motion_vector: np.ndarray         # 모션 벡터
    appearance_features: np.ndarray   # 외관 특징


class HICOMDetector:
    """
    HICOM 딥페이크 탐지기
    인간의 4가지 인지 단서를 활용한 다중 얼굴 딥페이크 탐지
    """

    def __init__(self, threshold: float = 0.7):
        self.threshold = threshold

    def detect_deepfake(self,
                        video_frames: List[np.ndarray],
                        faces_info: List[List[FaceInfo]]) -> Dict:
        scores = {
            'scene_motion_coherence': [],
            'inter_face_appearance': [],
            'gaze_alignment': [],
            'face_body_consistency': []
        }

        for i in range(1, len(video_frames)):
            prev_faces = faces_info[i-1]
            curr_faces = faces_info[i]

            scores['scene_motion_coherence'].append(
                self.check_scene_motion_coherence(
                    video_frames[i-1], video_frames[i], prev_faces, curr_faces))
            scores['inter_face_appearance'].append(
                self.check_inter_face_appearance(curr_faces))
            scores['gaze_alignment'].append(
                self.check_gaze_alignment(curr_faces))
            scores['face_body_consistency'].append(
                self.check_face_body_consistency(prev_faces, curr_faces))

        final_score = self._aggregate_scores(scores)
        is_deepfake = final_score < self.threshold

        return {
            'is_deepfake': is_deepfake,
            'confidence': abs(final_score - 0.5) * 2,
            'scores': scores,
            'final_score': final_score,
            'explanation': self._generate_explanation(scores, is_deepfake)
        }

    def check_scene_motion_coherence(self, prev_frame, curr_frame,
                                      prev_faces, curr_faces) -> float:
        """1. 장면-모션 일관성 — 모든 얼굴이 전역 모션과 일치하는지 확인"""
        if len(prev_faces) < 2 or len(curr_faces) < 2:
            return 1.0

        global_motion = self._estimate_global_motion(prev_frame, curr_frame)
        face_motions = [cf.motion_vector - pf.motion_vector
                        for pf, cf in zip(prev_faces, curr_faces)]

        consistency_scores = [self._cosine_similarity(fm, global_motion)
                               for fm in face_motions]
        variance = np.var(consistency_scores)
        return 1.0 / (1.0 + variance)

    def check_inter_face_appearance(self, faces: List[FaceInfo]) -> float:
        """2. 얼굴 간 외관 호환성 — 같은 장면의 얼굴들이 비슷한 조명/화질을 가지는지"""
        if len(faces) < 2:
            return 1.0
        features = [f.appearance_features for f in faces]
        similarities = [
            self._cosine_similarity(features[i], features[j])
            for i in range(len(faces)) for j in range(i+1, len(faces))
        ]
        return np.mean(similarities)

    def check_gaze_alignment(self, faces: List[FaceInfo]) -> float:
        """3. 대인 시선 정렬 — 시선 방향이 대상 위치와 일치하는지"""
        if len(faces) < 2:
            return 1.0
        alignment_scores = []
        for i in range(len(faces)):
            for j in range(len(faces)):
                if i == j:
                    continue
                center_i = self._get_face_center(faces[i].bbox)
                center_j = self._get_face_center(faces[j].bbox)
                expected = center_j - center_i
                expected = expected / np.linalg.norm(expected)
                alignment = self._cosine_similarity(faces[i].gaze_vector, expected)
                alignment_scores.append(1.0 if alignment > -0.3 else 0.0)
        return np.mean(alignment_scores) if alignment_scores else 1.0

    def check_face_body_consistency(self, prev_faces, curr_faces) -> float:
        """4. 얼굴-신체 일관성 — 얼굴 회전 시 몸도 함께 움직이는지"""
        if not prev_faces or not curr_faces:
            return 1.0
        scores = []
        for pf, cf in zip(prev_faces, curr_faces):
            face_rotation = self._estimate_rotation(pf.landmarks, cf.landmarks)
            body_motion   = self._estimate_body_motion(pf.bbox, cf.bbox)
            if abs(face_rotation) > 15:
                scores.append(1.0 if body_motion > 5 else 0.3)
            else:
                scores.append(1.0)
        return np.mean(scores) if scores else 1.0

    def _aggregate_scores(self, scores: Dict) -> float:
        weights = {
            'scene_motion_coherence': 0.30,
            'inter_face_appearance':  0.25,
            'gaze_alignment':         0.25,
            'face_body_consistency':  0.20
        }
        return sum(np.mean(scores[k]) * w for k, w in weights.items() if scores[k])

    def _generate_explanation(self, scores: Dict, is_deepfake: bool) -> str:
        if not is_deepfake:
            return "이 영상은 진짜로 판단됩니다. 모든 일관성 검사를 통과했습니다."
        avg = {k: np.mean(v) if v else 1.0 for k, v in scores.items()}
        explanation = "이 영상에서 딥페이크가 감지되었습니다.\n\n의심스러운 점:\n"
        if avg['scene_motion_coherence'] < 0.6:
            explanation += "- 얼굴들의 움직임이 장면 전체와 일치하지 않습니다.\n"
        if avg['inter_face_appearance'] < 0.6:
            explanation += "- 얼굴들의 조명이나 화질이 서로 다릅니다.\n"
        if avg['gaze_alignment'] < 0.6:
            explanation += "- 사람들의 시선 방향이 부자연스럽습니다.\n"
        if avg['face_body_consistency'] < 0.6:
            explanation += "- 얼굴과 몸의 움직임이 조화롭지 않습니다.\n"
        return explanation

    @staticmethod
    def _estimate_global_motion(f1, f2): return np.random.randn(2)

    @staticmethod
    def _cosine_similarity(v1, v2):
        n1, n2 = np.linalg.norm(v1), np.linalg.norm(v2)
        return 0.0 if n1 == 0 or n2 == 0 else np.dot(v1, v2) / (n1 * n2)

    @staticmethod
    def _get_face_center(bbox):
        x, y, w, h = bbox
        return np.array([x + w/2, y + h/2])

    @staticmethod
    def _estimate_rotation(lm1, lm2): return np.random.uniform(-20, 20)

    @staticmethod
    def _estimate_body_motion(b1, b2):
        c1 = np.array([b1[0]+b1[2]/2, b1[1]+b1[3]/2])
        c2 = np.array([b2[0]+b2[2]/2, b2[1]+b2[3]/2])
        return np.linalg.norm(c2 - c1)


if __name__ == "__main__":
    # 데모 데이터 생성
    num_frames, num_faces = 10, 3
    video_frames = [np.random.rand(480, 640, 3) * 255 for _ in range(num_frames)]
    faces_info   = [
        [FaceInfo(bbox=(100+fi*200, 100, 150, 200),
                  landmarks=np.random.rand(68, 2)*100,
                  gaze_vector=np.random.randn(2),
                  motion_vector=np.random.randn(2),
                  appearance_features=np.random.rand(512))
         for fi in range(num_faces)]
        for _ in range(num_frames)
    ]

    detector = HICOMDetector(threshold=0.7)
    result   = detector.detect_deepfake(video_frames, faces_info)

    print(f"판정: {'⚠️ 딥페이크 감지!' if result['is_deepfake'] else '✅ 진짜 영상'}")
    print(f"신뢰도: {result['confidence']:.2%}")
    print(result['explanation'])
```

---

## 실험 결과와 의의

**정량적 성과**는 Cross-dataset 일반화에서 기존 SOTA 대비 5.8% 개선, 실시간 처리 가능한 속도, 다양한 딥페이크 생성 방법에 대한 견고성입니다.

**기술적 의의**는 세 가지로 정리됩니다. 첫째, 인간 중심 설계로 AI가 인간의 인지 방식을 학습합니다. 둘째, 블랙박스가 아닌 설명 가능한 탐지를 제공합니다. 셋째, 단일 얼굴뿐만 아니라 그룹 시나리오에서도 작동합니다.

---

## 미래 전망

HICOM 프레임워크는 딥페이크 탐지의 새로운 패러다임을 제시합니다. **법적 증거 활용** 측면에서 설명 가능한 탐지 결과는 법정에서 증거로 활용 가능합니다. **실시간 화상회의 보안**으로 Zoom, Teams 등에 통합할 수 있으며, **미디어 진위 검증**으로 뉴스와 소셜 미디어의 신뢰성을 확보할 수 있습니다.

---

## 핵심 요약

- ✅ 인간의 인지 방식을 AI에 적용한 혁신적 접근
- ✅ 4가지 핵심 단서: 장면-모션, 얼굴 외관, 시선 정렬, 얼굴-몸 일관성
- ✅ 다중 얼굴 시나리오에서 탁월한 성능
- ✅ LLM 기반 설명 가능한 탐지
- ✅ 실제 환경에서의 강건성 입증
---
title: "Kubeflow 구축하기"
date: "2026-02-09"
description: "Kubeflow v1.10/v1.11 완벽 설치 가이드. Cert-Manager, Istio, Dex, KServe, Katib, Training Operators 등 각 컴포넌트별 상세 설치 방법과 첫 워크플로우 실행까지 정리합니다."
tags: ["프로그래밍", "Kubeflow", "Kubernetes", "MLOps", "머신러닝", "KServe", "DevOps"]
---

# Kubeflow 구축하기

프로그래밍/코딩 공부

Kubeflow는 Kubernetes 위에서 머신러닝 워크플로우를 구축, 배포, 관리하기 위한 오픈소스 플랫폼입니다. 이 가이드에서는 **Kubeflow v1.10/v1.11** 을 기준으로 각 컴포넌트를 단계별로 설치하는 방법을 다룹니다.

---

## 1. Kubeflow 소개

### 주요 컴포넌트

| 카테고리 | 컴포넌트 | 역할 |
|---|---|---|
| ML 파이프라인 | Kubeflow Pipelines | ML 워크플로우 오케스트레이션 |
| ML 파이프라인 | Katib | 하이퍼파라미터 튜닝 및 AutoML |
| 모델 학습 | Training Operators | TensorFlow, PyTorch 등 분산 학습 |
| 모델 서빙 | KServe | 모델 서빙 및 추론 |
| 개발 환경 | Jupyter Notebooks | 인터랙티브 개발 환경 |
| 플랫폼 관리 | Central Dashboard | 통합 UI |

**최신 버전 정보**: Kubeflow Platform v1.10 (2025년 3월), KFP 2.15.2, 지원 K8s 버전 1.31~1.33+

---

## 2. 사전 요구사항

### 하드웨어 요구사항

| 구분 | CPU | 메모리 | 디스크 |
|---|---|---|---|
| 최소 | 4코어 | 16GB RAM | 100GB |
| 권장 (프로덕션) | 8코어+ | 32GB RAM+ | 200GB+ (SSD) |

### 소프트웨어 설치 확인

```bash
kubectl version --client    # Kubernetes 1.31-1.33+
kustomize version           # Kustomize 5.7.1+
docker version              # Docker 또는 Podman
```

### 리눅스 커널 설정 (Kind 사용 시)

```bash
sudo sysctl fs.inotify.max_user_instances=2280
sudo sysctl fs.inotify.max_user_watches=1255360

# 영구 적용
echo "fs.inotify.max_user_instances=2280" | sudo tee -a /etc/sysctl.conf
echo "fs.inotify.max_user_watches=1255360" | sudo tee -a /etc/sysctl.conf
```

---

## 3. 설치 준비

### 저장소 클론

```bash
git clone https://github.com/kubeflow/manifests.git
cd manifests
git checkout v1.10.0  # 안정 버전 권장
```

### Kind 클러스터 생성 (로컬 개발용)

```bash
cat <<EOF | kind create cluster --name=kubeflow --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  image: kindest/node:v1.34.0@sha256:7416a61b42...
  kubeadmConfigPatches:
  - |
    kind: ClusterConfiguration
    apiServer:
      extraArgs:
        "service-account-issuer": "https://kubernetes.default.svc"
        "service-account-signing-key-file": "/etc/kubernetes/pki/sa.key"
EOF

kind get kubeconfig --name kubeflow > /tmp/kubeflow-config
export KUBECONFIG=/tmp/kubeflow-config
kubectl cluster-info
```

---

## 4. 기본 인프라 컴포넌트 설치

### 4.1 Kubeflow Namespace

```bash
kustomize build common/kubeflow-namespace/base | kubectl apply -f -
kubectl get namespace kubeflow
```

### 4.2 Cert-Manager (TLS 인증서 관리)

```bash
kustomize build common/cert-manager/base | kubectl apply -f -
kustomize build common/cert-manager/kubeflow-issuer/base | kubectl apply -f -

kubectl wait --for=condition=Ready pod -l 'app in (cert-manager,webhook)' \
  --timeout=180s -n cert-manager
```

### 4.3 Istio (Service Mesh)

```bash
kustomize build common/istio/istio-crds/base | kubectl apply -f -
kustomize build common/istio/istio-namespace/base | kubectl apply -f -

# 대부분의 플랫폼 (Kind, Minikube, AKS, EKS)
kustomize build common/istio/istio-install/overlays/oauth2-proxy | kubectl apply -f -

kubectl wait --for=condition=Ready pods --all -n istio-system --timeout=300s
```

> **Istio CNI 사용 이유**: Privileged init container 불필요로 보안 강화, Pod Security Standards 호환성 향상

### 4.4 OAuth2-Proxy

```bash
# 기본 설치 (Dex만 사용)
kustomize build common/oauth2-proxy/overlays/m2m-dex-only/ | kubectl apply -f -
kubectl wait --for=condition=Ready pod -l 'app.kubernetes.io/name=oauth2-proxy' \
  --timeout=180s -n oauth2-proxy
```

### 4.5 Dex (Identity Provider)

```bash
kustomize build common/dex/overlays/oauth2-proxy | kubectl apply -f -
kubectl wait --for=condition=Ready pods --all --timeout=180s -n auth
```

Dex는 OIDC 프로바이더로 기본 정적 사용자를 제공합니다. 외부 IDP(Azure AD, GitHub 등) 연동도 지원합니다.

### 4.6 Knative (모델 서빙 백엔드)

```bash
kustomize build common/knative/knative-serving/overlays/gateways | kubectl apply -f -
kustomize build common/istio/cluster-local-gateway/base | kubectl apply -f -
```

### 4.7 나머지 공통 컴포넌트

```bash
kustomize build common/networkpolicies/base | kubectl apply -f -
kustomize build common/kubeflow-roles/base | kubectl apply -f -
kustomize build common/istio/kubeflow-istio-resources/base | kubectl apply -f -
```

---

## 5. Kubeflow 핵심 컴포넌트 설치

### 5.1 Kubeflow Pipelines

```bash
# Kubernetes Native API 모드 (권장)
kustomize build applications/pipeline/upstream/env/cert-manager/platform-agnostic-multi-user-k8s-native | kubectl apply -f -
kubectl get pods -n kubeflow | grep ml-pipeline
```

**KFP SDK 설치 및 기본 예제**

```bash
pip install kfp==2.15.2
```

```python
from kfp import dsl, compiler
import kfp

@dsl.component
def add_numbers(a: float, b: float) -> float:
    return a + b

@dsl.pipeline(name='Addition Pipeline')
def addition_pipeline(a: float = 1.0, b: float = 2.0):
    add_task = add_numbers(a=a, b=b)

client = kfp.Client(host='http://localhost:8080/pipeline')
client.create_run_from_pipeline_func(addition_pipeline, arguments={'a': 5.0, 'b': 3.0})
```

### 5.2 KServe (모델 서빙)

```bash
kustomize build applications/kserve/kserve | kubectl apply --server-side --force-conflicts -f -
kustomize build applications/kserve/models-web-app/overlays/kubeflow | kubectl apply -f -
```

```yaml
# 모델 배포 예시
apiVersion: serving.kserve.io/v1beta1
kind: InferenceService
metadata:
  name: sklearn-iris
spec:
  predictor:
    sklearn:
      storageUri: gs://kfserving-examples/models/sklearn/1.0/model
```

### 5.3 Katib (하이퍼파라미터 튜닝)

```bash
kustomize build applications/katib/upstream/installs/katib-with-kubeflow | kubectl apply -f -
```

지원 검색 알고리즘: Random, Grid, Bayesian, Hyperband, Early Stopping

### 5.4 Central Dashboard + Notebooks

```bash
kustomize build applications/centraldashboard/overlays/oauth2-proxy | kubectl apply -f -
kustomize build applications/jupyter/notebook-controller/upstream/overlays/kubeflow | kubectl apply -f -
kustomize build applications/jupyter/jupyter-web-app/upstream/overlays/istio | kubectl apply -f -
```

사용 가능한 공식 이미지: `jupyter-tensorflow-full`, `jupyter-pytorch-full`, `codeserver-python`, `rstudio-tidyverse`

### 5.5 Training Operators

```bash
# Trainer v2 설치 (차세대)
kustomize build applications/trainer/upstream/overlays/kubeflow-platform | kubectl apply --server-side --force-conflicts -f -
```

지원 Job 타입: TFJob, PyTorchJob, MPIJob, MXJob, XGBoostJob, PaddleJob

### 5.6 나머지 컴포넌트

```bash
kustomize build applications/profiles/upstream/overlays/kubeflow | kubectl apply -f -
kustomize build applications/admission-webhook/upstream/overlays/cert-manager | kubectl apply -f -
kustomize build applications/volumes-web-app/upstream/overlays/istio | kubectl apply -f -
kustomize build applications/tensorboard/tensorboard-controller/upstream/overlays/kubeflow | kubectl apply -f -

# 사용자 네임스페이스 생성
kustomize build common/user-namespace/base | kubectl apply -f -
```

---

## 6. 클러스터 접속 및 검증

### 모든 Pod 상태 확인

```bash
kubectl get pods --all-namespaces | grep -v "Running\|Completed"
```

### Port-Forward로 접속

```bash
kubectl port-forward svc/istio-ingressgateway -n istio-system 8080:80
# 브라우저: http://localhost:8080
# Email: user@example.com / Password: 12341234
```

> ⚠️ 프로덕션 환경에서는 반드시 기본 비밀번호를 변경하세요.

### 기본 비밀번호 변경

```bash
python3 -c 'from passlib.hash import bcrypt; import getpass; print(bcrypt.using(rounds=12, ident="2y").hash(getpass.getpass()))'

kubectl delete secret dex-passwords -n auth
kubectl create secret generic dex-passwords \
  --from-literal=DEX_USER_PASSWORD='$2y$12$...' -n auth
kubectl delete pods --all -n auth
```

---

## 7. 첫 워크플로우 실행

### 간단한 ML 파이프라인 예제

```python
from kfp import dsl, compiler
import kfp

@dsl.component(base_image='python:3.9')
def generate_data(n_samples: int) -> str:
    import json, numpy as np
    data = np.random.randn(n_samples, 4).tolist()
    return json.dumps(data)

@dsl.component(base_image='python:3.9')
def train_model(data: str) -> dict:
    import json, numpy as np
    from sklearn.linear_model import LinearRegression
    data_array = np.array(json.loads(data))
    X, y = data_array[:, :-1], data_array[:, -1]
    model = LinearRegression().fit(X, y)
    return {'score': float(model.score(X, y)), 'n_samples': len(X)}

@dsl.pipeline(name='Simple ML Pipeline')
def simple_ml_pipeline(n_samples: int = 100):
    data_task  = generate_data(n_samples=n_samples)
    train_task = train_model(data=data_task.output)

compiler.Compiler().compile(simple_ml_pipeline, 'simple_pipeline.yaml')

client = kfp.Client()
run = client.create_run_from_pipeline_func(
    simple_ml_pipeline,
    arguments={'n_samples': 200},
    experiment_name='my-first-experiment'
)
print(f"파이프라인 실행 ID: {run.run_id}")
```

---

## 8. 문제 해결

| 문제 | 원인 | 해결책 |
|---|---|---|
| Pod Pending | 리소스 부족, PVC 바인딩 실패 | `kubectl describe pod` 이벤트 확인 |
| CrashLoopBackOff | 설정 오류, 의존성 문제 | `kubectl logs --previous` 확인 |
| ImagePullBackOff | 레지스트리 인증 실패 | `docker-registry` Secret 생성 |
| Webhook Connection Refused | Webhook 미준비 | 잠시 대기 후 재시도 |

```bash
# 유용한 디버깅 명령어
kubectl get all -n kubeflow
kubectl top pods -n kubeflow
kubectl get crd | grep kubeflow
```

---

## 9. 프로덕션 배포 고려사항

**고가용성**: 주요 Deployment의 replica 수를 3 이상으로 설정하고 PodDisruptionBudget을 구성합니다.

**보안 강화**: 기본 비밀번호 변경, Network Policy 적용, Istio mTLS 활성화, RBAC 최소 권한 원칙을 따릅니다.

**모니터링**: Prometheus + Grafana 스택을 설치하여 클러스터 메트릭을 수집합니다.

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace
```

---

## 학습 리소스

- **공식 문서**: [kubeflow.org/docs](https://www.kubeflow.org/docs/)
- **GitHub**: [github.com/kubeflow/manifests](https://github.com/kubeflow/manifests)
- **커뮤니티**: CNCF Slack #kubeflow-platform

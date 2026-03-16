---
title: "Kubernetes 구축 완벽 가이드"
date: "2026-02-09"
description: "Kubernetes(K8s) 클러스터를 처음부터 구축하는 방법을 단계별로 정리합니다. Minikube로 로컬 환경 구축부터 kubeadm으로 프로덕션 클러스터 구축, 첫 애플리케이션 배포까지 다룹니다."
tags: ["Kubernetes", "K8s", "DevOps", "컨테이너", "인프라", "kubeadm", "Minikube"]
---

# Kubernetes 구축 완벽 가이드

프로그래밍/인프라

Kubernetes(쿠버네티스, 줄여서 K8s)는 컨테이너화된 애플리케이션의 배포, 확장 및 관리를 자동화하는 오픈소스 플랫폼입니다. 이 가이드에서는 Kubernetes 클러스터를 처음부터 구축하는 방법을 단계별로 알아보겠습니다.

---

## 1. Kubernetes란?

Kubernetes는 Google이 개발하고 현재는 Cloud Native Computing Foundation(CNCF)에서 관리하는 컨테이너 오케스트레이션 플랫폼입니다. 주요 기능으로는 자동화된 배포 및 롤백, 서비스 디스커버리와 로드 밸런싱, 스토리지 오케스트레이션, 자동 복구(Self-healing), 시크릿 및 구성 관리가 있습니다.

---

## 2. 사전 요구사항

**하드웨어 요구사항**은 마스터 노드 기준 최소 2GB RAM, 2 CPU 코어이며 워커 노드는 노드당 최소 1GB RAM, 1 CPU 코어, 디스크 공간은 20GB 이상이 필요합니다.

**소프트웨어 요구사항**으로는 Linux 운영체제(Ubuntu 20.04/22.04, CentOS 7/8, RHEL 등), 컨테이너 런타임(Docker, containerd, CRI-O 중 하나), 네트워크 연결 및 고유 호스트명, MAC 주소, product_uuid가 필요합니다.

---

## 3. 구축 방법 선택하기

| 환경 | 도구 | 특징 |
|---|---|---|
| **로컬 개발** | Minikube | 단일 노드 클러스터, 학습 및 테스트용 |
| | kind | Docker 컨테이너 내에서 실행 |
| | Docker Desktop | Windows/Mac에서 간편하게 사용 |
| **프로덕션** | kubeadm | 수동 클러스터 구축 도구 |
| | kops | AWS에 특화된 클러스터 관리 도구 |
| | kubespray | Ansible 기반 배포 도구 |
| **관리형 서비스** | EKS / GKE / AKS | AWS / Google Cloud / Azure |

이 가이드에서는 **Minikube**와 **kubeadm**을 중심으로 설명하겠습니다.

---

## 4. Minikube로 로컬 환경 구축하기

### 4.1 Minikube 설치

```bash
# Linux
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# macOS (Homebrew)
brew install minikube

# Windows (Chocolatey)
choco install minikube
```

### 4.2 kubectl 설치

```bash
# Linux
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# macOS
brew install kubectl

# Windows
choco install kubernetes-cli
```

### 4.3 Minikube 클러스터 시작

```bash
# 클러스터 시작
minikube start

# 특정 드라이버 지정
minikube start --driver=docker

# 리소스 설정
minikube start --cpus=4 --memory=8192
```

### 4.4 클러스터 상태 확인

```bash
minikube status
kubectl get nodes
minikube dashboard
```

---

## 5. Kubeadm으로 프로덕션 클러스터 구축하기

### 5.1 모든 노드에서 사전 설정

**스왑 비활성화**

```bash
sudo swapoff -a
sudo sed -i '/ swap / s/^\(.*\)$/#\1/g' /etc/fstab
```

**컨테이너 런타임 설치 (containerd)**

```bash
# 필수 모듈 로드
cat <<EOF | sudo tee /etc/modules-load.d/containerd.conf
overlay
br_netfilter
EOF

sudo modprobe overlay
sudo modprobe br_netfilter

# 네트워크 설정
cat <<EOF | sudo tee /etc/sysctl.d/99-kubernetes-cri.conf
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward = 1
net.bridge.bridge-nf-call-ip6tables = 1
EOF

sudo sysctl --system

# containerd 설치
sudo apt-get update && sudo apt-get install -y containerd
sudo mkdir -p /etc/containerd
containerd config default | sudo tee /etc/containerd/config.toml
sudo systemctl restart containerd && sudo systemctl enable containerd
```

**Kubernetes 구성 요소 설치**

```bash
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl

curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.28/deb/Release.key | \
    sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.28/deb/ /' | \
    sudo tee /etc/apt/sources.list.d/kubernetes.list

sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl
```

### 5.2 마스터 노드 초기화

마스터 노드에서만 실행합니다.

```bash
# 클러스터 초기화 (출력되는 join 명령어를 반드시 저장!)
sudo kubeadm init --pod-network-cidr=10.244.0.0/16

# kubectl 설정
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

### 5.3 네트워크 플러그인 설치

Pod 간 통신을 위해 CNI(Container Network Interface) 플러그인이 필요합니다.

```bash
# Flannel
kubectl apply -f https://github.com/flannel-io/flannel/releases/latest/download/kube-flannel.yml

# 또는 Calico
kubectl apply -f https://docs.projectcalico.org/manifests/calico.yaml
```

### 5.4 워커 노드 추가

각 워커 노드에서 마스터 노드 초기화 시 출력된 join 명령어를 실행합니다.

```bash
# 워커 노드에서 실행
sudo kubeadm join 192.168.1.100:6443 --token abcdef.0123456789abcdef \
    --discovery-token-ca-cert-hash sha256:1234567890abcdef...

# 토큰이 만료된 경우 마스터 노드에서 재발급
kubeadm token create --print-join-command
```

---

## 6. 클러스터 검증하기

```bash
kubectl get nodes                   # 노드 상태 확인 (모두 Ready여야 함)
kubectl get pods --all-namespaces   # 모든 Pod 확인 (Running 상태여야 함)
kubectl cluster-info                # 클러스터 정보 확인
kubectl get componentstatuses       # 컴포넌트 상태 확인
```

모든 노드가 **Ready** 상태이고, 시스템 Pod들이 **Running** 상태이면 성공입니다.

---

## 7. 첫 애플리케이션 배포하기

Nginx 웹 서버를 배포해보겠습니다.

### Deployment 생성

```bash
kubectl create deployment nginx --image=nginx
kubectl get deployments
kubectl get pods
```

### Service 생성 및 접속

```bash
kubectl expose deployment nginx --port=80 --type=NodePort
kubectl get services

# Minikube의 경우
minikube service nginx
```

### Deployment 확장

```bash
kubectl scale deployment nginx --replicas=3
kubectl get pods
```

### 리소스 정리

```bash
kubectl delete service nginx
kubectl delete deployment nginx
```

---

## 추가 권장사항

**모니터링 및 로깅**

```bash
# Metrics Server 설치
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
```

**보안 강화**는 RBAC(역할 기반 액세스 제어) 설정, Network Policy 구성, Pod Security Standards 적용, 정기적인 보안 업데이트를 권장합니다.

---

## 문제 해결 팁

**Pod가 Pending 상태인 경우** (리소스 부족, 노드 selector 미스매치, PersistentVolume 이슈 등)

```bash
kubectl describe pod <pod-name>
```

**노드가 NotReady 상태인 경우** (kubelet 서비스 중단, 네트워크 플러그인 문제 등)

```bash
kubectl describe node <node-name>
systemctl status kubelet
journalctl -xeu kubelet
```

**네트워크 통신 문제**

```bash
# DNS 확인
kubectl run -it --rm debug --image=busybox --restart=Never -- nslookup kubernetes.default

# Pod 간 통신 확인
kubectl run -it --rm debug --image=busybox --restart=Never -- ping <pod-ip>
```

---

## 마치며

Kubernetes 클러스터 구축은 처음에는 복잡해 보일 수 있지만, 한 단계씩 따라가면 충분히 가능합니다. 로컬 환경에서 Minikube로 시작해 개념을 익히고, 점진적으로 kubeadm을 사용한 멀티 노드 클러스터로 확장하는 것을 추천합니다. Happy Kubernetes-ing! 🚀

**참고 자료**: [Kubernetes 공식 문서](https://kubernetes.io/docs/) · [Minikube 문서](https://minikube.sigs.k8s.io/docs/) · [kubeadm 문서](https://kubernetes.io/docs/reference/setup-tools/kubeadm/)

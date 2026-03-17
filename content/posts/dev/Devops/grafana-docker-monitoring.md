---
title: "Docker 컨테이너 모니터링: Grafana + Prometheus + cAdvisor 구축기"
date: "2026-03-17"
description: "실행 중인 Docker 컨테이너(blog, api, self-healing-cicd)를 Grafana로 모니터링하는 스택을 처음부터 구축한 과정을 정리합니다. Linux 환경에서 host.docker.internal 이슈 등 삽질했던 부분도 함께 담았습니다."
tags: ["Grafana", "Prometheus", "cAdvisor", "Docker", "DevOps", "모니터링", "인프라"]
---

# Docker 컨테이너 모니터링: Grafana + Prometheus + cAdvisor 구축기

프로그래밍/인프라

서버에 올려둔 컨테이너들이 지금 CPU를 얼마나 먹고 있는지, 메모리는 넉넉한지, 언제 죽었는지 알 수 없으면 운영이 불안하죠. 이번에 **Grafana + Prometheus + cAdvisor + Node Exporter** 조합으로 모니터링 스택을 직접 구축했고, Linux 환경에서 삽질했던 부분들도 포함해 정리했습니다.

---

## 모니터링 대상

```
blog-blue          (Next.js)         :3000
api-api-1          (FastAPI)         :8000
self-healing-cicd  (Python)          :8080
```

세 컨테이너 모두 각자 다른 Docker Compose 프로젝트로 운영되고 있어요.

---

## 전체 아키텍처

```
[blog / api / self-healing-cicd 컨테이너]
          ↓ (container metrics)
       cAdvisor :8090
          ↓
       Prometheus :9090  ←  Node Exporter :9100 (호스트 메트릭)
          ↓
       Grafana :3001
          ↓
       Nginx (443 SSL)
          ↓
  grafana.koala.ai.kr
```

- **cAdvisor**: Docker 데몬에 접근해 각 컨테이너의 CPU, 메모리, 네트워크 지표를 수집
- **Node Exporter**: 호스트 서버 전체의 CPU, 메모리, 디스크 지표를 수집
- **Prometheus**: 위 두 exporter에서 주기적으로 메트릭을 pull해서 저장
- **Grafana**: Prometheus를 데이터소스로 연결해 대시보드 시각화

---

## 디렉토리 구조

```
/home/monitoring/
├── docker-compose.yml
├── prometheus/
│   └── prometheus.yml
└── grafana/
    ├── provisioning/
    │   ├── datasources/
    │   │   └── prometheus.yml
    │   └── dashboards/
    │       └── default.yml
    └── dashboards/
        └── docker-monitoring.json
```

---

## docker-compose.yml

```yaml
services:
  prometheus:
    image: prom/prometheus:latest
    container_name: monitoring-prometheus
    restart: unless-stopped
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=15d'
      - '--web.enable-lifecycle'
    ports:
      - "9090:9090"
    extra_hosts:
      - "dockerhost:172.17.0.1"
    networks:
      - monitoring

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    container_name: monitoring-cadvisor
    restart: unless-stopped
    privileged: true
    devices:
      - /dev/kmsg:/dev/kmsg
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker:/var/lib/docker:ro
      - /cgroup:/cgroup:ro
    ports:
      - "8090:8080"
    networks:
      - monitoring

  node-exporter:
    image: prom/node-exporter:latest
    container_name: monitoring-node-exporter
    restart: unless-stopped
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    ports:
      - "9100:9100"
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    container_name: monitoring-grafana
    restart: unless-stopped
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin123
      - GF_USERS_ALLOW_SIGN_UP=false
      - GF_SERVER_ROOT_URL=https://grafana.koala.ai.kr
      - GF_SERVER_DOMAIN=grafana.koala.ai.kr
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
      - ./grafana/dashboards:/var/lib/grafana/dashboards
    ports:
      - "3001:3000"
    depends_on:
      - prometheus
    networks:
      - monitoring

networks:
  monitoring:
    driver: bridge

volumes:
  prometheus_data:
  grafana_data:
```

핵심 포인트는 **모든 컨테이너를 동일한 `monitoring` 네트워크에 묶는 것**입니다. 그래야 Grafana가 `http://prometheus:9090`으로 내부 통신이 가능합니다.

---

## prometheus/prometheus.yml

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']

  - job_name: 'blog'
    static_configs:
      - targets: ['dockerhost:3000']
    metrics_path: '/metrics'
    scrape_timeout: 5s

  - job_name: 'api'
    static_configs:
      - targets: ['dockerhost:8000']
    metrics_path: '/metrics'
    scrape_timeout: 5s

  - job_name: 'self-healing-cicd'
    static_configs:
      - targets: ['dockerhost:8080']
    metrics_path: '/metrics'
    scrape_timeout: 5s
```

`dockerhost`는 `docker-compose.yml`의 `extra_hosts`에서 `172.17.0.1`(Docker 브리지 게이트웨이)로 연결됩니다. 이 IP는 아래 명령으로 확인할 수 있어요.

```bash
docker network inspect bridge --format '{{range .IPAM.Config}}{{.Gateway}}{{end}}'
# 172.17.0.1
```

---

## Grafana Provisioning 설정

### datasources/prometheus.yml

```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
```

### dashboards/default.yml

```yaml
apiVersion: 1

providers:
  - name: 'default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    editable: true
    options:
      path: /var/lib/grafana/dashboards
```

Grafana가 시작될 때 `/var/lib/grafana/dashboards` 디렉토리의 JSON 파일을 자동으로 불러옵니다.

---

## 대시보드 구성

대시보드 JSON은 다음 패널들로 구성했어요.

| 섹션 | 패널 | 쿼리 |
|---|---|---|
| Container Status | blog-blue UP/DOWN | `container_last_seen{name="blog-blue"} > 0` |
| Container Status | api-api-1 UP/DOWN | `container_last_seen{name="api-api-1"} > 0` |
| Container Status | self-healing-cicd UP/DOWN | `container_last_seen{name="self-healing-cicd-..."} > 0` |
| CPU Usage | 컨테이너별 CPU % | `rate(container_cpu_usage_seconds_total{name=~"..."}[1m]) * 100` |
| Memory Usage | 컨테이너별 메모리 | `container_memory_usage_bytes{name=~"..."}` |
| Network I/O | 수신/송신 속도 | `rate(container_network_receive_bytes_total{...}[1m])` |
| Host System | 호스트 CPU/메모리 | `node_cpu_seconds_total`, `node_memory_MemAvailable_bytes` |

---

## 실행

```bash
cd /home/monitoring
docker compose up -d
```

---

## Nginx + HTTPS 설정

Grafana에 도메인을 붙이려면 Nginx 리버스 프록시를 추가해야 합니다.

### /etc/nginx/sites-available/grafana

```nginx
server {
    listen 80;
    server_name grafana.koala.ai.kr;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 심볼릭 링크 생성 및 활성화
ln -s /etc/nginx/sites-available/grafana /etc/nginx/sites-enabled/grafana
nginx -t && systemctl reload nginx

# SSL 인증서 발급 (DNS A 레코드 등록 후)
certbot --nginx -d grafana.koala.ai.kr
```

Certbot이 완료되면 Nginx 설정에 443 SSL 블록이 자동으로 추가되고, HTTP → HTTPS 리다이렉트도 설정됩니다.

접속:
- **Grafana**: `https://grafana.koala.ai.kr` (admin / admin123)
- **Prometheus**: `http://서버IP:9090`

---

## 삽질 기록: `host.docker.internal` 이슈

처음에 Prometheus를 `network_mode: host`로 설정하고 Grafana datasource URL을 `http://host.docker.internal:9090`으로 잡았는데, 데이터가 아예 안 나왔어요.

원인은 **Linux에서는 `host.docker.internal`이 자동으로 해석되지 않는다**는 것이었습니다. Docker Desktop(Mac/Windows)에서는 자동 지원되지만 Linux 환경에서는 직접 설정해줘야 해요.

```bash
# Grafana 컨테이너 안에서 확인
docker exec monitoring-grafana wget -qO- http://host.docker.internal:9090/api/v1/query?query=up
# wget: bad address 'host.docker.internal:9090'  ← 실패!
```

**해결 방법**: 모든 서비스를 같은 Docker 네트워크에 넣고 컨테이너 이름으로 통신

```
# Before (안됨)
url: http://host.docker.internal:9090

# After (됨)
url: http://prometheus:9090
```

---

## 삽질 기록: Datasource UID 불일치

대시보드 JSON을 하드코딩으로 작성할 때 datasource UID를 `"prometheus"`로 넣었는데, Grafana가 실제로 부여한 UID는 달랐어요. 패널에 "No data"가 뜨는 원인이 됩니다.

```bash
# 실제 UID 확인
curl -s -u admin:admin123 http://localhost:3001/api/datasources \
  | python3 -c "import json,sys; [print(d['name'], d['uid']) for d in json.load(sys.stdin)]"
# Prometheus  PBFA97CFB590B2093
```

대시보드 JSON 내 모든 `"uid": "prometheus"` 를 실제 UID로 교체한 후 provisioning reload:

```bash
curl -X POST -u admin:admin123 \
  http://localhost:3001/api/admin/provisioning/dashboards/reload
```

---

## 결과

구축 완료 후 확인한 Prometheus targets 상태:

```
cadvisor       up
node-exporter  up
prometheus     up
blog           down  (← /metrics 엔드포인트 없음, 정상)
api            down  (← /metrics 엔드포인트 없음, 정상)
self-healing   down  (← /metrics 엔드포인트 없음, 정상)
```

blog/api/self-healing-cicd 서비스는 `/metrics` 엔드포인트를 별도로 구현하지 않아서 Prometheus scrape는 실패하지만, **cAdvisor가 수집하는 컨테이너 리소스 지표는 정상 동작**합니다. Grafana 대시보드에서 CPU, 메모리, 네트워크 I/O 모두 정상 시각화됩니다.

---

## 삽질 기록: 리버스 프록시 뒤에서 로그인 실패

Nginx로 도메인을 붙인 뒤 `https://grafana.koala.ai.kr`에 접속하면 로그인 화면은 뜨는데, 로그인 버튼을 누르면 **"Login failed - Unknown error occurred"** 가 뜨는 현상이 생겼어요.

원인은 Grafana의 **CSRF 보호 / 쿠키 도메인** 설정 때문입니다. Grafana는 자신이 어떤 URL로 서빙되는지 알아야 세션 쿠키를 올바르게 발급할 수 있는데, 설정이 없으면 내부 포트(`localhost:3001`) 기준으로 동작해서 외부 도메인에서 로그인이 깨집니다.

**해결 방법**: `docker-compose.yml`의 Grafana 환경변수에 실제 접속 URL 명시

```yaml
environment:
  - GF_SERVER_ROOT_URL=https://grafana.koala.ai.kr
  - GF_SERVER_DOMAIN=grafana.koala.ai.kr
```

설정 후 컨테이너를 재시작하면 해결됩니다.

```bash
docker compose up -d grafana
```

---

## 마치며

Grafana 스택은 한번 세팅해두면 이후 컨테이너를 추가할 때도 `prometheus.yml`에 job만 추가하면 되니까 확장성이 좋아요. 앞으로 서비스가 늘어나도 같은 구조로 모니터링을 붙일 수 있을 것 같습니다.

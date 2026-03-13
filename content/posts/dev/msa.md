---
title: "[3주차] 마이크로서비스"
date: "2025-03-22"
description: "박사과정 빅데이터서비스모델링 수업 3주차 — Monolithic vs Microservice 아키텍처 비교 및 FastAPI 실습"
tags: ["대학원", "마이크로서비스", "FastAPI", "아키텍처", "빅데이터서비스모델링"]
---

# [3주차] 마이크로서비스

대학원 수업 / 빅데이터서비스모델링

빅데이터 서비스 모델링 3주차 수업의 주제는 **마이크로서비스**입니다. 마이크로서비스의 대표적인 기업으로는 **Netflix**가 있습니다.

---

## Monolithic Service란?

전통적인 서비스 방식으로, **하나의 프로세스 안에 모든 기능이 들어있는** 형태입니다. 예를 들어 Ollama 하나만을 이용해서 LLM 서비스를 대외 오픈했다면, 그 자체로 Monolithic 아키텍처입니다.

- 초기 배포와 수정 배포의 부담이 동일합니다.
- 로깅처럼 없어도 되는 기능에서 에러가 발생해 프로세스가 죽으면 Ollama 서버 전체가 죽어버립니다.
- 이를 **단일 실패점(Single Point of Failure, SPOF)** 이라고 합니다.

**장점**: 모든 기능이 하나의 프로세스 안에서 동작하므로, 모듈(함수) 간 데이터 교환이 메모리 내에서 이루어져 **굉장히 빠릅니다.**

---

## Micro Service란?

**프로세스 단위로 서비스가 분리된** 형태입니다. 즉, IP:Port 쌍으로 프로세스가 구성되어 서비스가 독립적으로 분리되어 있는 구조입니다.

- 최초 배포 시 서비스 수만큼 배포해야 하므로 번거롭습니다. (5개 서비스 → 5번 배포)
- 그러나 로깅 서비스에 에러가 생겨 수정 배포 시, **로깅 서비스만 재배포**하면 됩니다.
- 로깅 서비스가 죽더라도 **전체 서비스는 유지**됩니다.
- 단, core service가 죽으면 이는 SPOF로 작용합니다. 다만 Monolithic처럼 마이너 서비스의 장애가 전파될 위험은 줄어듭니다.

**단점**: 각 모듈이 별개의 프로세스이므로, 모듈 간 데이터 교환은 **TCP/IP 통신**으로 이루어집니다. 메모리 내 통신보다 느립니다.

> Monolithic에서는 모듈 단위를 **함수**, Micro Service에서는 **서비스**라고 부릅니다.

---

## 데이터 로컬리티

CPU가 데이터에 더 빠르게 접근할 수 있도록 메모리를 배치하는 방식을 **데이터 로컬리티**라고 합니다. 로컬리티가 높을수록 성능이 높습니다.

| 아키텍처 | 데이터 교환 방식 | 프로세스 로컬리티 |
|---|---|---|
| Monolithic | 메모리 내 교환 | 높음 |
| Micro Service | TCP/IP 통신 | 낮음 |

분산 처리 시스템 구성 시 **랙 로컬리티**(같은 네트워크 내 존재)를 높일 수는 있지만, 프로세스 로컬리티는 달성하기 어렵습니다. 경우에 따라서는 서버를 나누는 것보다 코어 수가 높은 CPU를 활용해 하나의 프로세서에서 모두 처리하는 것이 성능상 유리할 수 있습니다.

---

## Monolithic vs Micro Service 비교

| 항목 | Monolithic | Micro Service |
|---|---|---|
| 초기 배포 | 간단 (1번) | 복잡 (서비스 수만큼) |
| 수정 배포 | 전체 재배포 필요 | 해당 서비스만 재배포 |
| 장애 전파 | 마이너 장애도 전체 영향 | 장애 격리 가능 |
| 모듈 간 통신 | 메모리 내 (빠름) | TCP/IP (느림) |
| 확장성 | 전체 스케일링 | 서비스 단위 스케일링 |

**Micro Service가 무조건 좋은 것은 아닙니다.** 기능별로 무조건 분리하는 것보다 통신 비용을 어떻게 줄일 수 있을지를 먼저 고민해야 합니다.

- core service 간 통신이 많다면 → **Monolithic**
- 통신 비용을 충분히 줄이면서 장애 전파 위험을 분리할 수 있다면 → **Micro Service**

---

## 실제 사례 비교

### 1) Monolithic → Micro Service : Netflix

Netflix는 대표적인 Monolithic → Micro Service 전환 사례입니다. ([Netflix Tech Blog](https://netflixtechblog.com/rebuilding-netflix-video-processing-pipeline-with-microservices-4e5e6310e359))

**AutoScaling**을 통해 Micro Service의 단점인 통신 지연을 극복했습니다. AutoScaling이란 트래픽 증감에 따라 로드밸런서를 통해 core service 인스턴스를 자동으로 늘리고 줄이는 방식입니다. Monolithic 구성에서는 전체를 내렸다 올려야 하므로 불리합니다.

### 2) Micro Service → Monolithic : Amazon Prime Video

> **"Don't Shakespearize!"** — 열풍이 분다고 해서 무조건 따라하지 말라.

Amazon Prime Video는 핵심 서비스(콘텐츠 카탈로그, 재생, 인증)를 Micro Service로 설계했으나, 서비스 간 통신에 발생하는 딜레이가 엔드유저에게 큰 성능 저하로 이어지면서 다시 Monolithic으로 전환했습니다.

단, **Hybrid Approach**를 채택하여 통신 부하가 큰 서비스들은 Monolithic으로, 그렇지 않은 서비스들은 Micro 구조로 유지했습니다.

---

## FastAPI를 이용한 Microservice 실습

### 요청 규격

라면 주문 서비스를 예시로 설계합니다.

```
POST /ramyeon
  - noodle: str
  - soup: str
  - flake: str
  - topping: str
```

### Monolithic 서비스 예시

하나의 FastAPI 앱에서 모든 엔드포인트를 처리합니다.

```python
from fastapi import FastAPI
app = FastAPI()

@app.post("/ramyeon")
async def get_ramen(request: RamenRequest):
    noodle = get_noodle(request.noodle)
    soup = get_soup(request.soup)
    flake = get_flake(request.flake)
    topping = get_topping(request.topping)
    return {"noodle": noodle, "soup": soup, "flake": flake, "topping": topping}

@app.get("/topping")
def get_topping(type: str = Query(..., description="Type of topping")):
    ...

@app.get("/flake")
def get_flake(type: str = Query(..., description="Type of flake")):
    ...

@app.get("/noodle")
def get_noodle(type: str = Query(..., description="Type of noodle")):
    ...

@app.get("/soup")
def get_soup(type: str = Query(..., description="Type of soup")):
    ...
```

### Micro 서비스 예시 (포트 분리, 프로세스 분리)

각 컴포넌트를 독립적인 포트와 프로세스로 분리합니다. 하나의 메인 서비스와 4개의 컴포넌트 서비스로 구성됩니다.

```python
# 메인 서비스 (port: 8000)
RAMEN_COMPONENTS = {
    "noodle": "http://127.0.0.1:8001/noodle",
    "soup":   "http://127.0.0.1:8002/soup",
    "flake":  "http://127.0.0.1:8003/flake",
    "topping":"http://127.0.0.1:8004/topping",
}

@app.post("/ramyeon")
async def get_ramen(request: RamenRequest):
    # 각 컴포넌트 서비스에 HTTP 요청
    ...
```

```python
# 컴포넌트 서비스 예시 (port: 8004 — topping)
@app.get("/topping")
def get_topping(type: str = Query(..., description="Type of topping")):
    ...
```

포트번호와 프로세스가 분리되므로, 특정 컴포넌트에 장애가 발생해도 메인 서비스나 다른 컴포넌트에 영향을 주지 않습니다.
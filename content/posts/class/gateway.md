---
title: "[4주차] API Gateway"
date: "2025-03-29"
description: "박사과정 빅데이터서비스모델링 수업 4주차 — API Gateway의 개념, 역사, VPC Link 및 Kong 설치까지"
tags: ["대학원", "API Gateway", "마이크로서비스", "Kong", "빅데이터서비스모델링"]
---

# [4주차] API Gateway

대학원 수업 / 빅데이터서비스모델링

이번 주 빅데이터서비스모델링 수업의 주제는 **API Gateway**입니다.

---

## API 접근 제어의 필요성

마이크로서비스의 FastAPI 문서를 공개하면 엔드 유저가 사용할 수 있습니다. 하지만 이를 모든 사용자에게 열어두면 **서버 과부하** 및 **원하지 않는 데이터 공개** 문제가 발생할 수 있습니다. 따라서 지정된 사용자에게만 API를 사용할 수 있도록 제한해야 합니다.

### 접근 제어 방법

**1) 지정된 위치에서만 허용 (방화벽)**

- 방화벽을 사용하는 것이 가장 간단합니다.
- 국가 단위의 API 사용 통제에는 유용합니다.
- 단, 모바일 앱의 경우 셀룰러 망의 IP를 특정하기 어려워 적용이 어렵습니다.

**2) API 인증키를 요청 규격에 포함**

- 호출 자체는 누구나 어디서나 할 수 있으나, 인증키가 올바르지 않으면 응답을 반환하지 않습니다.
- 허용된 사용자에게만 API key를 발급하고, 엔드 유저는 이를 요청 값에 포함합니다.
- 발신지 통제 없이 허용된 사용자만 접근할 수 있습니다.

### 트래픽 제어의 필요성

허용된 사용자라도 **무제한으로 API를 호출**할 수 있다면 문제가 됩니다. 소수 유저의 과도한 사용이 서버 과부하를 유발할 수 있기 때문입니다. 엔드유저와 서비스 사이에 트래픽 제어가 필요합니다.

서비스가 여러 개로 분산된 마이크로서비스 환경에서는 **각 서비스마다 인증과 트래픽 제어를 별도로 구현**해야 하는 부담이 생깁니다. 이 복잡성을 한 곳에서 관리하기 위해 등장한 것이 바로 **API Gateway**입니다.

---

## API Gateway란?

API Gateway는 사용자의 신원을 확인하고, 들어오는 트래픽을 관리하는 **중간 관리자(중개자)** 역할을 합니다.

- 모든 마이크로서비스의 위치와 기능을 파악하고 있습니다.
- 서비스에 대한 API 규격을 **단일 진입점**에서 공개합니다.
- 최종 사용자는 각 마이크로서비스를 직접 호출하는 대신 API Gateway를 통해 접근합니다.

> 이 수업의 핵심 사항: **Authentication(인증)** 과 **Dynamic Routing(동적 라우팅)**

---

## API Gateway의 역사

**2013년 — Netflix Zuul**

Netflix가 2013년 즈음 **Zuul**이라는 엣지 서비스(Edge Service)를 통해 인증, 라우팅, 필터링 기능을 구현하면서 API Gateway 개념이 주목받기 시작했습니다. 당시 "API Gateway"라는 용어를 직접 사용하지는 않았지만, 이 개념의 시초로 여겨집니다.

Zuul의 주요 역할: Authentication, Insights, Stress Testing, Canary Testing, Dynamic Routing, Load Shedding, Security, Static Response Handling, Multi-Region Resiliency

**2015년 — Kong & AWS API Gateway**

오픈소스 API Gateway인 **Kong**이 2015년 처음 공개되었습니다. 원래 Mashape라는 회사에서 개발되었으며, 이후 Kong Inc.가 독립하여 솔루션을 발전시켰습니다. 같은 해 **AWS API Gateway**도 출시되어 현재까지 AWS의 주요 서비스로 자리 잡고 있습니다. 이 시기부터 "API Gateway"라는 용어가 본격적으로 확산되었습니다.

---

## 전방 통신 구간 암호화

REST API의 암호화 통신을 위해서는 인증서 갱신, 도메인 개설 등의 절차가 필요한데, API Gateway가 이를 대신할 수 있습니다.

**클라우드 환경 (AWS)**에서는 API Gateway → 가상머신 통신 구조를 사용하지만, public access 구간에서 외부 위협에 노출될 수 있는 문제가 있습니다.

### VPC Link

VPC Link는 API Gateway와 VPC 내부 리소스 간의 통신을 외부 인터넷을 거치지 않고 직접 연결하는 방식입니다.

| 항목 | 내용 |
|---|---|
| **장점** | 외부 인터넷 미노출로 보안성 향상, VPC 내 리소스 격리, API Gateway를 통한 내부 서비스 통합 간소화 |
| **단점** | VPC Link 설정 등 네트워크 구성 복잡성 증가, 추가 네트워크 계층으로 인한 지연(latency) 발생 가능, 추가 비용 및 관리 부담 |

---

## Kong 설치 실습

Kong Gateway를 직접 설치해보려면 공식 문서를 참고하세요.

- [Kong Gateway 설치 가이드 (Ubuntu)](https://docs.konghq.com/gateway/3.9.x/install/linux/ubuntu/?install=oss)
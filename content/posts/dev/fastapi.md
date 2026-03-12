---
title: "[2주차] FastAPI를 이용한 API 서비스 만들기"
date: "2025-03-15"
description: "박사과정 빅데이터서비스모델링 수업 2주차 — FastAPI 기초 및 HTTP 메서드 정리"
tags: ["대학원", "FastAPI", "Python", "API", "빅데이터서비스모델링"]
---

# [2주차] FastAPI를 이용한 API 서비스 만들기

대학원 수업 / 빅데이터서비스모델링

현재 회사에 다니면서 저녁이나 주말 시간을 활용해 대학원(박사 과정) 수업을 수강하고 있습니다. 수업 내용을 정리할 겸 블로그에 간략하게 메모해두려 합니다. 뒤죽박죽할 수 있는 점 양해 부탁드립니다. (수업 자료 및 세부 내용은 업로드하지 않겠습니다.)

이 수업은 기본적으로 Python의 **FastAPI**를 활용하여 서비스를 만드는 수업입니다. 평소에도 자주 사용하지만 복습하는 마음으로 수강했습니다.

---

## FastAPI란?

> Python의 API를 빌드하기 위한 웹 프레임워크. 호스트 시스템에 직접 구동되는 형태(host-native)로 동작합니다.

**Framework**: 여러 기능을 가진 클래스와 라이브러리가 '특정 결과물을 구현하고자' 합쳐진 형태

---

## 설치

```bash
pip install "fastapi[standard]"  # optional 패키지 추가 설치
# 모두 설치 시: pip install "fastapi[all]"
```

---

## 간단한 예시

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")  # GET 방식으로 호출 => http://localhost:8000/
async def root():
    return {"message": "Hello World"}
```

---

## HTTP 메서드

| 메서드 | 용도 | 멱등성 | 주요 응답 코드 |
|---|---|---|---|
| GET | 자원 조회 | ✅ | 200 OK |
| POST | 자원 생성 | ❌ | 201 Created |
| DELETE | 자원 삭제 | ✅ | 200 / 404 Not Found |
| PUT | 자원 전체 교체 | ✅ | 200 / 204 / 201 |
| PATCH | 자원 부분 수정 | ❌ | 200 OK |

> **멱등성**: 연산을 여러 번 적용하더라도 결과가 달라지지 않는 성질

- **GET**: 자원의 상태를 변경시키지 않으므로 safe method라고 불리기도 합니다.
- **POST**: 서버의 상태를 변경시키며 비멱등성을 가집니다.
- **DELETE**: 반복 호출 시 결과는 동일하지만, 이미 삭제된 경우 404를 반환합니다.
- **PUT**: 자원이 없으면 새로 생성(201), 있으면 전체 교체(200/204).
- **PATCH**: 부분 업데이트 전용. 단, 모든 브라우저·서버·프레임워크에서 지원되지 않을 수 있습니다.

---

## 서버 실행

```bash
fastapi dev main.py   # 개발 모드 (127.0.0.1에서만 접근 가능)
fastapi run main.py   # 프로덕션 모드 (실제 IP 할당)
```

서버 실행 시 기본 접속 정보는 아래와 같습니다.

- **IP**: `127.0.0.1`
- **Port**: `8000`
- **Swagger 문서**: `http://127.0.0.1:8000/docs`

### dev vs run

- `dev`: 나만 접근 가능한 개발 모드. `127.0.0.1`로만 접근 가능.
- `run`: 실제 서비스 가능한 프로덕션 모드. 실제 IP가 할당됨.

실제 서비스 시에는 `0.0.0.0`이나 서버의 실제 IP에 바인딩하고, Uvicorn을 Gunicorn 같은 프로세스 매니저 및 Nginx 같은 리버스 프록시와 함께 사용하는 것이 일반적입니다.

### 포트 지정

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 공인 IP → 사설 IP

API 서버가 사설 IP(예: `192.168.x.x`, `10.x.x.x`)에서 동작 중이라면, 외부 노출을 위해 포트 포워딩, 리버스 프록시, 터널링 서비스 등 네트워크 설정이 필요합니다. `0.0.0.0`으로 열려 있다면 공인 IP를 통해 해당 API에 접근할 수 있습니다.

---

## 요청 규격 3가지

### (1) Path Parameter

API path에 요청 변수를 직접 포함하는 방식. Optional parameter 정의는 불가합니다.

```
/flights/{origin}/{destination}/{date}/{fare_class}
```

```bash
curl -X GET 'http://127.0.0.1:8000/flights/Seoul/Tokyo/2025-03-08/Business'
```

### (2) Query Parameter

path 뒤에 `?`를 붙여 요청 변수를 전달하는 방식. Optional parameter 정의가 가능합니다.

```python
from typing import Optional
from fastapi import FastAPI

app = FastAPI()

@app.get('/flights')
async def get_flights_info(
    origin: str,
    destination: str,
    date: str,
    fare_class: Optional[str] = 'Economy'
):
    return {"message": "hello world!"}
```

```bash
curl -X 'GET' "http://127.0.0.1:8000/flights?origin=Seoul&destination=Tokyo&date=2025-03-01"
```

### (3) Request Body

POST 요청 시 JSON 형태로 데이터를 전달하는 방식. `BaseModel`을 상속하여 요청 스키마를 정의합니다.

```python
from typing import Optional
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class FlightRequest(BaseModel):
    origin: str
    destination: str
    date: str
    fare_class: Optional[str] = 'Economy'

@app.post('/flights')
async def get_flights_info(request: FlightRequest):
    return {"message": "hello world!"}
```

```bash
curl -X 'POST' "http://127.0.0.1:8000/flights" \
  -H 'Content-Type: application/json' \
  -d '{"origin":"Seoul","destination":"Tokyo","date":"2025-03-01","fare_class":"Economy"}'
```

---

## 비동기 처리 (async/await)

FastAPI는 `async def`를 통해 비동기 처리를 지원합니다. 단, 모든 상황에서 비동기가 유리한 것은 아닙니다.

- **I/O bound operation** (DB 조회, 외부 API 호출 등): `async`로 처리하면 성능 향상
- **CPU bound operation** (복잡한 연산 등): 동기(sync)로 처리하는 것이 더 적합

> 참고 예시: concurrent burgers vs parallel burgers — FastAPI 공식 문서의 비동기 개념 설명 예시
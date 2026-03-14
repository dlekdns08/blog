---
title: "나만의 웹사이트 만들기 & 페이지 이사 공지"
date: "2026-03-14"
description: "직접 서버를 빌려 블로그와 API를 배포한 과정을 정리했습니다."
tags: ["devlog", "server", "deployment", "nextjs", "fastapi"]
---

안녕하세요, 이다운입니다. 🐨

오늘은 제 블로그가 새로운 보금자리로 이사한 이야기를 해볼게요.

## 왜 직접 서버를 운영하게 됐나요?

블로그와 API 서버를 운영하려면 어딘가에 올려야 하잖아요. 처음엔 AWS도 고려했는데, 월 **$250 이상**이라는 가격표를 보고 바로 포기했습니다. 알아보다 보니 **Contabo**라는 독일 회사의 VPS가 눈에 띄었어요. 8코어 / 24GB RAM / 400GB SSD 서버를 월 **$24**에 빌릴 수 있었거든요. AWS 대비 10배 이상 저렴하면서도 충분한 스펙이었습니다.

## 전체 아키텍처

제 블로그는 두 개의 레포지토리로 구성되어 있어요.

- **[blog](https://github.com/dlekdns08/blog)**: Next.js 15 (App Router) 기반 프론트엔드. 마크다운 파일로 글을 관리합니다.
- **[api](https://github.com/dlekdns08/api)**: FastAPI 기반 백엔드. SQLite DB를 사용합니다.

```
koala.ai.kr        →  Next.js (blog)   :3000
api.koala.ai.kr    →  FastAPI (api)    :8000
```

Nginx가 앞단에서 도메인별로 요청을 분기하고, Let's Encrypt로 HTTPS도 적용했어요.

## 배포 과정 요약

### 1. 서버 세팅
Contabo에서 **Cloud VPS 30** (Asia/Japan 리전) 플랜을 선택했어요. Ubuntu 24.04가 기본 설치되어 있고, 접속하자마자 Docker를 설치했습니다.

```bash
# Docker 설치 후 확인
docker --version       # Docker version 29.3.0
docker compose version # Docker Compose version v5.1.0
```

### 2. GitHub Actions Self-hosted Runner 등록
코드를 push하면 자동으로 서버에 배포되도록 **GitHub Actions Self-hosted Runner**를 설정했어요. blog와 api 각각 러너를 등록하고 systemd 서비스로 등록해서 서버 재시작 시에도 자동으로 실행되도록 했습니다.

```
/opt/runners/api/   ← api 러너
/opt/runners/blog/  ← blog 러너
```

### 3. Docker로 컨테이너화
각 레포에 `Dockerfile`과 `docker-compose.yml`을 추가했어요.

**blog Dockerfile** (멀티스테이지 빌드):
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]
```

Next.js standalone 모드를 활용해서 이미지 크기를 최소화했어요.

**api Dockerfile**:
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 4. Nginx + HTTPS 설정
도메인은 가비아에서 구매한 **koala.ai.kr**을 사용했어요. DNS A 레코드를 서버 IP로 연결하고, Certbot으로 Let's Encrypt SSL 인증서를 발급받았습니다.

```
https://koala.ai.kr       # 블로그
https://api.koala.ai.kr   # API
```

인증서는 90일마다 자동 갱신되도록 설정되어 있어요.

### 5. 자동 배포 파이프라인
이제 main 브랜치에 push하면 GitHub Actions가 자동으로 서버에 배포해줍니다.

```
코드 작성 → git push → GitHub Actions 트리거
→ Self-hosted Runner 실행 → Docker 빌드 & 배포 완료
```

## 마치며

처음엔 서버 직접 운영이 막막했는데, 하나씩 해보니 생각보다 할만 하더라고요. 무엇보다 **월 $24**에 이 모든 걸 운영할 수 있다는 게 가장 큰 장점인 것 같아요.

앞으로 이 블로그에서 개발하면서 배운 것들을 꾸준히 기록해나갈 예정입니다. 🐨

많이 놀러와주세요!
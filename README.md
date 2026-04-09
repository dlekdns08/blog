# 코알라 오딧세이

마크다운 파일로 글을 관리하는 Next.js(App Router) 기반 개인 기술 블로그입니다.

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **스타일링**: CSS Modules
- **마크다운**: gray-matter + react-markdown
- **배포**: Docker + Self-hosted

## 시작하기

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 열면 됩니다.

## 글 작성

- **글 위치**: `content/posts/*.md`
- **필수 프론트매터**: `title`, `date`
- **선택 프론트매터**: `description`, `tags`

예시:

```md
---
title: "내 첫 글"
date: "2026-03-11"
description: "간단한 소개"
tags: ["diary"]
---

본문 내용...
```

## 페이지

| 경로            | 설명         |
| --------------- | ------------ |
| `/`             | 홈 (최근 글) |
| `/posts`        | 글 목록      |
| `/posts/[slug]` | 글 상세      |
| `/about`        | 소개         |

## 빌드 & 배포

```bash
npm run build
npm run start
```

## 관련 프로젝트

- [api](https://github.com/dlekdns08/api) — 블로그 백엔드 API (댓글, 좋아요, 구독)
- [self-healing-cicd](https://github.com/dlekdns08/self-healing-cicd) — CI/CD 자가치유 시스템
- [ai-pr-agent](https://github.com/dlekdns08/ai-pr-agent) — AI 코드 리뷰 에이전트


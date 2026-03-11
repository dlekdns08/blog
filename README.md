# 이다운의 코알라 오딧세이

마크다운 파일로 글을 관리하는 Next.js(App Router) 기반 개인 블로그 템플릿입니다.

## 시작하기

개발 서버 실행:

```bash
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

- `/`: 홈(최근 글)
- `/posts`: 글 목록
- `/posts/[slug]`: 글 상세
- `/about`: 소개

## 빌드

```bash
npm run build
npm run start
```

## 참고

- Next.js 문서: https://nextjs.org/docs
# blog

---
title: "Svelte 기초"
date: "2025-04-05"
description: "Next.js에서 Svelte로 — 빠른 렌더링과 간결한 문법을 자랑하는 Svelte의 기본 사용법을 정리합니다."
tags: ["Svelte", "프론트엔드", "JavaScript", "웹개발"]
---

# Svelte 기초

저는 LLM 개발자이다 보니 모델 성능을 높이는 것뿐만 아니라 **어플리케이션 개발**에도 관심이 많습니다. 이전에는 주로 Next.js를 활용했으나 점점 복잡해지는 느낌이 있어, 최근 각광받고 있는 **Svelte**를 공부해보고자 합니다.

---

## Svelte란?

Svelte는 **빌드 시점에 코드를 순수한 JavaScript로 변환**하여 런타임 오버헤드를 줄이고 빠른 실행 속도를 자랑하는 프레임워크입니다.

- **간결한 문법** 덕분에 코드 작성이 쉽습니다.
- **번들 크기가 작아** 효율적인 리소스 관리가 가능합니다.
- AI 어플리케이션 개발에서는 Next.js의 서버 사이드 렌더링 같은 부가 기능보다, Svelte의 **빠른 렌더링과 단순한 구조**가 개발 및 유지보수에 유리할 수 있습니다.

이후 진행할 관광 활성화 토이 프로젝트에서도 Svelte를 실제로 적용해볼 계획입니다. 공식 문서는 [svelte.dev/docs](https://svelte.dev/docs)를 참고하세요.

---

## 프로젝트 시작하기

### 1. 새 프로젝트 생성

```bash
npx sv create myapp
cd myapp
npm install
npm run dev
```

### 2. REPL 활용

Svelte는 **REPL(Read-Eval-Print Loop)** 환경을 제공합니다. REPL은 코드를 입력하면 즉시 결과를 확인할 수 있는 인터랙티브 프로그래밍 환경으로, 학습·디버깅·프로토타이핑에 매우 유용합니다. 다양한 예시 템플릿도 제공합니다.

REPL에서 코드를 작성한 후 프로젝트를 다운로드하면 `svelte-app.zip`으로 받을 수 있으며, 아래와 같이 실행합니다.

```bash
cd /path/to/svelte-app
npm install
npm run dev
```

### 3. DEGIT 활용

**DEGIT**은 Git repository를 다운로드하는 도구로, `git clone`과 달리 **프로젝트의 git 히스토리를 제외하고** 깔끔한 상태로 프로젝트를 생성해줍니다.

`git clone`을 사용하면 기존 git 관련 정보가 모두 포함되어 새 저장소로 세팅하기 전에 불필요한 히스토리를 제거해야 하는 번거로움이 있습니다. DEGIT은 이 과정을 자동으로 처리해줍니다.

```bash
npx degit sveltejs/template my-svelte-project
cd my-svelte-project
npm install
npm run dev
```

위 명령어를 실행하면 `my-svelte-project` 디렉토리에 Svelte 템플릿이 깔끔하게 다운로드되어 바로 개발을 시작할 수 있습니다.

---

## 프로젝트 생성 방법 비교

| 방법 | 특징 | 추천 상황 |
|---|---|---|
| `npx sv create` | 공식 CLI로 새 프로젝트 생성 | 처음부터 새 프로젝트 시작 |
| REPL 다운로드 | 브라우저에서 작성 후 zip 다운로드 | 간단한 프로토타입 실험 |
| DEGIT | git 히스토리 없이 템플릿 복사 | 기존 템플릿 기반으로 시작 |

공식 문서를 기반으로 기본기를 다진 후, 이후 포스팅에서 실제 토이 프로젝트에 적용한 내용을 이어서 정리하겠습니다.
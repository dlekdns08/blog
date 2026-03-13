---
title: "Svelte 기초 (3) - Reactivity"
date: "2025-05-03"
description: "Svelte의 반응성(Reactivity) 개념을 $state, $derived, $effect, $: 문법을 중심으로 Next.js(React)와 비교하며 정리합니다."
tags: ["Svelte", "프론트엔드", "웹개발", "Reactivity", "튜토리얼"]
---

# Svelte 기초 (3) - Reactivity

프로그래밍/Svelte 시리즈 : 반응성(Reactivity)

오늘은 Svelte 기초 세 번째 시리즈로 **Reactivity(반응성)** 를 다뤄보겠습니다. Svelte에서는 반응성 구현을 내세우고 있는데요. 반응성이란 선언된 state의 상태에 따라 특별한 호출 없이 HTML 영역 및 관련 변수들의 상태가 빠르게 변경되는 것을 의미합니다. Svelte Playground의 내용을 바탕으로 정리해보겠습니다.

---

## 1. $state — 기본 상태 선언

```svelte
<script>
  let count = $state(0);

  function handleClick() {
    count += 1;
  }
</script>

<button onclick={handleClick}>
  Clicked {count}
  {count === 1 ? 'time' : 'times'}
</button>
```

`$state()`를 활용하여 `count`라는 상태를 선언하고, 버튼 클릭 시 1씩 올라가도록 간단하게 설정할 수 있습니다.

---

## 2. $derived — 파생 상태

```svelte
<script>
  let count = $state(1);

  let doubled = $derived(count * 2);
  let quadrupled = $derived(doubled * 2);

  function handleClick() {
    count += 1;
  }
</script>

<button onclick={handleClick}>
  Count: {count}
</button>

<p>{count} * 2 = {doubled}</p>
<p>{doubled} * 2 = {quadrupled}</p>
```

`$derived` 안에 변수를 입력하면 기본 상태(`$state`)로부터 **파생된 읽기 전용 상태(Computed State)** 를 만들어 줍니다.

| 선언 | 역할 |
|---|---|
| `let count = $state(1)` | 1부터 시작하는 읽기/쓰기 가능한 상태 생성 |
| `let doubled = $derived(count * 2)` | `count`를 구독하여 `count * 2` 값을 유지하는 읽기 전용 상태 |
| `let quadrupled = $derived(doubled * 2)` | `doubled`를 구독하여 `doubled * 2` 값을 유지하는 읽기 전용 상태 |

아래와 같이 `$:` 문법으로도 간단하게 표현할 수 있습니다.

```svelte
$: doubled = count * 2;
$: quadrupled = doubled * 2;
```

---

## 3. $effect — 반응형 효과

Svelte의 `$effect`는 컴포넌트 내부의 상태가 바뀔 때마다 자동으로 실행되는 일종의 **감시자(watcher)** 입니다.

```svelte
<script>
  let count = $state(0);

  $effect(() => {
    if (count >= 10) {
      alert(`count is dangerously high!`);
      count = 9;
    }
  });

  function handleClick() {
    count += 1;
  }
</script>

<button onclick={handleClick}>
  Clicked {count}
  {count === 1 ? 'time' : 'times'}
</button>
```

Next.js에서 `useEffect`로 처리하던 것을 이렇게 간편하게 작성할 수 있습니다.

```jsx
// Next.js (React) 방식
'use client';
import { useState, useEffect } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (count >= 10) {
      alert('count is dangerously high!');
      setCount(9);
    }
  }, [count]); // 의존성 배열에 count를 명시해야 함

  const handleClick = () => setCount(prev => prev + 1);

  return (
    <button onClick={handleClick}>
      Clicked {count} {count === 1 ? 'time' : 'times'}
    </button>
  );
}
```

또는 `$:` 문법으로 더욱 간단하게 표현할 수도 있습니다.

```svelte
<script>
  let count = 0;

  $: if (count >= 10) {
    alert('count가 너무 높아요!');
    count = 9;
  }

  function handleClick() {
    count += 1;
  }
</script>
```

---

## 4. $: vs $effect 차이점

두 방식은 동작 방식에서 중요한 차이가 있습니다.

### $: (컴파일 타임 반응형)

```svelte
$: if (count >= 10) {
  alert('count가 너무 높아요!');
  count = 9;
}
```

- **컴파일 시** 의존성 분석 — Svelte 컴파일러가 `count`를 보고 메타정보를 생성합니다.
- **동기적 실행** — 할당문이 끝난 직후 곧바로 블록이 재평가됩니다.
- **SSR 환경에서도 동작** — 브라우저 전용 API(`alert`, `window` 등)를 쓰면 빌드 시 에러가 날 수 있습니다.
- **클린업 기능 없음** — 리스너 등록 같은 작업 후 해제 메커니즘이 없어 수동 해제가 필요합니다.

### $effect (런타임 반응형)

```svelte
$effect(() => {
  if (count >= 10) {
    alert('count is dangerously high!');
    count = 9;
  }
  // 필요하면 클린업 반환 가능
  return () => {
    /* 다음 번 effect 실행 전 해제 로직 */
  };
});
```

- **런타임**에 Reactivity API 사용 — 콜백 내부에서 참조된 상태를 구독해 변화 시 재실행합니다.
- **클라이언트 전용 & 마운트 후 실행** — SSR 단계에서는 생략되고, 브라우저에서 컴포넌트 마운트 이후 실행됩니다.
- **클린업/해제 지원** — `return () => { … }` 형태로 클린업 함수를 반환하여 타이머나 이벤트 리스너를 안전하게 관리할 수 있습니다.
- **사이드 이펙트에 최적** — `alert`, 네트워크 요청, DOM 조작, 구독(subscription) 같은 작업은 `$effect` 안에 두는 것이 권장됩니다.

---

## 정리

| 구분 | `$:` | `$effect()` |
|---|---|---|
| 의존성 추적 시점 | 컴파일 타임 | 런타임 |
| 실행 방식 | 동기 | 비동기(마이크로태스크) |
| SSR 동작 | O | X (마운트 이후) |
| 클린업 지원 | X | O |
| 적합한 용도 | 파생(derived) 계산 | 사이드 이펙트, 외부 API 호출, 구독 관리 |
---
title: "Svelte Tutorial 1. 시작"
date: "2025-04-12"
description: "Svelte의 기본 문법과 컴포넌트 구조를 Next.js와 비교하며 학습합니다. 변수 선언, Dynamic Attributes, 스타일링, 컴포넌트 임포트, HTML 렌더링까지 정리합니다."
tags: ["Svelte", "프론트엔드", "웹개발", "튜토리얼", "컴포넌트"]
---

# Svelte Tutorial 1. 시작

이번주 Svelte 글은 다음 글을 참고하여 작성되었음을 알려드립니다.

> [Svelte Tutorial 0. 시작 — hippo9851](https://velog.io/@hippo9851/Svelte-Tutorial0.-%EC%8B%9C%EC%9E%91)

이 글에 튜토리얼이 아주 잘 정리되어 있어서, 따라서 한번 공부해보고자 합니다. 이분도 아마 Svelte playground에 있는 내용을 바탕으로 작성하신 것 같습니다.

---

## Svelte 컴포넌트란?

Svelte에서 하나의 App은 **1개 이상의 컴포넌트**로 구성되며, 컴포넌트는 `.svelte` 파일에 있는 재사용 가능한 HTML/CSS/JS 코드입니다.

가장 신기했던 부분은 처음부터 바로 등장했는데요. 제가 주로 써왔던 **Next.js(React 기반)** 에서는 컴포넌트 함수나 클래스 내에서 변수를 선언하고 JSX로 렌더링하는 방식을 따릅니다. HTML 문서 안에 직접 `<script>` 태그를 사용하여 변수를 선언하는 방식은 적합하지 않습니다.

그러나 **Svelte에서는** 아래 코드처럼 HTML 템플릿 내에 `<script>` 태그를 사용해 변수를 선언하고, 중괄호 표기법(`{name}`)으로 템플릿에 바인딩할 수 있도록 설계되어 있습니다. 중괄호 안에는 원하는 JS 코드를 자유롭게 삽입할 수 있습니다.

```svelte
<!-- Svelte -->
<script>
  let name = 'world'
</script>

<h1>Hello {name}</h1>
```

```jsx
// Next.js
export default function Home() {
  const name = 'world';
  return (
    <h1>Hello {name}</h1>
  );
}
```

---

## Dynamic Attributes

변수를 선언하고 이를 HTML 속성에 할당하는 **Dynamic Attributes** 도 제공합니다. 아래처럼 `img` 태그의 `src` 속성에 변수를 넣을 수 있으며, 마찬가지로 중괄호 `{}` 안에 변수명을 넣어주면 됩니다.

특히 `alt="{name} is dancing"` 처럼 큰따옴표 `""` 안에서도 `{}`를 사용할 수 있습니다. `alt` 를 생략하면 경고가 발생하는데, 이미지 로드가 오래 걸리는 사용자를 위한 배려라고 합니다.

```svelte
<script>
  let src = ".../image.gif"
  let name = "모히칸"
</script>

<img src={src} alt="{name} is dancing">
```

---

## 컴포넌트 스타일링

`<style>` 태그 안에 CSS 코드를 작성하면 해당 컴포넌트 내에서만 스타일링이 적용됩니다. 스코프가 컴포넌트 단위로 격리되어 있어 다른 컴포넌트에 영향을 주지 않습니다.

```svelte
<p>Styled!</p>

<style>
  p {
    color: purple;
    font-family: 'Comic Sans MS', cursive;
    font-size: 2em;
  }
</style>
```

---

## 컴포넌트 임포트

아래처럼 다른 `.svelte` 파일을 임포트해서 활용하는 것도 가능합니다. `./Nested.svelte` 파일에 선언된 컴포넌트를 `<Nested />` 형태로 사용할 수 있으며, `App.svelte`의 `<style>` 안에 선언된 스타일은 `Nested` 컴포넌트에는 영향을 주지 않습니다.

> **참고:** 사용자가 정의한 컴포넌트는 기존 HTML 태그와 구분하기 위해 **대문자로 시작하는 명칭**으로 정의해야 합니다. (예: `Nested`)

```svelte
<!-- Nested.svelte -->
<p>...don't affect this element</p>
```

```svelte
<!-- App.svelte -->
<script>
  import Nested from './Nested.svelte';
</script>

<p>These styles...</p>
<Nested />

<style>
  p {
    color: purple;
    font-family: 'Comic Sans MS', cursive;
    font-size: 2em;
  }
</style>
```

---

## HTML 태그 렌더링 (@html)

마지막으로, Svelte에서 HTML 태그를 포함한 문자열을 안전하게 렌더링하는 방법입니다. `<script>` 태그 내에 HTML 태그가 포함된 문자열을 저장하고, `{@html string}` 구문을 사용하면 문자열 내의 HTML 태그가 그대로 해석되어 렌더링됩니다.

예를 들어 `<strong>HTML!!!</strong>` 은 실제로 **굵은 글씨**로 표시됩니다.

```svelte
<script>
  let string = `here's some <strong>HTML!!!</strong>`;
</script>

<p>{@html string}</p>
```

---

## 정리

| 기능 | 문법 |
|---|---|
| 변수 바인딩 | `{변수명}` |
| 속성에 변수 사용 | `src={변수명}` |
| 문자열 속성 내 변수 | `alt="{변수명} 텍스트"` |
| 컴포넌트 임포트 | `import Nested from './Nested.svelte'` |
| HTML 직접 렌더링 | `{@html 변수명}` |
| 컴포넌트 스타일 격리 | `<style>` 태그 (자동 스코프) |
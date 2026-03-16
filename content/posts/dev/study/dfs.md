---
title: "[코딩 공부] DFS/BFS (1) - 자료구조 기초 상식"
date: "2025-06-29"
description: "DFS/BFS를 이해하기 위한 자료구조 기초. 스택, 큐, 재귀 함수의 개념과 팩토리얼 예제를 통해 반복문과 재귀의 차이를 정리합니다."
tags: ["Python", "코딩테스트", "알고리즘", "DFS", "BFS", "자료구조", "재귀함수"]
---

# [코딩 공부] DFS/BFS (1) - 자료구조 기초 상식

프로그래밍/코딩 공부 시리즈 : DFS/BFS

안녕하세요, 너무 오랜만에 돌아온 코알라입니다. 시험 기간이기도 했고 회사 업무가 너무 바빠서 블로그 글 작성에 너무 소홀했던 것 같습니다. 앞으로 더 열심히 글을 작성해보겠습니다.

오늘 공부한 부분은 **DFS/BFS** 입니다. 그래프를 탐색하기 위한 대표적인 두 가지 알고리즘으로, 대학교 수업에서도 가장 앞에 나오는 주제입니다.

탐색이란 많은 양의 데이터 중에서 원하는 데이터를 찾는 과정을 의미합니다. 프로그래밍에서는 주로 그래프나 트리 등의 자료 구조 안에서 탐색하는 문제를 다루게 됩니다. DFS/BFS는 가장 기초적인 알고리즘이기 때문에 이 두 알고리즘의 원리를 제대로 이해해야 코딩을 제대로 할 수 있다고 생각됩니다.

그렇다면 우선 **자료구조**에 대해 설명드리겠습니다. 자료구조란 '데이터를 표현하고 관리하고 처리하기 위한 구조'를 의미합니다.

---

## 1. 스택(Stack)과 큐(Queue)

자료구조의 핵심인 스택과 큐는 두 가지 기본 함수를 사용합니다.

- **삽입(push)**: 데이터를 삽입한다.
- **삭제(pop)**: 데이터를 삭제한다.

> **오버플로(Overflow)**: 자료구조가 수용할 수 있는 데이터 크기를 넘어섰을 때 삽입 연산을 수행하는 경우 발생합니다.
> **언더플로(Underflow)**: 데이터가 전혀 없는 상태에서 삭제 연산을 수행하는 경우 발생합니다.

### 스택(Stack)

박스 쌓기에 비유되는 구조입니다. **선입 후출(FILO)** 구조로, A → B → C → D 순서로 들어왔다면 **D → C → B → A** 순서로 나가게 됩니다.

```python
stack = []

stack.append(1)
stack.append(2)
stack.append(3)

print(stack.pop())  # 3
print(stack.pop())  # 2
```

### 큐(Queue)

스택과 반대로 **선입 선출(FIFO)** 구조입니다. A → B → C → D로 들어가면 **A → B → C → D** 순서로 나오게 됩니다. Python에서는 `deque` 라이브러리를 사용합니다.

```python
from collections import deque

queue = deque()

queue.append(1)
queue.append(2)
queue.append(3)

print(queue.popleft())  # 1
print(queue.popleft())  # 2
```

---

## 2. 재귀 함수(Recursive Function)

DFS/BFS를 구현하기 위해서는 **재귀 함수**에 대한 이해가 필요합니다. 재귀 함수란 **자기 자신을 다시 호출하는 함수**를 의미합니다.

```python
def recursive_function():
    print('재귀 함수를 호출합니다.')
    recursive_function()

recursive_function()
```

위 예시는 끝나지 않는 문제가 발생합니다. 그렇기 때문에 재귀 함수에는 반드시 **종료 조건**을 포함해야 합니다.

---

## 3. 팩토리얼 예제 — 반복문 vs 재귀

아래는 반복문과 재귀를 모두 활용한 팩토리얼 예제입니다.

```python
# 반복적으로 구현한 팩토리얼
def factorial_iterative(n):
    result = 1
    for i in range(1, n + 1):
        result = result * i
    return result

# 재귀적으로 구현한 팩토리얼
def factorial_recursive(n):
    if n <= 1:
        return 1
    return n * factorial_recursive(n - 1)
```

| 방식 | 특징 |
|---|---|
| 반복문 | 명시적인 루프로 구현, 직관적이지만 코드가 길어질 수 있음 |
| 재귀 | 종료 조건만 정의하면 나머지는 수학적 점화식처럼 표현, 코드가 간결함 |

잘 짜여진 재귀 함수는 반복문으로 짜여진 함수보다 훨씬 더 간결하게 작성할 수 있습니다. 다음 포스팅에서는 이 자료구조 기초를 바탕으로 본격적으로 **DFS와 BFS 알고리즘**을 다뤄보겠습니다.
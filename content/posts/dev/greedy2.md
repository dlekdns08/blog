---
title: "코딩 공부 - 그리디 알고리즘 문제 풀이(2)"
date: "2025-05-03"
description: "그리디 알고리즘 문제 풀이 두 번째. 숫자 카드 게임과 '1이 될 때까지' 문제를 내 풀이와 정답 풀이로 비교해봅니다."
tags: ["Python", "코딩테스트", "알고리즘", "그리디", "문제풀이"]
---

# 코딩 공부 - 그리디 알고리즘 문제 풀이(2)

프로그래밍/코딩 공부 시리즈 : 그리디 알고리즘

지난 포스팅에 이어 그리디 알고리즘 문제 풀이를 계속해보겠습니다.

---

### 문제 3) 숫자 카드 게임

**문제**

> 숫자 카드 게임은 여러 개의 숫자 카드 중에서 가장 높은 숫자가 쓰인 카드 한 장을 뽑는 게임이다. 단, 게임의 룰을 지키며 카드를 뽑아야 하고 룰은 다음과 같다.
>
> 1. 숫자가 쓰인 카드들이 N × M 형태로 놓여 있다. N은 행의 개수, M은 열의 개수를 의미한다.
> 2. 먼저 뽑고자 하는 카드가 포함되어 있는 행을 선택한다.
> 3. 선택된 행에 포함된 카드들 중 가장 숫자가 낮은 카드를 뽑아야 한다.
> 4. 따라서 처음에 행을 선택할 때, 이후 해당 행에서 가장 낮은 카드를 뽑을 것을 고려하여 최종적으로 가장 높은 숫자의 카드를 뽑을 수 있도록 전략을 세워야 한다.

**입력 조건**

- 첫째 줄에 N과 M이 공백으로 구분되어 주어진다. (1 ≤ N, M ≤ 100)
- 둘째 줄부터 N개의 줄에 걸쳐 각 카드에 적힌 숫자가 주어진다. 각 숫자는 1 이상 10,000 이하의 자연수이다.

**출력 조건**

- 첫째 줄에 게임의 룰에 맞게 선택한 카드에 적힌 숫자를 출력한다.

**(1) 내 풀이**

```python
arr1 = list(map(int, input().split()))

card_arr = []
for _ in range(arr1[0]):
    arr2 = list(map(int, input().split()))[:arr1[1]]
    card_arr.append(arr2)

min_arr = []
for arr in card_arr:
    min_arr.append(min(arr))

print(max(min_arr))
```

**(2) 정답 풀이**

```python
# min() 함수를 이용하는 방법
n, m = map(int, input().split())

result = 0
for i in range(n):
    data = list(map(int, input().split()))
    min_value = min(data)
    result = max(result, min_value)

print(result)
```

```python
# 이중 반복문을 이용하는 방법
result = 0
for i in range(n):
    data = list(map(int, input().split()))
    min_value = 10001
    for a in data:
        min_value = min(min_value, a)
    result = max(result, min_value)

print(result)
```

내 풀이와 예시 답안을 비교해보면, 1번 예시와 유사한 구조임을 알 수 있습니다. 그러나 굳이 `card_arr`, `min_arr` 두 개의 리스트를 만들며 반복문을 두 번 사용한 것이 불필요했습니다. 앞으로는 조금 더 간결하게 코드를 짜는 연습을 해야 할 것 같습니다.

---

### 문제 4) 1이 될 때까지

**문제**

> 어떠한 수 N이 1이 될 때까지 다음의 두 과정 중 하나를 반복적으로 선택하여 수행하려고 한다. 단, 두 번째 연산은 N이 K로 나누어떨어질 때만 선택할 수 있다.
>
> 1. N에서 1을 뺀다.
> 2. N을 K로 나눈다.
>
> N과 K가 주어질 때 N이 1이 될 때까지 수행해야 하는 최소 횟수를 구하시오.

**입력 조건**

- 첫째 줄에 N(2 ≤ N ≤ 100,000)과 K(2 ≤ K ≤ 100,000)가 공백으로 구분되어 주어진다. N은 항상 K보다 크거나 같다.

**출력 조건**

- 첫째 줄에 최솟값을 출력한다.

**입출력 예시**

```
입력:
17 4

출력:
3
```

**(1) 내 풀이**

이 문제를 처음 봤을 때 나누기를 우선하고, 안 된다면 빼기를 하면 된다는 생각이 들었습니다.

1. N이 K의 배수가 아니라면 배수가 될 때까지 1씩 빼기
2. N이 K의 배수라면 1이 될 때까지 K로 나누기

```python
n, m = map(int, input().split())

def FromToOne(n, m):
    count = 0
    while n != 1:
        if n % m == 0:
            n = int(n / m)
            count += 1
        else:
            n -= 1
            count += 1
    return count

print(FromToOne(n, m))
```

**(2) 정답 풀이**

```python
# 단순하게 푸는 방법
n, k = map(int, input().split())
result = 0

while n >= k:
    while n % k != 0:
        n -= 1
        result += 1
    n //= k
    result += 1

while n > 1:
    n -= 1
    result += 1

print(result)
```

```python
# 최적화된 정답 예시
n, k = map(int, input().split())
result = 0

while True:
    target = (n // k) * k
    result += (n - target)
    n = target
    if n < k:
        break
    result += 1
    n //= k

result += (n - 1)
print(result)
```

최적화된 정답 예시를 보면 반복 연산 횟수를 최대한 줄이는 것을 확인할 수 있습니다. 예를 들어 `n=10000, k=10001`이 입력됐을 때, 내 풀이는 1이 될 때까지 1을 9,999번 빼야 합니다. 반면 정답 풀이는 K가 N보다 클 경우 `n - 1`을 결과에 한 번에 더해버려 단 한 번의 연산으로 처리합니다. 반복 횟수 자체를 수식으로 계산해 건너뛰는 것이 핵심입니다.
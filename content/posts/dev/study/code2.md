---
title: "코딩 공부 - 구현(2) 왕실 나이트 및 게임 개발"
date: "2025-05-10"
description: "나동빈 님의 코딩테스트 책 구현 파트 문제 풀이. 왕실 나이트와 게임 개발 문제를 내 풀이와 정답 풀이로 비교해봅니다."
tags: ["Python", "코딩테스트", "알고리즘", "구현", "시뮬레이션", "문제풀이"]
---

# 코딩 공부 - 구현(2) 왕실 나이트 및 게임 개발

프로그래밍/코딩 공부 시리즈 : 구현

이번에는 "이것이 취업을 위한 코딩테스트다" 구현 파트의 두 가지 문제, **왕실 나이트**와 **게임 개발**을 풀이해보겠습니다.

---

## 1. 왕실 나이트

**문제**

> 행복 왕국의 왕실 정원은 체스판과 같은 8 × 8 좌표 평면이다. 나이트는 L자 형태로만 이동할 수 있으며 정원 밖으로는 나갈 수 없다. 이동 방식은 다음 두 가지이다.
>
> 1. 수평으로 두 칸 이동한 뒤 수직으로 한 칸 이동
> 2. 수직으로 두 칸 이동한 뒤 수평으로 한 칸 이동
>
> 나이트의 위치가 주어졌을 때 이동할 수 있는 경우의 수를 출력하라.

**입력 조건**

- 첫째 줄에 나이트가 위치한 좌표를 나타내는 두 문자로 구성된 문자열이 입력된다. (예: `a1`, 열은 a~h, 행은 1~8)

**출력 조건**

- 나이트가 이동할 수 있는 경우의 수를 출력한다.

**풀이 아이디어**

나이트가 이동할 수 있는 최대 경우의 수는 8가지입니다.

```
[(1,2), (1,-2), (-1,2), (-1,-2), (2,1), (2,-1), (-2,1), (-2,-1)]
```

이 8가지 이동 중 이동 후 좌표가 `(1,1) ~ (8,8)` 범위 안에 있는 경우만 세면 됩니다.

**(1) 내 풀이**

```python
alphabet_to_num = {'a': '1', 'b': '2', 'c': '3', 'd': '4',
                   'e': '5', 'f': '6', 'g': '7', 'h': '8'}
probablity = [(v, w) for v in [1, -1, 2, -2] for w in [1, -1, 2, -2]
              if v != w and v != -1 * w]

def knight(wich):
    count = 0
    for v, v2 in probablity:
        w = wich.copy()
        w[0] += v
        w[1] += v2
        if w[0] > 0 and w[0] <= 8 and w[1] > 0 and w[1] <= 8:
            count += 1
    return count

wich = list(input())
wich[0] = alphabet_to_num[wich[0]]
wich = [int(v) for v in wich]

print(knight(wich))
```

뭔가 번잡한 느낌이 없지 않아 있습니다.

**(2) 정답 풀이**

```python
input_data = input()
row = int(input_data[1])
column = int(ord(input_data[0])) - int(ord('a')) + 1

steps = [(-2, -1), (2, -1), (-2, 1), (2, 1),
         (1, 2), (1, -2), (-1, 2), (-1, -2)]

result = 0
for step in steps:
    next_row = row + step[0]
    next_column = column + step[1]
    if next_row >= 1 and next_row <= 8 and next_column >= 1 and next_column <= 8:
        result += 1

print(result)
```

방식은 거의 유사하지만 핵심 차이는 알파벳을 숫자로 변환하는 방법입니다. 정답 풀이는 내장 함수 `ord()`를 활용하여 `a`를 기준으로 상대적인 숫자 1~8로 변환합니다. 딕셔너리를 직접 만들 필요가 없어 훨씬 간결합니다.

```python
column = int(ord(input_data[0])) - int(ord('a')) + 1
# 예: 'a' → 97 - 97 + 1 = 1
#     'c' → 99 - 97 + 1 = 3
```

---

## 2. 게임 개발

**문제**

> 현민이는 게임 캐릭터가 N × M 크기의 맵 안에서 움직이는 시스템을 개발 중이다. 각 칸은 육지(0) 또는 바다(1)이며 캐릭터는 동서남북 중 한 방향을 바라본다. 다음 매뉴얼에 따라 캐릭터를 이동시킨 뒤 방문한 칸의 수를 출력하라.
>
> 1. 현재 방향 기준으로 **왼쪽 방향**부터 차례대로 갈 곳을 정한다.
> 2. 왼쪽 방향에 아직 가보지 않은 칸이 있다면 왼쪽으로 회전 후 한 칸 전진한다. 없다면 왼쪽으로 회전만 하고 1단계로 돌아간다.
> 3. 네 방향 모두 가봤거나 바다인 경우, 바라보는 방향을 유지한 채 한 칸 **뒤로** 간다. 뒤쪽이 바다라면 움직임을 멈춘다.

**입력 조건**

- 첫째 줄: 맵의 세로 N, 가로 M (3 ≤ N, M ≤ 50)
- 둘째 줄: 캐릭터의 좌표 A, B와 방향 d (0: 북, 1: 동, 2: 남, 3: 서)
- 셋째 줄~: 맵 정보 (0: 육지, 1: 바다), 맵의 외곽은 항상 바다

**출력 조건**

- 이동을 마친 후 캐릭터가 방문한 칸의 수를 출력한다.

**(1) 내 풀이**

방향 전환과 이동을 분리하여 구현했습니다. 왼쪽 회전은 `(d - 1) % 4`, 뒤로 이동은 현재 방향의 반대 방향으로 한 칸 이동하는 방식으로 처리했습니다.

```python
n, m = map(int, input().split())
a, b, d = map(int, input().split())

game_map = []
for _ in range(n):
    game_map.append(list(map(int, input().split())))

# 북 동 남 서 순서로 행/열 변화량
dr = [-1, 0, 1, 0]
dc = [0, 1, 0, -1]

visited = [[False] * m for _ in range(n)]
visited[a][b] = True
count = 1

def turn_left(d):
    return (d - 1) % 4

while True:
    turned = 0
    moved = False

    for _ in range(4):
        d = turn_left(d)
        na, nb = a + dr[d], b + dc[d]
        if 0 <= na < n and 0 <= nb < m and not visited[na][nb] and game_map[na][nb] == 0:
            visited[na][nb] = True
            a, b = na, nb
            count += 1
            moved = True
            break
        turned += 1

    if not moved:
        # 뒤로 이동 시도
        back_d = (d + 2) % 4
        na, nb = a + dr[back_d], b + dc[back_d]
        if 0 <= na < n and 0 <= nb < m and game_map[na][nb] == 0:
            a, b = na, nb
        else:
            break

print(count)
```

**(2) 정답 풀이**

```python
n, m = map(int, input().split())
a, b, direction = map(int, input().split())

d = [[0] * m for _ in range(n)]
d[a][b] = 1

array = []
for i in range(n):
    array.append(list(map(int, input().split())))

# 북 동 남 서
dx = [-1, 0, 1, 0]
dy = [0, 1, 0, -1]

def turn_left():
    global direction
    direction -= 1
    if direction == -1:
        direction = 3

count = 1
turn_time = 0

while True:
    turn_left()
    nx = a + dx[direction]
    ny = b + dy[direction]

    if d[nx][ny] == 0 and array[nx][ny] == 0:
        d[nx][ny] = 1
        a = nx
        b = ny
        count += 1
        turn_time = 0
        continue
    else:
        turn_time += 1

    if turn_time == 4:
        nx = a - dx[direction]
        ny = b - dy[direction]
        if array[nx][ny] == 0:
            a = nx
            b = ny
        else:
            break
        turn_time = 0

print(count)
```

정답 풀이는 `turn_time` 변수를 활용하여 네 방향을 모두 확인했는지를 추적하는 것이 핵심입니다. 4번 회전했는데도 이동하지 못하면 뒤로 물러나거나 멈추는 방식으로, 방향 전환과 이동을 하나의 루프에서 깔끔하게 처리합니다.
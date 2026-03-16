---
title: "[코딩 공부] DFS/BFS (3) - 문제 풀이"
date: "2025-06-29"
description: "DFS/BFS 알고리즘을 활용한 문제 풀이. 음료수 얼려 먹기(DFS)와 미로 탈출(BFS) 두 문제를 풀어봅니다."
tags: ["Python", "코딩테스트", "알고리즘", "DFS", "BFS", "문제풀이", "그래프"]
---

# [코딩 공부] DFS/BFS (3) - 문제 풀이

프로그래밍/코딩 공부 시리즈 : DFS/BFS

지난 포스팅에서 DFS/BFS 알고리즘의 원리를 살펴봤다면, 이번에는 실제 문제에 적용해보겠습니다.

---

## 1. 음료수 얼려 먹기 (DFS)

**문제**

> N × M 크기의 얼음 틀이 있다. 구멍이 뚫려 있는 부분은 0, 칸막이가 존재하는 부분은 1로 표시된다. 구멍이 뚫려 있는 부분끼리 상하좌우로 붙어 있는 경우 서로 연결되어 있는 것으로 간주한다. 이때 생성되는 총 아이스크림의 개수를 구하는 프로그램을 작성하시오.

**입력 예시**

```
00110
00011
11111
00000
```

**출력 예시**

```
3
```

**풀이 아이디어**

그래프에서 0인 칸을 시작으로 DFS를 실행하여 상하좌우로 연결된 모든 0을 1로 바꿉니다. DFS가 한 번 실행될 때마다 연결된 영역 하나가 완성되므로 `result + 1`을 해주면 됩니다.

**풀이**

```python
n, m = map(int, input().split())

graph = []
for i in range(n):
    graph.append(list(map(int, input())))

def dfs(x, y):
    if x <= -1 or x >= n or y <= -1 or y >= m:
        return False
    if graph[x][y] == 0:
        graph[x][y] = 1
        dfs(x - 1, y)
        dfs(x + 1, y)
        dfs(x, y + 1)
        dfs(x, y - 1)
        return True
    return False

result = 0
for i in range(n):
    for j in range(m):
        if dfs(i, j):
            result += 1

print(result)
```

오랜만에 문제를 풀어서인지 이해하는 데 조금 시간이 걸렸습니다. 핵심은 0인 칸을 만나면 그 주변 전체를 1로 바꾸고 `result + 1`을 해주는 단순한 구조임에도 불구하고 시간이 걸렸네요. 앞으로는 시간이 없더라도 꾸준히 문제를 풀어야 할 것 같습니다.

---

## 2. 미로 탈출 (BFS)

**문제**

> 동빈이는 N × M 크기의 직사각형 형태의 미로에 갇혀 있다. 동빈이의 위치는 (1, 1)이고 미로의 출구는 (N, M)에 위치하며 한 번에 한 칸씩 이동할 수 있다. 괴물이 있는 부분은 0, 없는 부분은 1로 표시되어 있다. 탈출하기 위해 움직여야 하는 최소 칸의 개수를 구하시오. 시작 칸과 마지막 칸을 모두 포함하여 계산한다.

**풀이 아이디어**

최단 거리를 구하는 문제이므로 BFS가 적합합니다. BFS는 인접한 노드부터 탐색하기 때문에 처음으로 도착지에 닿는 순간의 거리가 곧 최단 거리가 됩니다.

**풀이**

```python
from collections import deque

# 입력 받기
n, m = map(int, input().split())
graph = [list(map(int, input())) for _ in range(n)]

# 이동 방향 (상하좌우)
dx = [-1, 1, 0, 0]
dy = [0, 0, -1, 1]

def bfs():
    q = deque()
    q.append((0, 0))
    visited = [[False] * m for _ in range(n)]
    visited[0][0] = True

    # distance[x][y] = (0,0)에서 (x,y)까지의 최단 거리
    distance = [[0] * m for _ in range(n)]
    distance[0][0] = 1  # 시작점 포함 카운트

    while q:
        x, y = q.popleft()
        # 도착지에 다다랐으면 반환
        if x == n - 1 and y == m - 1:
            return distance[x][y]

        for i in range(4):
            nx, ny = x + dx[i], y + dy[i]
            # 경계 검사
            if not (0 <= nx < n and 0 <= ny < m):
                continue
            # 벽(0)이거나 이미 방문한 칸이면 skip
            if graph[nx][ny] == 0 or visited[nx][ny]:
                continue

            visited[nx][ny] = True
            distance[nx][ny] = distance[x][y] + 1
            q.append((nx, ny))

    # 도달 불가한 경우
    return -1

print(bfs())
```

어떻게 보면 가장 흔한 형태의 BFS 문제입니다. `distance` 배열을 활용하여 이전 칸의 거리에 1을 더해가는 방식이 핵심입니다. 도착지에 처음 닿는 순간의 `distance` 값이 곧 최단 경로가 됩니다.

---

## 두 문제 비교

| 구분 | 음료수 얼려 먹기 | 미로 탈출 |
|---|---|---|
| 알고리즘 | DFS | BFS |
| 핵심 아이디어 | 연결된 영역의 개수 세기 | 최단 거리 구하기 |
| 방문 처리 | 0을 1로 덮어쓰기 | `visited` 배열 + `distance` 배열 |
| 종료 조건 | 모든 칸 탐색 완료 | 도착지(N-1, M-1)에 처음 도달 |
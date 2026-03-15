---
title: "GraphQLite: SQLite에 그래프 데이터베이스 기능을 더하다"
date: "2026-01-19"
description: "SQLite에 Cypher 쿼리 언어와 그래프 데이터베이스 기능을 추가하는 오픈소스 확장 모듈 GraphQLite를 소개합니다. 설치부터 Python 바인딩, 내장 그래프 알고리즘까지 정리합니다."
tags: ["프로그래밍", "SQLite", "그래프데이터베이스", "Cypher", "Python", "오픈소스"]
---

# GraphQLite: SQLite에 그래프 데이터베이스 기능을 더하다

프로그래밍/코딩 공부

블로그를 시작한 지 얼마 되지 않은 것 같은데 벌써 60번째 글을 쓰게 되었습니다. 앞으로도 열심히 글을 작성하도록 하겠습니다! 이번 주제는 Geek News에 올라온 흥미로운 도구입니다. SQLite를 사용하면서 그래프 데이터를 다루고 싶다면? **GraphQLite**가 그 해답이 될 수 있습니다.

GraphQLite는 SQLite에 그래프 데이터베이스 기능을 추가하는 확장 모듈로, **Cypher 쿼리 언어**를 사용해 노드와 관계를 표현할 수 있게 해줍니다.

---

## 왜 GraphQLite인가?

일반적으로 그래프 데이터베이스를 사용하려면 Neo4j 같은 별도의 서버를 구축해야 합니다. 하지만 GraphQLite는 SQLite의 단순함을 그대로 유지하면서 그래프 쿼리 기능을 제공합니다.

- **단일 파일 데이터베이스**: 별도 설정 없음, 서버 불필요
- **SQLite의 장점을 그대로**: 가볍고 이식성이 높음
- **Cypher의 강력함 추가**: 관계형 데이터를 직관적으로 표현

로컬 개발이나 학습 목적, 또는 별도의 데이터베이스 서버 없이 그래프 쿼리가 필요한 애플리케이션에 특히 유용합니다.

---

## 설치 및 시작

소스에서 빌드하려면 `gcc`, `bison`, `flex`가 필요합니다.

```bash
make extension
```

빌드가 완료되면 SQLite에서 바로 로드할 수 있습니다.

```sql
.load build/graphqlite.dylib

-- 노드 생성
SELECT cypher('CREATE (a:Person {name: "Alice", age: 30})');
SELECT cypher('CREATE (b:Person {name: "Bob", age: 25})');

-- 관계 생성
SELECT cypher('
    MATCH (a:Person {name: "Alice"}), (b:Person {name: "Bob"})
    CREATE (a)-[:KNOWS]->(b)
');

-- 그래프 쿼리
SELECT cypher('MATCH (a:Person)-[:KNOWS]->(b) RETURN a.name, b.name');
```

---

## Python에서 사용하기

Python 바인딩이 제공되어 pip으로 간단히 설치할 수 있습니다.

```bash
pip install graphqlite
```

```python
from graphqlite import Connection

conn = Connection(":memory:")
conn.cypher("CREATE (n:Person {name: 'Alice'})")

for row in conn.cypher("MATCH (n:Person) RETURN n.name"):
    print(row[0])
```

Rust 바인딩도 제공됩니다.

---

## Cypher 지원 범위

GraphQLite는 Cypher의 상당 부분을 지원합니다.

- **패턴**: 노드 패턴, 관계, 가변 길이 경로, 양방향 매칭
- **절**: `MATCH`, `CREATE`, `MERGE`, `SET`, `DELETE`, `WITH`, `RETURN`
- **기타**: 집계 함수, 리스트 연산, `CASE` 표현식, 경로 함수

---

## 내장 그래프 알고리즘

**PageRank**와 **레이블 전파**를 통한 커뮤니티 탐지 알고리즘이 내장되어 있습니다.

```sql
-- PageRank 실행
SELECT cypher('RETURN pageRank(0.85, 20)');

-- 커뮤니티 탐지
SELECT cypher('RETURN labelPropagation(10)');

-- 특정 노드의 커뮤니티 확인
SELECT cypher('MATCH (n:Person) RETURN n.name, communityOf(n)');
```

결과는 JSON 형태로 반환되어 SQLite의 `json_each()` 함수와 함께 사용할 수 있습니다.

---

## 성능

최대 **50만 노드, 500만 엣지** 규모의 그래프에서 테스트되었습니다.

| 작업 | 소요 시간 |
|---|---|
| 단순 탐색 | 1~2ms |
| 집계 | 500ms 이하 |
| 그래프 알고리즘 | 1~5초 (반복 횟수에 따라 다름) |

---

## 마무리

GraphQLite는 SQLite의 단순함과 그래프 데이터베이스의 표현력을 결합한 흥미로운 프로젝트입니다. 소규모 그래프 데이터를 다루거나, 프로토타이핑, 학습 목적으로 활용하기 좋으며, **MIT 라이선스**로 공개되어 있어 자유롭게 사용할 수 있습니다.

저장 방식은 타입이 지정된 속성 그래프 모델을 사용하며, 일반 SQLite 테이블에 데이터를 저장하기 때문에 필요한 경우 순수 SQL로도 데이터를 조회할 수 있다는 점도 큰 장점입니다.

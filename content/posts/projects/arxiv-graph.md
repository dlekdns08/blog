---
title: 'arxiv-graph: arXiv 논문 지식 그래프 자동 구축기'
date: '2026-04-02'
description: 매일 최신 논문을 수집하고 시맨틱 유사도·공저자 관계로 지식 그래프를 구축하는 도구 설계 및 구현 기록
---

> **arxiv-graph** — Daily arXiv Paper Knowledge Graph Builder  
> 구현 기록 — 2026년 4월

---

## 왜 만들었나

논문을 읽다 보면 "이 논문이 저 논문과 어떻게 연결되어 있지?"라는 질문이 자주 생긴다.
arXiv는 매일 수백 편의 논문이 올라오지만, 논문 간의 관계는 직접 인용 외에는 드러나지 않는다.
같은 주제를 다루는 논문이라도 서로를 인용하지 않으면 연결고리를 찾기 어렵다.

**arxiv-graph**는 이 문제를 자동화로 해결하려는 시도다.
cs.CL, cs.LG, cs.AI 카테고리의 논문을 매일 수집하고, 시맨틱 유사도와 공저자 관계를 기반으로
논문 간 엣지를 생성해 지식 그래프를 구축한다.
PageRank와 최신성·인용수를 결합한 복합 점수로 논문의 영향력을 정량화한다.

---

## 전체 흐름

```
arXiv API 수집
    ↓
SQLite DB에 upsert (논문·저자)
    ↓
시맨틱 엣지 생성 (문장 임베딩 + 코사인 유사도)
공저자 엣지 생성
    ↓
PageRank 계산
    ↓
복합 중요도 점수 업데이트
```

매일 06:00 UTC에 자동으로 돌고, CLI로 언제든 단발 실행이 가능하다.

---

## 핵심 설계 결정들

### 시맨틱 유사도: 제목 + 초록 500자

논문 임베딩을 만들 때 어디까지 사용할지가 첫 번째 결정이었다.
전체 초록을 쓰면 정보가 많지만 노이즈도 커지고 느려진다.
결국 **제목 전체 + 초록 앞 500자**를 연결해서 인코딩하는 방식을 택했다.

모델은 `all-MiniLM-L6-v2` (384차원 임베딩, ~90MB).
충분히 작으면서 문장 수준 의미를 잘 잡는다.
유사도 임계값은 0.75 — 너무 낮으면 노이즈 엣지가 폭발하고, 너무 높으면 그래프가 희소해진다.

```python
# builder.py 핵심
texts = [f"{p.title} {p.abstract[:500]}" for p in papers]
embeddings = model.encode(texts, batch_size=64, show_progress_bar=True)
sims = cosine_similarity(embeddings)

for i, j in combinations(range(len(papers)), 2):
    if sims[i][j] >= SIMILARITY_THRESHOLD:
        # 양방향 엣지 생성
```

### 공저자 엣지: 가중치 누적

같은 저자가 작성한 논문 쌍에 엣지를 연결한다.
여러 저자가 겹치면 가중치가 누적된다 (기본 가중치 1.0/공저자).
연구 그룹의 연구 흐름을 추적할 수 있다.

### 복합 중요도 점수

```
score = 0.3 × recency + 0.4 × citations + 0.3 × pagerank
```

| 항목 | 계산 방식 |
| --- | --- |
| recency | 30일 반감기 지수 감쇠 |
| citations | `min(citation_count / 100, 1.0)` 정규화 |
| pagerank | networkx PageRank → [0, 1] 정규화 |

인용수 가중치(40%)가 가장 높다. 그러나 인용수 데이터는 현재 stub 상태로, Semantic Scholar나 OpenAlex API 연동이 남은 과제다.

---

## 데이터 모델

```text
Paper ──< paper_author >── Author
  │
  └── PaperRelation (source ↔ target)
        relation_type : "semantic" | "author"
        weight        : cosine similarity 또는 공저 횟수
```

**Paper**: `arxiv_id`, `title`, `abstract`, `pdf_url`, `published_at`, `importance_score`, `citation_count`, `categories`

세 테이블이 전부다. 단순하게 유지했다.

---

## 프로젝트 구조

```text
arxiv-graph/
├── src/arxiv_graph/
│   ├── cli.py               # Typer CLI (crawl / schedule / stats)
│   ├── crawler/
│   │   ├── arxiv_client.py  # arXiv API 클라이언트
│   │   └── ingester.py      # DB upsert
│   ├── graph/
│   │   ├── builder.py       # 시맨틱·공저자 엣지 생성 + PageRank
│   │   └── scorer.py        # 복합 중요도 점수
│   ├── storage/
│   │   ├── db.py            # SQLAlchemy 세션·엔진
│   │   └── models.py        # ORM 모델
│   └── scheduler/
│       ├── runner.py        # APScheduler 설정
│       └── job.py           # 일별 작업 오케스트레이션
├── data/                    # SQLite DB
└── logs/
```

---

## 사용법

```bash
# 의존성 설치 (Python 3.12 + uv 필요)
uv sync

# 단발 수집 (기본: 최근 1일, 최대 200편)
uv run arxiv-graph crawl

# 옵션 지정
uv run arxiv-graph crawl --days 3 --max 500

# 매일 06:00 UTC 자동 실행
uv run arxiv-graph schedule

# 통계 확인 (수집 현황 + 상위 10개 논문)
uv run arxiv-graph stats
```

---

## 기술 스택

| 분야 | 라이브러리 |
| --- | --- |
| CLI | typer |
| 논문 수집 | arxiv |
| 임베딩 | sentence-transformers |
| 그래프 연산 | networkx |
| 유사도 계산 | scikit-learn |
| DB ORM | sqlalchemy (SQLite) |
| 스케줄링 | apscheduler |
| 로깅 | loguru |
| 패키지 관리 | uv |

---

## 남은 과제

현재는 PoC 수준이다. 실제로 쓰려면 몇 가지가 더 필요하다.

- **인용수 연동** — `scorer.py`의 stub에 Semantic Scholar / OpenAlex API 연결
- **쿼리 인터페이스** — 지금은 stats 명령으로만 조회 가능. 키워드·날짜·저자 기반 검색 필요
- **그래프 시각화** — networkx 그래프를 D3.js 등으로 시각화
- **카테고리 확장** — 현재 cs.CL, cs.LG, cs.AI. stat.ML, eess.AS 등 추가 가능
- **테스트 작성** — pytest가 설치되어 있지만 테스트가 없다

---

## 소감

가장 재미있었던 부분은 PageRank를 실제 논문 그래프에 적용했을 때다.
인용 수가 적더라도 의미적으로 많은 논문과 연결된 논문이 높은 점수를 받는다.
"많이 인용된 논문"과 "많이 연결된 논문"이 반드시 일치하지 않는다는 걸 데이터로 볼 수 있다.

인용수 stub을 실제 API로 교체하고 시각화까지 붙이면 꽤 쓸만한 논문 탐색 도구가 될 것 같다.

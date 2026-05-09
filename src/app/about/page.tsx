import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Card } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const metadata: Metadata = {
  title: "소개",
  description:
    "이다운(Lee Dawoon) — AI/LLM Engineer · Ph.D. Candidate. LLM·AI Agent·RAG·MLOps·추론 최적화를 다루며 24+개의 프로젝트와 80여 편의 논문 리뷰 운영.",
};

// ── 작은 프레젠테이션 헬퍼 ─────────────────────────────

function TechBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-line text-body">
      {label}
    </span>
  );
}

function ProjectCard({
  number,
  title,
  period,
  role,
  badge,
  children,
  tags,
}: {
  number?: string;
  title: string;
  period?: string;
  role?: string;
  badge?: string;
  children: React.ReactNode;
  tags?: string[];
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <div className="flex-1 min-w-0">
          {number && (
            <p className="text-[10px] text-subtle font-mono mb-0.5">{number}</p>
          )}
          <h3 className="font-semibold text-base text-body leading-tight">
            {title}
          </h3>
        </div>
        {badge && (
          <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-500/15 text-accent">
            ★ {badge}
          </span>
        )}
      </div>
      {(period || role) && (
        <p className="text-xs text-muted mb-3">
          {period}
          {period && role && " · "}
          {role && <span className="font-medium">{role}</span>}
        </p>
      )}
      <div className="text-sm text-body space-y-2 leading-relaxed">
        {children}
      </div>
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {tags.map((t) => (
            <TechBadge key={t} label={t} />
          ))}
        </div>
      )}
    </Card>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-5 space-y-1 marker:text-subtle">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}

function StackTable({
  rows,
}: {
  rows: { label: string; value: string }[];
}) {
  return (
    <Card className="p-0 overflow-hidden">
      <table className="w-full text-sm">
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={r.label}
              className={
                i < rows.length - 1 ? "border-b border-line" : undefined
              }
            >
              <td className="px-4 py-2.5 font-medium text-body w-32 sm:w-40 align-top">
                {r.label}
              </td>
              <td className="px-4 py-2.5 text-muted">{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

// ── 데이터 ─────────────────────────────────────────────

const STRENGTHS: { title: string; description: string }[] = [
  {
    title: "학계 + 산업계 양쪽 경험",
    description: "공공 R&D 5건 + 대학원 자체 연구 3건 + 기업 실무 5건의 균형",
  },
  {
    title: "End-to-End 책임 경험",
    description:
      "요구사항 정의 → 모델 선정 → 분산 학습 → 평가 자동화 → K8s 배포 → 고객사 납품/현장 지원",
  },
  {
    title: "대안 가속기 검증 능력",
    description:
      "Intel Gaudi(HPU), AMD ROCm까지 직접 도입·벤치마크하여 NVIDIA 의존성 완화",
  },
  {
    title: "최신 표준 프로토콜 활용",
    description: "MCP·A2A 같은 최신 에이전트 통신 프로토콜을 실서비스에 도입",
  },
  {
    title: "지속적인 기술 기록",
    description:
      "자체 인프라 블로그 koala.ai.kr에 80여 편의 논문 리뷰와 PoC 결과 공개",
  },
];

const RD_PROJECTS = [
  {
    number: "01",
    title: "Text-to-Table을 활용한 120다산 콜센터 RPA 방안 연구",
    period: "2022.09 ~ 2022.12 · 다산120콜재단 산학협력",
    role: "연구원",
    badge: "2022 동계 자료분석학회 포스터",
    body: "연간 수백만 건 규모의 민원 상담 로그에서 비정형 텍스트를 정형 테이블로 변환. Transformer 기반 정보 추출 + DeepSpeed 분산 학습 + RPA 자동화 영역 도출.",
    tags: ["Python", "Transformer", "DeepSpeed", "HuggingFace", "Pandas", "RPA"],
  },
  {
    number: "02",
    title: "경기문화재단 민원 분석 프로젝트",
    period: "2022.10 ~ 2022.12",
    role: "연구원",
    body: "민원 데이터 전처리 + 토픽 군집화 + Apriori/FP-Growth 연관규칙 마이닝으로 민원 유형 간 상관관계 분석. NLP 파이프라인 + 시각화 리포트.",
    tags: ["Python", "Transformer", "Association Rule", "DeepSpeed"],
  },
  {
    number: "03",
    title: "환자안전 보고학습시스템 약물 관련 텍스트 자료 분석",
    period: "2022.10 ~ 2023.01 · 의료기관평가인증원",
    role: "연구원",
    body: "의료기관 약물 안전사고 보고서에서 약물명·부작용·사고유형 NER + 사고 심각도 분류. 약물-부작용 공출현 분석으로 고위험 약물 식별.",
    tags: ["Text Mining", "NER", "Transformer", "DeepSpeed", "의료 도메인"],
  },
  {
    number: "04",
    title: "AOP 기반 ITS/IATA 분자 표현학습 모델",
    period: "2023.04 ~ 2024.07 · 환경부 R&D",
    role: "연구원",
    badge: "환경독성보건학회/한국통계학회 발표 2회",
    body: "생활화학제품 성분·독성 데이터를 대규모 웹 크롤링하고 SMILES 기반 분자 표현학습 모델(GROVER/GROBI)을 파인튜닝하여 AOP 경로별 독성 예측 AI 개발. 컴퓨터과학 + 화학정보학 융합 연구.",
    tags: ["PyTorch", "GROVER", "GROBI", "RDKit", "Web Scraping", "AOP"],
  },
  {
    number: "05",
    title: "교육콘텐츠 분석을 위한 Instruction-tuned LLM 개발",
    period: "2023.04 ~ 2024.07 · 연세대학교 / 북아이피스",
    role: "연구원",
    body: "교육콘텐츠 도메인 특화 Instruction 데이터셋 구축 + LLM Instruction Tuning + 멀티 GPU 분산 학습 환경 운영.",
    tags: ["Instruction Tuning", "LoRA", "QLoRA", "DeepSpeed"],
  },
];

const ENTERPRISE_PROJECTS = [
  {
    number: "01",
    title: "LLMOps 플랫폼 개발 (사내 XGEN 출시 기여)",
    period: "2025.04 ~ 현재 · 진행 중",
    role: "Core Engineer",
    badge: "회사 핵심 프로덕트",
    body: (
      <>
        회사가 자사 LLMOps 플랫폼을 갖추기 위해 진행한 회사 핵심 프로젝트로, 출시에
        직접 기여. 금융사·방산·커머스 등 다양한 산업군 고객사에 납품 가능한 수준의
        통합 LLM 운영 플랫폼.
        <Bullets
          items={[
            "모델 평가 자동화 — lm-eval 기반 벤치마크 자동화 파이프라인",
            "vLLM 서빙 최적화 — 처리량 튜닝, 배치 크기·KV cache 최적화",
            "Intel HPU 마이그레이션 및 검증 — vllm-fork 기반 NVIDIA → Gaudi 2/3 포팅, FP8 양자화",
            "대용량 데이터 MLOps — Kafka·Spark·Hadoop 기반 데이터 파이프라인",
            "Svelte 관리자 UI 개발",
            "World IT Show 2025 부스 시연 연사 + 기업 LLMOps 세미나 연사",
          ]}
        />
      </>
    ),
    tags: [
      "vLLM",
      "lm-eval",
      "NeMo",
      "Intel HPU",
      "Svelte",
      "Kafka",
      "Spark",
      "Minio",
      "Redis",
    ],
  },
  {
    number: "02",
    title: "E-commerce 챗봇 솔루션 개발",
    period: "2024.09 ~ 2025.12",
    role: "Backend / AI Engineer",
    body: (
      <>
        Normal RAG / Graph RAG / Light RAG 멀티모달 RAG 아키텍처를 모두 설계·비교.
        LangGraph 기반 상태 관리로 다중 단계 추론 안정화.
        <Bullets
          items={[
            "3가지 RAG 아키텍처 비교 (정확도·응답 속도·비용 trade-off)",
            "LangGraph 상태 그래프로 다중 도구 호출 워크플로우",
            "Next.js + Flask 풀스택 개발",
            "Docker / Kubernetes 오케스트레이션 + ArgoCD GitOps 자동 배포",
          ]}
        />
      </>
    ),
    tags: [
      "LangChain",
      "LangGraph",
      "Next.js",
      "PostgreSQL",
      "Flask",
      "Kubernetes",
      "ArgoCD",
    ],
  },
  {
    number: "03",
    title: "이커머스 도메인 적합 LLM 개발 (SFT/DPO)",
    period: "2024.07 ~ 현재 · 진행 중",
    role: "LLM Trainer",
    body: (
      <>
        SFT/DPO PoC를 통해 도메인 특화 LLM의 본질적 어려움을 직접 경험. 이커머스
        성능을 올리면서도 범용 성능 저하를 막는 균형점을 탐구.
        <Bullets
          items={[
            "SFT·DPO 방법론 PoC — 두 가지 학습 기법 효과 비교",
            "선호도 데이터셋 구축 및 품질 관리 (chosen/rejected)",
            "H100 8-way 클러스터 운영 + NeMo 분산 학습",
            "K8s GPU 리소스 스케줄링",
          ]}
        />
      </>
    ),
    tags: ["SFT", "DPO", "DeepSpeed", "NeMo", "H100 8-way", "PyTorch"],
  },
  {
    number: "04",
    title: "롯데 홈쇼핑 LLMOps 플랫폼 구축 프로젝트",
    period: "2025.09 ~ 현재 · 진행 중",
    role: "Solution Engineer",
    badge: "대형 고객사 납품",
    body: (
      <>
        국내 대형 홈쇼핑사 LLMOps 플랫폼 구축 + 도메인 특화 워크플로우. 상품 온톨로지
        · 방송 음성 STT · 실시간 방송 심의까지 종합 솔루션.
        <Bullets
          items={[
            "상품 온톨로지 + RAG QA 자동화 워크플로우",
            "방송 음성 STT 엔진 개발/튜닝",
            "실시간 방송 심의 워크플로우 (금칙어·과대광고 탐지)",
            "Jenkins · ArgoCD 배포 자동화",
          ]}
        />
      </>
    ),
    tags: ["RAG", "Ontology", "STT", "방송 심의", "Jenkins", "ArgoCD"],
  },
  {
    number: "05",
    title: "개발 생산성 향상 도구 개발 및 고도화 (사내 TF)",
    period: "2025.01 ~ 현재 · 진행 중",
    role: "Tech Lead",
    badge: "4개 고객사 납품 + 현장 기술 지원",
    body: (
      <>
        RAG 정확도 고도화부터 MCP·A2A 같은 최신 에이전트 통신 프로토콜을 실서비스에
        도입. 4개 고객사 납품 + 현장 기술 지원.
        <Bullets
          items={[
            "OCR 및 복잡 문서 파싱 개선 (RAG 정확도 고도화 기반)",
            "OpenSearch 인덱스 + Sparse·Dense 하이브리드 검색",
            "MCP·A2A 프로토콜 멀티 에이전트 시스템 통합",
            "Next.js + FastAPI + WebSocket 풀스택 개발",
          ]}
        />
      </>
    ),
    tags: [
      "LangChain",
      "OpenSearch",
      "MCP",
      "A2A",
      "FastAPI",
      "Next.js",
      "WebSocket",
    ],
  },
];

const RESEARCH_PROJECTS = [
  {
    number: "06",
    title: "교통 네트워크 자료에 대한 거대언어모형의 프롬프트 설계 방안 및 고찰",
    period: "2023.04 ~ 2024.07",
    badge: "2023 하계 자료분석학회 논문 발표",
    body:
      "교통 네트워크 OD 데이터에 대한 LLM 이해도 평가 + 도메인 특화 Fine-tuning 데이터셋 설계. Zero-shot/Few-shot/CoT 비교 실험으로 정형 시계열 도메인에서 LLM의 한계와 프롬프트 엔지니어링의 효과를 정량 분석.",
    tags: ["Transformer", "Fine-tuning", "Prompt Engineering", "CoT"],
  },
  {
    number: "07",
    title: "Hyperspectral data 분석을 통한 부소산성 인근 위해 식물군 확인",
    period: "2023.11 ~ 2024.07",
    body:
      "드론 촬영 하이퍼스펙트럴 이미지 전처리 + 픽셀 단위 스펙트럼 특징 추출 + CNN 기반 식물 종 분류 및 세그멘테이션. 문화재 인근 위해 외래식물 분포 지도 생성.",
    tags: ["PyTorch", "OpenCV", "Computer Vision", "CNN", "Drone"],
  },
];

const PERSONAL_PROJECTS = [
  {
    number: "23",
    title: "개인 블로그 koala.ai.kr 자체 운영",
    period: "2026.02 ~ 현재",
    role: "Solo 인프라/개발 운영자",
    body: (
      <>
        월 $24의 Contabo VPS에 직접 인프라 구축 (8코어/24GB RAM/400GB SSD). AWS
        동급 대비 약 1/10 비용으로 풀스택 인프라 운영.
        <Bullets
          items={[
            "Next.js 15 + FastAPI + SQLite + Docker Compose",
            "Nginx + Let's Encrypt SSL 자동 갱신",
            "GitHub Actions Self-hosted Runner CI/CD",
            "Grafana + Prometheus + cAdvisor 모니터링 직접 구축",
            "Neo4j 기반 포스트 지식 그래프 시각화",
            "80여 편의 논문 리뷰 + Anthropic SDK 기반 ChatWidget",
          ]}
        />
      </>
    ),
    tags: [
      "Next.js 15",
      "FastAPI",
      "Docker",
      "Nginx",
      "Grafana",
      "Prometheus",
      "Neo4j",
    ],
  },
  {
    number: "24",
    title: "Autonoma — 자기조직화 에이전트 스웜 플랫폼",
    period: "2026.04 ~ 현재 · 3D VTuber 시각화",
    role: "Solo Developer / Architect",
    body: (
      <>
        에이전트 군집의 자율 협업 과정을 라이브 캐스트로 관전. Director 에이전트가
        목표를 분해하고 전문 에이전트를 스폰·라우팅.
        <Bullets
          items={[
            "Observe-Decide-Act 루프 + 7가지 액션",
            "Harness 정책 엔진 — 라우팅·루프 제한·안전 레벨 제어",
            "Bubblewrap 샌드박스 — CPU/시간/메모리 격리",
            "VRM + Three.js 실시간 캐릭터 렌더링 + 5모음 립싱크",
            "OmniVoice 제로샷 음성 클로닝 TTS",
            "터미널 TUI / 2D 픽셀 HUD / 3D VTuber / OBS 크로마키 4가지 시청 모드",
          ]}
        />
      </>
    ),
    tags: [
      "Python",
      "FastAPI",
      "WebSocket",
      "Three.js / VRM",
      "OmniVoice TTS",
      "Bubblewrap",
    ],
  },
  {
    number: "25",
    title: "arxiv-graph — arXiv 논문 지식 그래프 자동 구축기",
    period: "2026.04",
    role: "Solo Developer",
    body: (
      <>
        매일 cs.CL/cs.LG/cs.AI 카테고리 arXiv 논문 수집 + 시맨틱 유사도 + 공저자
        관계로 지식 그래프 자동 구축. PageRank + 최신성 + 인용수 복합 점수로 영향력
        정량화.
        <Bullets
          items={[
            "all-MiniLM-L6-v2 임베딩 (384차원, ~90MB)",
            "코사인 유사도 0.75 임계값 + 공저자 가중치",
            "복합 점수 = 0.3 × recency + 0.4 × citations + 0.3 × pagerank",
            "APScheduler 매일 06:00 UTC 자동 실행",
          ]}
        />
      </>
    ),
    tags: [
      "Python 3.12",
      "sentence-transformers",
      "networkx",
      "scikit-learn",
      "APScheduler",
    ],
  },
  {
    number: "26",
    title: "UASEF — 의료 LLM 에이전트 안전 에스컬레이션 프레임워크",
    period: "2026.03 ~ 현재 · 논문 PoC",
    role: "Solo Researcher",
    body: (
      <>
        LLM 에이전트가 스스로 판단하기에 너무 불확실한 순간을 통계적으로 보장된
        방식으로 감지하고 인간 전문가에게 에스컬레이션. Conformal Prediction 기반
        3개 모듈.
        <Bullets
          items={[
            "UQM — Conformal Prediction 비적합 점수 (logprob/self-consistency)",
            "RTC — 전문과목별 위험 온톨로지 임계값 동적 조정",
            "EDE — 3가지 트리거 (불확실성·고위험 행동·근거 부재) 결합",
            "Weighted CP (Tibshirani 2019) + MIMIC-III calibration",
            "Pareto Sweep + 자동 α 권고 (specialty별 최적값 추천)",
          ]}
        />
      </>
    ),
    tags: [
      "Conformal Prediction",
      "LangGraph",
      "Weighted CP",
      "MedQA",
      "MIMIC-III",
    ],
  },
];

const AWARDS = [
  {
    year: "2025",
    activity: "UBAI 연구역량 강화 프로그램 우수상",
    detail: "관광 활성화를 위한 거대 언어 모델 및 RAG 파이프라인 구축 연구",
  },
  {
    year: "2023",
    activity: "하계 자료분석학회 논문 발표",
    detail: "교통 네트워크 자료에 대한 거대언어모형의 프롬프트 설계",
  },
  {
    year: "2023",
    activity: "환경독성보건학회 / 한국통계학회 발표 (2회)",
    detail: "AOP 기반 ITS/IATA 분자 표현학습 모델",
  },
  {
    year: "2022",
    activity: "동계 자료분석학회 학술발표대회 포스터",
    detail: "Text-to-Table 활용 120다산 콜센터 RPA 방안 연구",
  },
];

const TALKS = [
  {
    year: "2025.04",
    event: "World IT Show 2025 부스 연사",
    topic: "엔터프라이즈 챗봇 및 코드 어시스턴트 솔루션의 아키텍처와 적용 사례",
  },
  {
    year: "2025.11",
    event: "기업 대상 LLMOps 세미나 연사",
    topic: "LLMOps 플랫폼 구축 전략과 실제 운영 사례",
  },
];

const STACK_AI = [
  { label: "언어 모델", value: "Transformer · BERT · GPT · Llama · Qwen · Gemma · EXAONE" },
  { label: "학습 기법", value: "SFT · DPO · LoRA / QLoRA · Instruction Tuning" },
  { label: "분산 학습", value: "DeepSpeed · NeMo · H100 8-way 클러스터" },
  { label: "추론 최적화", value: "vLLM · vLLM-fork(HPU) · llama.cpp · Ollama" },
  { label: "RAG / Agent", value: "LangChain · LangGraph · MCP · A2A" },
  { label: "RAG 변형", value: "Vector / Graph / Light / Ensemble RAG" },
  { label: "평가", value: "lm-eval · MMLU · BLEU · A/B 테스트" },
  { label: "도메인", value: "NLP · Vision · Hyperspectral · STT · NER · 의료" },
];

const STACK_INFRA = [
  { label: "컨테이너", value: "Docker · Docker Compose" },
  { label: "오케스트레이션", value: "Kubernetes · Kubeflow · ArgoCD" },
  { label: "CI/CD", value: "Jenkins · GitHub Actions · GitOps" },
  { label: "데이터/검색", value: "PostgreSQL · MongoDB · MySQL · OpenSearch" },
  { label: "벡터/그래프", value: "FAISS · Vector DB · Neo4j" },
  { label: "메시징/스트림", value: "Kafka · Spark · Hadoop" },
  { label: "스토리지/캐시", value: "Minio · Redis" },
  { label: "모니터링", value: "Grafana · Prometheus · cAdvisor" },
];

const STACK_HW = [
  { label: "NVIDIA", value: "H100 · A100 · RTX 3090 · T4 (CUDA)" },
  { label: "Intel", value: "Gaudi 2 · Gaudi 3 (Habana SDK · HPU)" },
  { label: "AMD", value: "ROCm 스택 (GPU + NPU 하이브리드)" },
  { label: "양자화", value: "FP8 (INC) · GGUF · Calibration" },
];

const STACK_WEB = [
  { label: "프론트엔드", value: "Next.js · Svelte · Three.js · VRM" },
  { label: "백엔드", value: "FastAPI · Flask · WebSocket" },
  { label: "음성/멀티모달", value: "STT · OmniVoice TTS · Blendshape" },
  { label: "샌드박싱", value: "Bubblewrap · Anthropic Sandbox Runtime" },
];

// ── 페이지 ─────────────────────────────────────────────

export default function AboutPage() {
  return (
    <main className="py-12 scroll-smooth [&_section]:scroll-mt-16">
      <Container>
        {/* Hero */}
        <header className="text-center pb-8 mb-10 border-b border-line">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-accent mb-2">
            Research &amp; Project Portfolio
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            이다운 <span className="text-muted font-normal">Lee Dawoon</span>
          </h1>
          <p className="text-sm text-muted mb-1">
            AI / LLM Engineer · Ph.D. Candidate (재학중)
          </p>
          <p className="text-xs text-subtle">
            LLM · AI Agent · RAG · MLOps · Inference Optimization
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            <MetricCard label="Projects" value="24+" />
            <MetricCard label="박사" value="재학중" />
            <MetricCard label="기업 납품" value="5+" />
            <MetricCard label="논문 리뷰" value="80+" />
          </div>
        </header>

        {/* Quick nav */}
        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted mb-12">
          {[
            ["#about", "About"],
            ["#strengths", "강점"],
            ["#featured", "대표 연구"],
            ["#enterprise", "기업 실무"],
            ["#research", "대학원 연구"],
            ["#public-rd", "공공 R&D"],
            ["#personal", "개인 프로젝트"],
            ["#hardware", "하드웨어"],
            ["#presentations", "발표/수상"],
            ["#stack", "기술 스택"],
          ].map(([href, label]) => (
            <Link key={href} href={href} className="hover:text-accent transition-colors">
              {label}
            </Link>
          ))}
        </nav>

        {/* About Me */}
        <section id="about" className="mb-14">
          <SectionHeader>SECTION · 01 — About Me</SectionHeader>
          <div className="space-y-4 text-sm leading-7 text-body">
            <p>
              LLM 및 AI 에이전트 시스템을 연구·개발하는 AI 엔지니어입니다. 현재{" "}
              <strong>서울시립대학교 박사과정</strong>에 재학중이며, 자연어처리 ·
              이미지 핸들링 · 서비스 모델링을 연구하고 있습니다. 회사에서는 사내
              LLMOps 플랫폼 <strong>XGEN 출시에 기여</strong>했고, 학부 시절부터
              5건의 공공기관 연계 R&D 프로젝트에 참여해 도메인 특화 NLP·Vision
              모델을 다뤘으며, 현재는 5건의 기업 실무 프로젝트를 통해 RAG ·
              LLMOps · 하드웨어 가속기 검증까지 End-to-End로 수행하고 있습니다.
            </p>
            <Card className="p-4 bg-violet-50/50 dark:bg-violet-500/5 border-l-4 border-l-accent">
              <p className="text-xs text-subtle font-semibold uppercase tracking-widest mb-1.5">
                연구 철학
              </p>
              <p className="text-sm text-body italic leading-relaxed">
                &ldquo;모델만 잘 만드는 것이 아니라, 실제 도메인 데이터에서 LLM이
                얼마나 신뢰성 있게 작동하는가를 정량적으로 측정하고, 프롬프트 ·
                RAG · 파인튜닝 중 어떤 방법이 가장 효과적인지 비교 검증하는 데
                집중해 왔습니다.&rdquo;
              </p>
            </Card>
          </div>
        </section>

        {/* Strengths */}
        <section id="strengths" className="mb-14">
          <SectionHeader>핵심 강점 5가지</SectionHeader>
          <div className="grid sm:grid-cols-2 gap-3">
            {STRENGTHS.map((s, i) => (
              <Card key={s.title} className="p-4">
                <div className="flex items-start gap-3">
                  <span className="size-7 shrink-0 rounded-lg bg-violet-100 dark:bg-violet-500/15 text-accent flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-sm text-body mb-1">
                      {s.title}
                    </p>
                    <p className="text-xs text-muted leading-relaxed">
                      {s.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Featured Project — UBAI */}
        <section id="featured" className="mb-14">
          <SectionHeader>SECTION · 02 — 대표 프로젝트</SectionHeader>
          <Card className="p-6 border-l-4 border-l-accent">
            <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-accent mb-1">
                  ★ UBAI 우수상 수상 · 2025
                </p>
                <h3 className="text-lg font-bold text-body">
                  관광 활성화를 위한 거대 언어 모델 및 RAG 파이프라인 구축 연구
                </h3>
              </div>
            </div>
            <p className="text-xs text-muted mb-4">
              서울시립대학교 대학원생 연구역량 강화 프로그램 · 2025.02 ~ 2025.07 ·{" "}
              <span className="font-medium">Lead Researcher (개인 연구)</span>
            </p>

            <div className="space-y-4 text-sm text-body leading-relaxed">
              <p>
                일본인 관광객이 현장에서 직접 활용할 수 있는{" "}
                <strong>온디바이스 환경의 다국어 관광 안내 AI</strong>가 목표.
                4B 이하 소형 모델로 한국어 문서를 정확히 일본어로 답변하는 시스템
                구현 + 4가지 RAG 변형(Vector/Graph/Light/Ensemble) 직접 설계·비교.
              </p>

              <div>
                <p className="text-xs font-semibold text-subtle uppercase tracking-widest mb-2">
                  RAG 정량 평가 결과
                </p>
                <Card className="p-0 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-violet-50 dark:bg-violet-500/10">
                      <tr>
                        <th className="text-left px-3 py-2 font-semibold">시스템</th>
                        <th className="text-right px-3 py-2 font-semibold">관련성</th>
                        <th className="text-right px-3 py-2 font-semibold">충실도</th>
                        <th className="text-right px-3 py-2 font-semibold hidden sm:table-cell">응답시간</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-line bg-violet-50/30 dark:bg-violet-500/5 font-semibold">
                        <td className="px-3 py-2 text-accent">EnsembleRAG ✓</td>
                        <td className="px-3 py-2 text-right tabular-nums">62.2%</td>
                        <td className="px-3 py-2 text-right tabular-nums">43.4%</td>
                        <td className="px-3 py-2 text-right tabular-nums hidden sm:table-cell">9.1초</td>
                      </tr>
                      <tr className="border-t border-line">
                        <td className="px-3 py-2">LightRAG</td>
                        <td className="px-3 py-2 text-right tabular-nums">58.0%</td>
                        <td className="px-3 py-2 text-right tabular-nums">44.6%</td>
                        <td className="px-3 py-2 text-right tabular-nums hidden sm:table-cell">~9.2초</td>
                      </tr>
                      <tr className="border-t border-line">
                        <td className="px-3 py-2">GraphRAG</td>
                        <td className="px-3 py-2 text-right tabular-nums">57.0%</td>
                        <td className="px-3 py-2 text-right tabular-nums">44.6%</td>
                        <td className="px-3 py-2 text-right tabular-nums hidden sm:table-cell">~9.2초</td>
                      </tr>
                      <tr className="border-t border-line">
                        <td className="px-3 py-2">VectorRAG</td>
                        <td className="px-3 py-2 text-right tabular-nums">57.8%</td>
                        <td className="px-3 py-2 text-right tabular-nums">42.0%</td>
                        <td className="px-3 py-2 text-right tabular-nums hidden sm:table-cell">~9.2초</td>
                      </tr>
                    </tbody>
                  </table>
                </Card>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <MetricCard label="단일 시스템 대비" value="+4.4%p" />
                <MetricCard label="온디바이스 메모리" value="36GB" />
                <MetricCard label="평균 응답" value="9.1s" />
                <MetricCard label="오류율" value="0%" />
              </div>

              <div className="flex flex-wrap gap-1 pt-2">
                {[
                  "Qwen3-4B",
                  "vLLM",
                  "LangChain",
                  "FAISS",
                  "Vector RAG",
                  "Graph RAG",
                  "Light RAG",
                  "Ensemble RAG",
                  "On-device",
                ].map((t) => (
                  <TechBadge key={t} label={t} />
                ))}
              </div>
            </div>
          </Card>
        </section>

        {/* Enterprise */}
        <section id="enterprise" className="mb-14">
          <SectionHeader>SECTION · 03 — 기업 실무 프로젝트 (5건)</SectionHeader>
          <div className="grid md:grid-cols-2 gap-3">
            {ENTERPRISE_PROJECTS.map((p) => (
              <ProjectCard
                key={p.number}
                number={p.number}
                title={p.title}
                period={p.period}
                role={p.role}
                badge={p.badge}
                tags={p.tags}
              >
                {p.body}
              </ProjectCard>
            ))}
          </div>
        </section>

        {/* Grad school research */}
        <section id="research" className="mb-14">
          <SectionHeader>SECTION · 04 — 대학원 자체 연구 (박사과정)</SectionHeader>
          <p className="text-xs text-muted mb-3">
            대표 프로젝트(관광 RAG)는 위 SECTION 02 참조.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {RESEARCH_PROJECTS.map((p) => (
              <ProjectCard
                key={p.number}
                number={p.number}
                title={p.title}
                period={p.period}
                badge={p.badge}
                tags={p.tags}
              >
                {p.body}
              </ProjectCard>
            ))}
          </div>
        </section>

        {/* Public R&D */}
        <section id="public-rd" className="mb-14">
          <SectionHeader>SECTION · 05 — 공공기관 연계 R&amp;D 프로젝트 (5건)</SectionHeader>
          <div className="grid md:grid-cols-2 gap-3">
            {RD_PROJECTS.map((p) => (
              <ProjectCard
                key={p.number}
                number={p.number}
                title={p.title}
                period={p.period}
                role={p.role}
                badge={p.badge}
                tags={p.tags}
              >
                {p.body}
              </ProjectCard>
            ))}
          </div>
        </section>

        {/* Hardware accelerator */}
        <section id="hardware" className="mb-14">
          <SectionHeader>SECTION · 06 — 하드웨어 가속기 기술 검증</SectionHeader>
          <p className="text-xs text-muted mb-3">
            NVIDIA 의존성을 줄이기 위해 Intel Gaudi(HPU)와 AMD ROCm을 직접 도입·검증.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            <ProjectCard
              number="19"
              title="Intel Gaudi 2 / Gaudi 3 HPU 기술 검증"
              period="2025.04 ~ 2025.11"
              role="HW 검증 담당"
              tags={[
                "Habana SDK",
                "vLLM-fork",
                "FP8 Quantization",
                "optimum-habana",
              ]}
            >
              <Bullets
                items={[
                  "vault.habana.ai 기반 Docker 환경 구축 + transformers 4.48.x 호환성 직접 해결",
                  "HabanaAI/vllm-fork 빌드 + 멀티 카드 Tensor Parallelism",
                  "Calibration → INC 기반 FP8 양자화 파이프라인",
                  "optimum-habana 모델 파인튜닝 PoC + 성능 벤치마크",
                ]}
              />
            </ProjectCard>
            <ProjectCard
              number="20"
              title="AMD NPU / GPU 기술 검증"
              period="2025.06 ~ 2025.12"
              role="HW 검증 담당"
              tags={["ROCm", "vLLM", "Ollama", "llama.cpp"]}
            >
              <Bullets
                items={[
                  "AMD GPU + NPU 하이브리드 환경 + ROCm 스택 구축",
                  "프레임워크별 호환성 비교 (vLLM·Ollama·llama.cpp)",
                  "양자화·배치 전략 최적화 + 운영 가이드 문서화",
                ]}
              />
            </ProjectCard>
          </div>
        </section>

        {/* Personal */}
        <section id="personal" className="mb-14">
          <SectionHeader>SECTION · 07 — 개인 프로젝트</SectionHeader>
          <div className="grid md:grid-cols-2 gap-3">
            {PERSONAL_PROJECTS.map((p) => (
              <ProjectCard
                key={p.number}
                number={p.number}
                title={p.title}
                period={p.period}
                role={p.role}
                tags={p.tags}
              >
                {p.body}
              </ProjectCard>
            ))}
          </div>
        </section>

        {/* Awards / Talks */}
        <section id="presentations" className="mb-14">
          <SectionHeader>SECTION · 08 — 학회 발표 · 수상 · 대외활동</SectionHeader>

          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">
                학회 발표 / 수상
              </p>
              <Card className="p-0 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 dark:bg-white/5">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium text-subtle text-xs w-16">연도</th>
                      <th className="text-left px-4 py-2 font-medium text-subtle text-xs">활동</th>
                      <th className="text-left px-4 py-2 font-medium text-subtle text-xs hidden sm:table-cell">내용</th>
                    </tr>
                  </thead>
                  <tbody>
                    {AWARDS.map((a, i) => (
                      <tr key={i} className="border-t border-line">
                        <td className="px-4 py-2 tabular-nums text-muted">{a.year}</td>
                        <td className="px-4 py-2 font-medium text-body">{a.activity}</td>
                        <td className="px-4 py-2 text-muted text-xs hidden sm:table-cell">{a.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">
                대외 연사 활동
              </p>
              <Card className="p-0 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 dark:bg-white/5">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium text-subtle text-xs w-20">연도</th>
                      <th className="text-left px-4 py-2 font-medium text-subtle text-xs">행사</th>
                      <th className="text-left px-4 py-2 font-medium text-subtle text-xs hidden sm:table-cell">발표 주제</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TALKS.map((t, i) => (
                      <tr key={i} className="border-t border-line">
                        <td className="px-4 py-2 tabular-nums text-muted">{t.year}</td>
                        <td className="px-4 py-2 font-medium text-body">{t.event}</td>
                        <td className="px-4 py-2 text-muted text-xs hidden sm:table-cell">{t.topic}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>

            <Card className="p-4 bg-violet-50/40 dark:bg-violet-500/5">
              <p className="text-sm text-body">
                <strong>블로그 운영</strong> — 자체 운영 블로그{" "}
                <Link href="/" className="text-accent hover:underline">
                  koala.ai.kr
                </Link>
                에 80여 편의 논문 리뷰와 PoC 결과를 공개. 주요 시리즈:
                Transformer · LLM · AI Agent · 추론 최적화 · 딥페이크 탐지 · ASR
                · AI 가속기.
              </p>
            </Card>
          </div>
        </section>

        {/* Tech stack */}
        <section id="stack" className="mb-14">
          <SectionHeader>SECTION · 09 — 기술 스택 종합</SectionHeader>

          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">
                AI / ML / LLM
              </p>
              <StackTable rows={STACK_AI} />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">
                인프라 / DevOps
              </p>
              <StackTable rows={STACK_INFRA} />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">
                하드웨어 가속기
              </p>
              <StackTable rows={STACK_HW} />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">
                웹 / 응용
              </p>
              <StackTable rows={STACK_WEB} />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-8 mt-10 border-t border-line text-center space-y-2">
          <p className="text-sm font-semibold text-body">
            이다운 · AI / LLM Engineer · Ph.D. Candidate
          </p>
          <p className="text-xs text-subtle">
            <Link href="/" className="hover:text-accent">
              koala.ai.kr
            </Link>{" "}
            · 2026
          </p>
        </footer>
      </Container>
    </main>
  );
}

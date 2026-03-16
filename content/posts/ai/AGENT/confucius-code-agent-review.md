---
title: "대규모 코드베이스를 정복하는 AI 코딩 에이전트: Confucius Code Agent 깊이 파헤치기"
date: "2026-01-13"
description: "Meta와 Harvard가 공동 발표한 Confucius Code Agent(CCA) 논문 리뷰. AX/UX/DX 분리, 계층적 컨텍스트 관리, Hindsight Notes, 메타 에이전트 등 핵심 메커니즘을 코드와 함께 정리합니다."
tags: ["AI", "Agent", "LLM", "코딩에이전트", "SWE", "Meta", "Harvard", "논문리뷰"]
---

# 대규모 코드베이스를 정복하는 AI 코딩 에이전트: Confucius Code Agent 깊이 파헤치기

AI/LLM 시리즈 : Confucius Code Agent 논문 리뷰

이번에는 **Meta와 Harvard가 공동으로 발표한 소프트웨어 엔지니어링 에이전트 논문**에 대해 다루어 보고자 합니다.

실제 프로덕션 환경에서 수백만 줄의 코드를 다루는 AI 에이전트를 만드는 것은 쉽지 않습니다. 작은 데모 프로젝트에서는 잘 작동하던 에이전트들이 실제 대규모 코드베이스에서는 맥을 못 추는 경우가 많죠. Confucius Code Agent(CCA)는 이러한 한계를 극복하기 위해 설계된 프레임워크입니다.

---

## 왜 기존 에이전트들은 실패했을까?

연구진은 실제 소프트웨어 엔지니어링에서 AI 에이전트가 직면하는 두 가지 핵심 도전 과제를 정의했습니다.

**1. 장문맥 추론(Long-context Reasoning)**은 거대한 저장소에서 관련 코드를 효율적으로 찾아야 하며, 여러 파일과 모듈에 걸친 다단계 추론과 긴 도구 실행 흔적, 깊은 실행 히스토리 관리가 필요합니다.

**2. 장기 메모리(Long-term Memory)**는 세션과 태스크를 넘나들며 지속적인 지식을 축적하고, 재사용 가능한 패턴과 실패 모드를 캡처하며 과거 실수를 반복하지 않는 것을 요구합니다.

---

## CCA의 놀라운 성과

SWE-Bench-Pro 벤치마크에서 CCA는 기존 연구 기반 에이전트들을 크게 앞서는 성능을 보여줍니다.

| 에이전트 | 모델 | 해결률 |
|---|---|---|
| SWE-agent | Claude Haiku 4.5 | 39.5% |
| SWE-agent | Claude Sonnet 4.5 | 43.7% |
| Live-SWE-agent | Claude Sonnet 4.5 | 45.8% |
| **CCA** | **Claude Opus 4.5** | **54.3%** |

더 흥미로운 점은, **약한 모델 + 강한 스캐폴딩**이 강한 모델 + 약한 스캐폴딩보다 성능이 좋다는 것입니다. 이는 에이전트 아키텍처의 중요성을 강조합니다.

---

## 핵심 설계 철학: AX, UX, DX

대부분의 에이전트 프레임워크는 한 가지 관점만 최적화합니다. CCA는 세 가지 관점을 모두 고려합니다.

**Agent Experience (AX)**: AI가 보는 정보는 간결하고 구조화되어야 합니다. 불필요한 노이즈는 모델을 혼란스럽게 만듭니다.

```python
# UX (사용자가 보는 화면):
"""
Creating file at config.py
File created successfully at config.py
Here is the diff:
+ PORT=8080
+ DEBUG=true
+ MAX_CONNECTIONS=100
"""

# AX (에이전트가 받는 입력):
"""
Human: [previous user message]
AI: <file_edit type="create" file_path="config.py">...</file_edit>
Human: <result>File created successfully</result>
"""
```

사용자에게는 풍부한 정보를, 에이전트에게는 압축된 요약만 제공합니다. 이렇게 하면 컨텍스트 윈도우를 효율적으로 사용할 수 있습니다.

**User Experience (UX)**: 개발자는 에이전트가 무엇을 하고 있는지 투명하게 볼 수 있어야 합니다.

**Developer Experience (DX)**: 에이전트를 개발하고 개선하는 사람들을 위한 관찰 가능성, 평가, 모듈성이 중요합니다.

---

## CCA의 4가지 핵심 메커니즘

### F1: 계층적 컨텍스트 관리

긴 디버깅 세션에서도 중요한 정보를 잃지 않도록 계층적 메모리 구조를 사용합니다.

```
+-- instance_qutebrowser__qutebrowser-c09e1439...
    +-- hierarchical_memory_3a7488c6-bf8c-11f0-8236-cfd9fd0d56b4
        +-- qutebrowser_process_cleanup
        |   |-- analysis.md
        |   |-- implementation_summary.md
        +-- todo.md
```

컨텍스트가 임계값에 도달하면 Architect 에이전트가 자동으로 요약을 생성합니다.

```python
def orchestrator_loop():
    initialize_session_context()

    while iteration < max_iters:
        llm_output = invoke_llm(system_prompt + memory)
        actions = parse_llm_output(llm_output)

        for action in actions:
            extension = route_to_extension(action)
            result = execute_extension(extension)
            update_memory(result)

            if extension.signals_continuation():
                add_observations_to_memory(result)
                continue

        if is_complete():
            break

    return final_output_and_artifacts
```

### F2: 실패로부터 배우는 노트 테이킹

CCA의 가장 독특한 특징 중 하나는 **Hindsight Notes**입니다. 성공한 솔루션뿐만 아니라 실패 사례도 기록합니다.

```markdown
---
id: escaping_wildcards_in_infobase_queries
title: Escaping Wildcards in Infobase Queries
keywords:
- infobase
- queries
- wildcards
- escaping
---

## Problem Context
asterisk characters ('*') in author names cause unexpected behavior
because they are treated as wildcards.

## The Solution
Escape asterisks in name fields using a backslash when performing
exact matches, but preserve wildcards for surname matching.
```

```python
def find_author():
    # 정확한 이름 매칭을 위해 애스터리스크 이스케이프
    escaped_name = author["name"].replace("*", r"\*")
    queries = [
        {"type": "/type/author", "name~": escaped_name},
        {"type": "/type/author", "alternate_names~": escaped_name},
    ]

    # 성(surname) 매칭에는 의도적으로 와일드카드 사용
    if birth_year and death_year:
        surname = author['name'].split()[-1]
        queries.append({
            "type": "/type/author",
            "name~": f"* {surname}",  # 의도적인 와일드카드
        })
```

이러한 노트는 다음 실행에서 자동으로 검색되어 같은 실수를 반복하지 않게 합니다.

**실제 성능 개선**

| 실행 | 평균 턴 수 | 평균 토큰 비용 | 해결률 |
|---|---|---|---|
| Run 1 (처음) | 64 | 104k | 53.0% |
| Run 2 (노트 사용) | 61 (-3) | 93k (-11k) | 54.4% (+1.4%) |

### F3: 모듈식 확장 시스템

모든 도구 사용과 동작은 Extension을 통해 관리됩니다.

```python
class Extension:
    def on_input_messages(self, messages, context):
        pass

    def on_llm_output(self, output, context):
        pass

    def on_tag(self, tag_name, tag_content, context):
        pass


class FileEditExtension(Extension):
    def on_tag(self, tag_name, tag_content, context):
        if tag_name == "file_edit":
            file_path = extract_file_path(tag_content)
            if not is_safe_path(file_path):
                return error_response("Unsafe file path")
            result = perform_file_edit(file_path, extract_edit_type(tag_content), tag_content)
            context.memory.add_result(result)
            return success_response(result)


class BashExtension(Extension):
    ALLOWED_COMMANDS = ["ls", "grep", "cat", "find", "git"]

    def on_tag(self, tag_name, tag_content, context):
        if tag_name == "bash":
            command = extract_command(tag_content)
            if not self.is_allowed_command(command):
                return error_response("Command not allowed")
            output = execute_bash(command)
            context.memory.add_observation(output)
            return success_response(output)

    def is_allowed_command(self, command):
        return command.split()[0] in self.ALLOWED_COMMANDS
```

이 모듈식 설계 덕분에 새로운 도구를 추가하거나 기존 동작을 수정하기가 매우 쉽습니다.

### F4: 메타 에이전트 — 에이전트가 에이전트를 만든다

가장 혁신적인 부분은 **메타 에이전트**입니다. 다른 에이전트를 자동으로 생성하고 개선합니다.

```python
class MetaAgent:
    def create_agent(self, specification):
        # 1. BUILD: 에이전트 구성 생성
        config = self.generate_config(specification)
        agent = self.instantiate_agent(config)

        # 2. TEST: 평가 태스크로 테스트
        test_results = [agent.run(task) for task in specification.eval_tasks]

        # 3. IMPROVE: 실패 분석 및 개선
        failures = self.analyze_failures(test_results)
        if failures:
            improvements = self.propose_improvements(failures)
            updated_config = self.apply_improvements(config, improvements)
            return self.create_agent_with_config(updated_config)

        return agent

    def propose_improvements(self, failures):
        improvements = []
        for failure in failures:
            if failure.type == "brittle_tool_selection":
                improvements.append({
                    "type": "prompt_modification",
                    "target": "tool_selection_prompt",
                    "change": "Add examples of correct tool usage"
                })
            elif failure.type == "incorrect_file_edit":
                improvements.append({
                    "type": "extension_config",
                    "target": "file_edit_extension",
                    "change": "Enable stricter validation"
                })
        return improvements
```

실제로 **CCA 자체가 메타 에이전트를 통해 개발**되었습니다.

---

## 성능 분석

### 컨텍스트 관리의 효과

| 모델 | 컨텍스트 관리 | 도구 사용 | 해결률 |
|---|---|---|---|
| Claude 4 Sonnet | ❌ | 기본 | 42.0% |
| Claude 4 Sonnet | ✅ | 고급 | 48.6% |
| Claude 4.5 Sonnet | ❌ | 기본 | 44.0% |
| Claude 4.5 Sonnet | ❌ | 고급 | 51.0% |
| Claude 4.5 Sonnet | ✅ | 고급 | 51.6% |

컨텍스트 관리만으로도 **6.6%p 향상**!

### 멀티 파일 편집 견고성

| 수정 파일 수 | 해결률 | 샘플 수 |
|---|---|---|
| 1~2 files | 57.8% | 294 |
| 3~4 files | 49.2% | 203 |
| 5~6 files | 44.1% | 86 |
| 7~10 files | 52.6% | 38 |
| 10+ files | 44.4% | 18 |

파일 수가 늘어나도 안정적인 성능을 유지합니다.

---

## 실제 구현해보기

CCA의 핵심 아이디어를 간단한 코드로 구현해볼 수 있습니다.

```python
class SimpleConfuciusAgent:
    def __init__(self, llm_client):
        self.llm = llm_client
        self.memory = HierarchicalMemory()
        self.extensions = []
        self.notes = NoteStore()

    def run(self, task):
        self.memory.add_user_message(task)

        for iteration in range(self.max_iterations):
            # 컨텍스트 압축 필요 시
            if self.memory.needs_compression():
                self.compress_context()

            # 과거 노트 검색
            relevant_notes = self.notes.search(task)

            # LLM 호출
            context = self.memory.get_context() + relevant_notes
            response = self.llm.generate(context)

            # 확장 시스템을 통한 액션 처리
            actions = self.parse_response(response)
            results = self.execute_actions(actions)

            self.memory.add_ai_response(response)
            self.memory.add_results(results)

            if self.is_complete(results):
                break

        # 세션 노트 생성
        self.notes.create_session_notes(self.memory)
        return self.memory.get_final_output()

    def compress_context(self):
        """Architect 에이전트를 통한 컨텍스트 압축"""
        summary = self.llm.generate({
            "role": "architect",
            "task": "Summarize conversation preserving key decisions"
        })
        self.memory.replace_with_summary(summary)
```

---

## 결론: 스캐폴딩이 전부다

이 연구가 우리에게 주는 가장 중요한 교훈은 **에이전트 스캐폴딩의 중요성**입니다.

**모델만으로는 부족하다**: 더 강력한 LLM을 사용하는 것보다 더 나은 아키텍처가 중요할 수 있습니다.

**AX/UX/DX 분리**: 사용자, 에이전트, 개발자가 보는 것을 분리하면 모두에게 더 나은 경험을 제공할 수 있습니다.

**메모리는 필수**: 과거로부터 배우지 못하는 에이전트는 계속 같은 실수를 반복합니다.

**모듈성이 승리한다**: 확장 시스템을 통해 새로운 기능을 쉽게 추가하고 테스트할 수 있습니다.

**메타 에이전트**: 에이전트 개발 자체를 자동화하면 훨씬 빠른 개선이 가능합니다.

CCA는 단순히 높은 벤치마크 점수를 달성한 것이 아니라, 대규모 소프트웨어 엔지니어링을 위한 에이전트 설계의 새로운 패러다임을 제시했습니다. 앞으로 강화학습을 통한 추가 개선도 계획되어 있다고 하니, 더욱 기대가 됩니다.

> 이 글의 코드 예제들은 논문 내용을 바탕으로 작성한 것으로, 실제 구현과는 차이가 있을 수 있습니다.

**참고 자료**: Confucius Code Agent: Scalable Agent Scaffolding for Real-World Codebases · arXiv:2512.10398v5 · Meta & Harvard 공동 연구

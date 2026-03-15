---
title: "Anthropic Sandbox Runtime (srt): AI 에이전트를 안전하게 실행하는 샌드박스 도구"
date: "2026-01-13"
description: "Anthropic이 공개한 경량 샌드박싱 도구 Sandbox Runtime(srt)을 소개합니다. 네트워크/파일시스템 제한, MCP 서버 샌드박싱, 이중 격리 모델까지 실전 예제와 함께 정리합니다."
tags: ["AI", "Agent", "보안", "Anthropic", "Claude", "샌드박스", "MCP", "오픈소스"]
---

# Anthropic Sandbox Runtime (srt): AI 에이전트를 안전하게 실행하는 샌드박스 도구

AI/Agent 시리즈 : Anthropic Sandbox Runtime 리뷰

Meta의 Confucius Code Agent에 이어서 Anthropic이 공개한 **Sandbox Runtime**에 대해서 리뷰해보고자 합니다. Sandbox Runtime은 컨테이너 없이도 OS 레벨에서 프로세스의 파일시스템과 네트워크 접근을 제한할 수 있는 경량 샌드박싱 도구입니다. Claude Code를 위해 개발되었으며, AI 에이전트를 더 안전하게 만들기 위한 연구 프리뷰로 오픈소스로 공개되었습니다.

---

## 왜 필요한가?

AI 에이전트가 코드를 실행하거나 파일을 수정할 때 다음과 같은 걱정을 하게 됩니다.

- 민감한 SSH 키나 설정 파일에 접근하면 어쩌지?
- 허가되지 않은 외부 서버로 데이터를 전송하면?
- 시스템 파일을 실수로 삭제하거나 수정하면?

Sandbox Runtime은 이러한 위험을 기본적으로 차단하고, **필요한 권한만 명시적으로 허용하는 철학**으로 설계되었습니다.

---

## 설치 및 기본 사용법

```bash
npm install -g @anthropic-ai/sandbox-runtime
```

```bash
# 네트워크 제한 — anthropic.com은 허용
$ srt "curl anthropic.com"
<html>...</html>  # 요청 성공

# example.com은 차단
$ srt "curl example.com"
Connection blocked by network allowlist  # 요청 차단!

# 파일시스템 — 현재 디렉토리는 허용
$ srt "cat README.md"
# Anthropic Sandb...  # 읽기 성공

# SSH 키는 차단
$ srt "cat ~/.ssh/id_rsa"
cat: /Users/user/.ssh/id_rsa: Operation not permitted  # 차단됨!
```

---

## 핵심 특징

### 1. 네트워크 제한

특정 도메인과 호스트로만 HTTP/HTTPS 및 기타 프로토콜 접근을 제어합니다.

```json
{
  "network": {
    "allowedDomains": ["github.com", "*.github.com", "npmjs.org"],
    "deniedDomains": ["malicious.com"]
  }
}
```

### 2. 파일시스템 제한

읽기/쓰기 권한을 세밀하게 제어합니다. 기본값은 현재 작업 디렉토리만 쓰기 허용입니다.

```json
{
  "filesystem": {
    "denyRead": ["~/.ssh"],
    "allowWrite": [".", "/tmp"],
    "denyWrite": [".env", "secrets/"]
  }
}
```

### 3. Unix 소켓 제한

```json
{
  "network": {
    "allowUnixSockets": ["/var/run/docker.sock"]
  }
}
```

### 4. 실시간 위반 모니터링

macOS에서는 시스템 샌드박스 위반 로그를 실시간으로 추적합니다.

```bash
log stream --predicate 'process == "sandbox-exec"' --style syslog
```

---

## 실전 예제: MCP 서버 샌드박싱

MCP(Model Context Protocol) 서버를 샌드박스에서 실행하는 것이 주요 사용 사례입니다.

**샌드박스 없이**

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem"]
    }
  }
}
```

**샌드박스와 함께** — `npx` 앞에 `srt`만 추가하면 됩니다.

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "srt",
      "args": ["npx", "-y", "@modelcontextprotocol/server-filesystem"]
    }
  }
}
```

**권한 설정 (`~/.srt-settings.json`)**

```json
{
  "filesystem": {
    "denyRead": [],
    "allowWrite": ["."],
    "denyWrite": ["~/sensitive-folder"]
  },
  "network": {
    "allowedDomains": [],
    "deniedDomains": []
  }
}
```

이제 MCP 서버가 민감한 폴더에 쓰기를 시도하면 차단됩니다.

```
> Write a file to ~/sensitive-folder
✗ Error: EPERM: operation not permitted, open '/Users/user/sensitive-folder/test.txt'
```

---

## 작동 원리

### 이중 격리 모델

효과적인 샌드박싱을 위해서는 파일시스템과 네트워크 격리가 모두 필요합니다.

```
┌─────────────────────────────────────────────────────┐
│                    Host Machine                      │
│                                                      │
│  ┌──────────────┐         ┌──────────────┐         │
│  │  HTTP Proxy  │         │ SOCKS5 Proxy │         │
│  │  (필터링)     │         │  (필터링)     │         │
│  └──────┬───────┘         └───────┬──────┘         │
│         │                         │                 │
│  ┌──────┴─────────────────────────┴──────┐         │
│  │         Sandboxed Process              │         │
│  │  - 네트워크 네임스페이스 제거 (Linux)    │         │
│  │  - Localhost만 허용 (macOS)            │         │
│  │  - 파일시스템 제한                      │         │
│  └────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────┘
```

**플랫폼별 구현**

- **macOS**: `sandbox-exec`와 Seatbelt 프로파일 사용, 동적으로 생성된 프로파일로 파일 경로 제어
- **Linux**: `bubblewrap`를 사용한 컨테이너화, 네트워크 네임스페이스 격리, Unix 소켓을 통한 프록시 통신

**네트워크 격리**: HTTP/HTTPS 트래픽은 HTTP 프록시가, 기타 네트워크 트래픽(SSH, 데이터베이스 연결 등)은 SOCKS5 프록시가 가로채어 허용/차단 도메인을 검증합니다.

---

## 라이브러리로 사용하기

CLI 도구뿐만 아니라 Node.js 라이브러리로도 사용할 수 있습니다.

```typescript
import { SandboxManager, type SandboxRuntimeConfig } from '@anthropic-ai/sandbox-runtime'
import { spawn } from 'child_process'

const config: SandboxRuntimeConfig = {
  network: {
    allowedDomains: ['example.com', 'api.github.com'],
    deniedDomains: []
  },
  filesystem: {
    denyRead: ['~/.ssh'],
    allowWrite: ['.', '/tmp'],
    denyWrite: ['.env']
  }
}

await SandboxManager.initialize(config)
const sandboxedCommand = await SandboxManager.wrapWithSandbox('curl https://example.com')

const child = spawn(sandboxedCommand, { shell: true, stdio: 'inherit' })
child.on('exit', (code) => console.log(`Command exited with code ${code}`))

await SandboxManager.reset()
```

### 위반 감지 예제

```typescript
import { SandboxViolationStore } from '@anthropic-ai/sandbox-runtime'

SandboxViolationStore.onViolation((violation) => {
  console.log('Sandbox violation detected:', violation)
  // {
  //   type: 'file-read',
  //   path: '/Users/user/.ssh/id_rsa',
  //   timestamp: '2025-01-13T...',
  //   process: 'cat'
  // }
})
```

---

## 고급 설정

### 완전한 구성 예제

```json
{
  "network": {
    "allowedDomains": ["github.com", "*.github.com", "npmjs.org"],
    "deniedDomains": ["malicious.com"],
    "allowUnixSockets": ["/var/run/docker.sock"],
    "allowLocalBinding": false
  },
  "filesystem": {
    "denyRead": ["~/.ssh"],
    "allowWrite": [".", "src/", "test/", "/tmp"],
    "denyWrite": [".env", "config/production.json"]
  },
  "ignoreViolations": {
    "*": ["/usr/bin", "/System"],
    "npm": ["/private/tmp"]
  },
  "enableWeakerNestedSandbox": false
}
```

macOS에서는 glob 패턴도 지원합니다.

```json
{
  "allowWrite": [
    "src/**/*.ts",
    "test/*.js"
  ]
}
```

---

## 일반적인 문제와 팁

**Jest 실행하기**: Watchman이 샌드박스 경계 밖의 파일에 접근하므로 `--no-watchman` 플래그를 사용합니다.

```bash
srt "jest --no-watchman"
```

**Linux 위반 추적**: `strace`로 차단된 작업을 추적할 수 있습니다.

```bash
# 모든 거부된 작업 추적
strace -f srt <your-command> 2>&1 | grep EPERM

# 네트워크 작업 추적
strace -f -e trace=network srt <your-command> 2>&1 | grep EPERM
```

**플랫폼 지원**

| 플랫폼 | 지원 | 의존성 |
|---|---|---|
| macOS | ✅ | `brew install ripgrep` |
| Linux | ✅ | `bubblewrap`, `socat`, `ripgrep` |
| Windows | ❌ | 현재 미지원 |

---

## 보안 제한사항

알아야 할 중요한 사항입니다.

**네트워크 샌드박싱 한계**: 도메인 기반 필터링만 수행하며 트래픽 내용은 검사하지 않습니다. 신뢰할 수 있는 도메인만 허용해야 합니다.

**Unix 소켓을 통한 권한 상승**: `/var/run/docker.sock` 같은 소켓을 허용하면 호스트 시스템 접근 권한을 부여하는 것과 같습니다.

**파일시스템 권한 상승**: `$PATH`의 실행 파일, 시스템 구성 디렉토리, 쉘 구성 파일에 대한 쓰기 권한은 신중하게 부여해야 합니다.

---

## 결론: 안전한 AI 에이전트의 기반

Anthropic Sandbox Runtime은 AI 에이전트를 안전하게 실행하기 위한 핵심 인프라입니다.

- **최소 권한 원칙**: 기본적으로 모든 것을 차단하고 필요한 것만 허용
- **OS 레벨 보안**: 컨테이너 없이도 강력한 격리 제공
- **투명성**: 실시간 위반 모니터링으로 무슨 일이 일어나는지 파악
- **유연성**: CLI 도구와 라이브러리 모두 지원
- **실전 검증**: Claude Code에서 실제 사용 중

이 도구는 단순히 샌드박스를 넘어, **AI 에이전트를 기본적으로 안전하게 만들기 위한 에코시스템의 일부**입니다.

**참고 자료**: [GitHub](https://github.com/anthropic-experimental/sandbox-runtime) · [Claude Code 샌드박싱 문서](https://docs.claude.com/en/docs/claude-code/sandboxing) · 이 글은 Anthropic의 실험적 프로젝트인 Sandbox Runtime의 공식 문서를 바탕으로 작성되었습니다.

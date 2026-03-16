럍---
title: "MCP(Model Context Protocol) 완전 정복 — AI와 도구를 연결하는 USB-C"
date: "2026-03-16"
description: "Anthropic이 제안한 MCP의 구조와 작동 원리를 깊이 파헤칩니다. Host, Client, Server의 역할 분리부터 직접 MCP 서버를 만드는 실습 코드까지 한 번에 정리합니다."
tags: ["AI", "Agent", "MCP", "Anthropic", "LLM", "도구연결", "오픈소스", "프로토콜"]
---

# MCP(Model Context Protocol) 완전 정복 — AI와 도구를 연결하는 USB-C

AI/Agent 시리즈 : MCP 완전 정복

이전 포스팅에서 Google의 A2A(Agent to Agent)를 다뤘는데요. A2A를 제대로 이해하려면 그 기반이 되는 **MCP(Model Context Protocol)** 를 먼저 알아야 합니다. A2A 소개 때 "MCP는 USB-C 포트 같다"는 비유를 썼는데, 오늘은 그 USB-C가 정확히 어떻게 생겼는지를 뜯어보겠습니다.

---

## 왜 MCP가 필요했을까?

MCP가 등장하기 전, AI 에이전트에 도구를 연결하는 방식은 제각각이었습니다.

LangChain에는 LangChain용 래퍼, AutoGPT에는 AutoGPT용 플러그인, Claude API에는 Claude용 tool_use 스펙... 같은 "파일 읽기" 기능이라도 프레임워크마다 다르게 구현해야 했습니다. 도구가 N개, 프레임워크가 M개면 **N × M 개의 커넥터**가 필요한 구조입니다.

MCP는 이 문제를 해결하기 위해 나왔습니다.

> 도구는 MCP 서버로 한 번만 구현한다. 어떤 AI 클라이언트든 동일한 방식으로 가져다 쓴다.

N × M 문제가 **N + M** 으로 줄어드는 구조입니다.

---

## MCP의 3계층 구조

MCP는 세 가지 역할로 나뉩니다.

```
┌────────────────────────────────────┐
│              Host                  │
│  (Claude Desktop, IDE, 커스텀 앱)   │
│                                    │
│  ┌──────────┐    ┌──────────┐      │
│  │  Client  │    │  Client  │      │
│  └────┬─────┘    └────┬─────┘      │
└───────┼──────────────┼─────────────┘
        │  MCP 프로토콜  │
        ▼              ▼
   ┌─────────┐    ┌─────────┐
   │ Server  │    │ Server  │
   │(파일시스템)│   │(GitHub) │
   └─────────┘    └─────────┘
```

**Host**는 사용자가 직접 상호작용하는 애플리케이션입니다. Claude Desktop, VS Code Copilot, 또는 직접 만든 에이전트 앱이 여기에 해당합니다. Host는 여러 개의 MCP Client를 포함합니다.

**Client**는 Host 내부에서 특정 MCP Server와 1:1로 연결되는 컴포넌트입니다. 연결 유지, 메시지 전달, 기능 목록 관리를 담당합니다.

**Server**는 실제 기능을 제공하는 독립 프로세스입니다. 파일 시스템, GitHub, Slack, 데이터베이스 등 어떤 외부 시스템이든 MCP Server로 만들 수 있습니다.

---

## MCP가 제공하는 3가지 기능 유형

MCP Server가 Client에게 제공할 수 있는 기능은 세 가지로 나뉩니다.

**Tools(도구)**: 모델이 직접 호출할 수 있는 함수입니다. 파일 쓰기, API 호출, 코드 실행 같은 **액션**에 해당합니다. 모델의 명시적 요청으로 실행됩니다.

**Resources(리소스)**: 모델이 읽을 수 있는 데이터입니다. 파일 내용, 데이터베이스 레코드처럼 **컨텍스트**를 제공합니다. URI로 식별합니다.

**Prompts(프롬프트)**: 재사용 가능한 프롬프트 템플릿입니다. "이 코드를 리뷰해줘" 같은 워크플로우를 미리 정의해두고 호출할 수 있습니다.

---

## 통신 방식: JSON-RPC 2.0

MCP의 메시지는 JSON-RPC 2.0 기반입니다. 복잡해 보이지만 실제 구조는 단순합니다.

```json
// Client → Server: 도구 목록 요청
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list"
}

// Server → Client: 도구 목록 응답
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "read_file",
        "description": "파일 내용을 읽습니다",
        "inputSchema": {
          "type": "object",
          "properties": {
            "path": { "type": "string" }
          },
          "required": ["path"]
        }
      }
    ]
  }
}

// Client → Server: 도구 실행 요청
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "read_file",
    "arguments": { "path": "/home/user/README.md" }
  }
}
```

전송 레이어는 두 가지를 지원합니다. **stdio**는 로컬 프로세스 간 통신에 사용하며, 자식 프로세스의 표준 입출력으로 메시지를 주고받습니다. **HTTP + SSE(Server-Sent Events)** 는 원격 서버와 통신할 때 사용합니다.

---

## 직접 MCP 서버 만들기

Python으로 간단한 MCP 서버를 만들어보겠습니다. 날씨 정보를 제공하는 서버입니다.

```bash
pip install mcp
```

```python
# weather_server.py
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp import types
import httpx

app = Server("weather-server")

@app.list_tools()
async def list_tools() -> list[types.Tool]:
    """사용 가능한 도구 목록을 반환합니다"""
    return [
        types.Tool(
            name="get_current_weather",
            description="특정 도시의 현재 날씨를 조회합니다",
            inputSchema={
                "type": "object",
                "properties": {
                    "city": {
                        "type": "string",
                        "description": "도시 이름 (영문)"
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                        "default": "celsius"
                    }
                },
                "required": ["city"]
            }
        ),
        types.Tool(
            name="get_forecast",
            description="특정 도시의 5일 예보를 조회합니다",
            inputSchema={
                "type": "object",
                "properties": {
                    "city": {"type": "string"}
                },
                "required": ["city"]
            }
        )
    ]

@app.call_tool()
async def call_tool(name: str, arguments: dict) -> list[types.TextContent]:
    """도구를 실행합니다"""

    if name == "get_current_weather":
        city = arguments["city"]
        unit = arguments.get("unit", "celsius")

        # 실제로는 OpenWeatherMap 등 API를 호출
        # 여기서는 예시 데이터 반환
        weather_data = {
            "city": city,
            "temperature": 22 if unit == "celsius" else 71,
            "unit": unit,
            "condition": "맑음",
            "humidity": 65,
            "wind_speed": "3m/s"
        }

        result = (
            f"{city}의 현재 날씨:\n"
            f"  온도: {weather_data['temperature']}°{'C' if unit == 'celsius' else 'F'}\n"
            f"  날씨: {weather_data['condition']}\n"
            f"  습도: {weather_data['humidity']}%\n"
            f"  풍속: {weather_data['wind_speed']}"
        )
        return [types.TextContent(type="text", text=result)]

    elif name == "get_forecast":
        city = arguments["city"]
        # 5일 예보 예시 데이터
        forecast = [
            {"day": "오늘", "high": 24, "low": 16, "condition": "맑음"},
            {"day": "내일", "high": 22, "low": 15, "condition": "구름 조금"},
            {"day": "모레", "high": 19, "low": 13, "condition": "비"},
            {"day": "3일 후", "high": 21, "low": 14, "condition": "흐림"},
            {"day": "4일 후", "high": 25, "low": 17, "condition": "맑음"},
        ]

        result = f"{city} 5일 예보:\n"
        for day in forecast:
            result += f"  {day['day']}: {day['condition']}, {day['low']}~{day['high']}°C\n"

        return [types.TextContent(type="text", text=result)]

    else:
        raise ValueError(f"알 수 없는 도구: {name}")


async def main():
    async with stdio_server() as (read_stream, write_stream):
        await app.run(read_stream, write_stream, app.create_initialization_options())

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
```

---

## Claude Desktop에 연결하기

만든 서버를 Claude Desktop에 등록하려면 설정 파일을 수정합니다.

```json
// ~/Library/Application Support/Claude/claude_desktop_config.json (macOS)
{
  "mcpServers": {
    "weather": {
      "command": "python",
      "args": ["/path/to/weather_server.py"]
    }
  }
}
```

재시작하면 Claude Desktop이 자동으로 서버를 실행하고 도구 목록을 가져옵니다. 이후 대화에서 "서울 날씨 알려줘"라고 하면 Claude가 `get_current_weather` 도구를 자동으로 호출합니다.

---

## Resources와 Prompts 구현 예시

Tools 외에 Resources와 Prompts도 간단히 추가할 수 있습니다.

```python
@app.list_resources()
async def list_resources() -> list[types.Resource]:
    return [
        types.Resource(
            uri="weather://cities/korea",
            name="한국 주요 도시 목록",
            description="날씨 조회 가능한 한국 주요 도시 목록",
            mimeType="text/plain"
        )
    ]

@app.read_resource()
async def read_resource(uri: str) -> str:
    if uri == "weather://cities/korea":
        cities = ["Seoul", "Busan", "Incheon", "Daegu", "Daejeon", "Gwangju"]
        return "\n".join(cities)
    raise ValueError(f"알 수 없는 리소스: {uri}")


@app.list_prompts()
async def list_prompts() -> list[types.Prompt]:
    return [
        types.Prompt(
            name="daily_weather_briefing",
            description="일일 날씨 브리핑을 요청하는 프롬프트",
            arguments=[
                types.PromptArgument(
                    name="city",
                    description="날씨를 확인할 도시",
                    required=True
                )
            ]
        )
    ]

@app.get_prompt()
async def get_prompt(name: str, arguments: dict) -> types.GetPromptResult:
    if name == "daily_weather_briefing":
        city = arguments.get("city", "Seoul")
        return types.GetPromptResult(
            description="일일 날씨 브리핑",
            messages=[
                types.PromptMessage(
                    role="user",
                    content=types.TextContent(
                        type="text",
                        text=f"{city}의 오늘 날씨와 주간 예보를 간결하게 브리핑해줘. "
                             f"우산이 필요한지, 외출 시 무엇을 준비해야 할지 포함해서."
                    )
                )
            ]
        )
```

---

## MCP와 A2A의 관계 다시 정리

이전에 A2A를 다루면서 "MCP는 하위 계층, A2A는 상위 계층"이라고 설명했는데, 직접 MCP를 만들어보니 그 의미가 더 명확해집니다.

**MCP**: 모델 ↔ 도구/데이터 연결. "파일을 읽어라", "API를 호출해라" 같은 단일 동작에 특화됩니다.

**A2A**: 에이전트 ↔ 에이전트 연결. "이 작업 전체를 처리해줘"처럼 다단계 목표를 위임합니다.

실제 복잡한 에이전트 시스템에서는 두 가지가 함께 쓰입니다. 각 에이전트는 MCP를 통해 도구에 접근하고, A2A를 통해 다른 에이전트에게 작업을 위임하는 구조입니다.

---

## 마무리

MCP는 기술적으로 복잡하지 않습니다. JSON-RPC 위에 Tools, Resources, Prompts라는 세 가지 추상화를 얹은 단순한 프로토콜입니다. 하지만 **표준화**라는 측면에서 그 가치는 엄청납니다.

현재 Cursor, Zed, VS Code, Claude Desktop 등 주요 AI 개발 도구들이 MCP를 지원하고 있고, 공개된 MCP 서버 목록도 수백 개를 넘어섰습니다. 앞으로 AI 에이전트를 개발하신다면 MCP는 피해갈 수 없는 기본 소양이 될 것 같습니다.

**참고 자료**
- [MCP 공식 문서](https://modelcontextprotocol.io)
- [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)
- [공개 MCP 서버 목록](https://github.com/modelcontextprotocol/servers)

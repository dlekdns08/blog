import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM = `당신은 기술 블로그 글에 적절한 태그를 추천하는 어시스턴트입니다.

규칙:
- 정확히 4~7개의 태그를 추천
- 각 태그는 1~3 단어 (한국어 또는 영어)
- 너무 일반적인 단어 금지: "AI", "기술", "블로그", "개발" 등
- 너무 특수한 고유명사 금지 (글에서 한 번만 등장한 명칭 등)
- 검색·분류에 유용한 핵심 개념/기술명 위주

출력 형식 (JSON만, 다른 문구 금지):
{"tags": ["태그1", "태그2", "태그3", "태그4", "태그5"]}`;

export async function POST(req: NextRequest) {
  if (!process.env.CLAUDE_TOKEN) {
    return NextResponse.json(
      { error: "CLAUDE_TOKEN 환경변수가 설정되지 않았습니다." },
      { status: 503 }
    );
  }

  const { title, content } = (await req.json()) as {
    title?: string;
    content?: string;
  };

  if (!title || !content) {
    return NextResponse.json(
      { error: "title과 content가 필요합니다." },
      { status: 400 }
    );
  }

  const client = new Anthropic({ apiKey: process.env.CLAUDE_TOKEN });

  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: `제목: ${title}\n\n본문(앞부분):\n${content.slice(0, 6000)}`,
        },
      ],
    });

    const text = msg.content
      .map((c) => (c.type === "text" ? c.text : ""))
      .join("")
      .trim();

    const cleaned = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "");

    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed.tags)) {
      throw new Error("invalid response shape");
    }
    const tags = parsed.tags
      .map((t: unknown) => String(t).trim())
      .filter(Boolean)
      .slice(0, 7);

    return NextResponse.json({ tags });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI 응답 처리 실패";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

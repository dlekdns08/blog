import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic({ apiKey: process.env.CLAUDE_TOKEN });

const BASE_SYSTEM = `당신은 '코알라 오딧세이' 블로그의 AI 어시스턴트입니다.
이 블로그는 이다운님이 운영하며 LLM/AI 기술, IT, 전문연구요원 일상을 다룹니다.

독자의 질문에 친절하고 간결하게 한국어로 답변해 주세요.
블로그 글에 관한 질문이라면 제공된 내용을 바탕으로 답변하고,
모르는 내용은 솔직하게 말씀해 주세요.`;

type Message = { role: "user" | "assistant"; content: string };

type PostIndexEntry = {
  slug: string;
  title: string;
  description: string | null;
  tags: string[];
  category: string;
};

export async function POST(req: NextRequest) {
  if (!process.env.CLAUDE_TOKEN) {
    return new Response("CLAUDE_TOKEN is not configured", { status: 503 });
  }

  const { messages, context, index } = (await req.json()) as {
    messages: Message[];
    context?: string;
    index?: PostIndexEntry[];
  };

  if (!messages || messages.length === 0) {
    return new Response("messages is required", { status: 400 });
  }

  let system = BASE_SYSTEM;
  if (context) {
    system += `\n\n현재 독자가 읽고 있는 글의 내용:\n\`\`\`\n${context.slice(0, 8000)}\n\`\`\``;
  } else if (index && index.length > 0) {
    const list = index
      .slice(0, 50)
      .map((p) => {
        const tags = p.tags.length > 0 ? ` [${p.tags.join(", ")}]` : "";
        const desc = p.description ? ` — ${p.description}` : "";
        return `- "${p.title}" (/posts/${p.slug})${desc}${tags}`;
      })
      .join("\n");
    system += `\n\n블로그에 있는 글 목록 (최근 ${Math.min(index.length, 50)}개):\n${list}\n\n사용자의 질문이 특정 주제에 관한 것이라면 위 목록에서 관련 글을 추천하고 정확한 경로(/posts/...)를 인용하세요. 목록에 없는 내용을 지어내지 마세요.`;
  }

  try {
    const anthropicStream = client.messages.stream({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      system,
      messages,
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of anthropicStream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              controller.enqueue(new TextEncoder().encode(chunk.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          console.error("[chat] stream error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("[chat] error:", err);
    const message = err instanceof Error
      ? `${err.name}: ${err.message}`
      : String(err);
    return new Response(message, { status: 502 });
  }
}

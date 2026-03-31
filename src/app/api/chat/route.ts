import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic({ apiKey: process.env.CLAUDE_TOKEN });

const BASE_SYSTEM = `당신은 '코알라 오딧세이' 블로그의 AI 어시스턴트입니다.
이 블로그는 이다운님이 운영하며 LLM/AI 기술, IT, 전문연구요원 일상을 다룹니다.

독자의 질문에 친절하고 간결하게 한국어로 답변해 주세요.
블로그 글에 관한 질문이라면 제공된 내용을 바탕으로 답변하고,
모르는 내용은 솔직하게 말씀해 주세요.`;

type Message = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  const { messages, context } = (await req.json()) as {
    messages: Message[];
    context?: string;
  };

  if (!messages || messages.length === 0) {
    return new Response("messages is required", { status: 400 });
  }

  const system = context
    ? `${BASE_SYSTEM}\n\n현재 독자가 읽고 있는 글의 내용:\n\`\`\`\n${context.slice(0, 8000)}\n\`\`\``
    : BASE_SYSTEM;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = client.messages.stream({
          model: "claude-opus-4-6",
          max_tokens: 1024,
          system,
          messages,
        });

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
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

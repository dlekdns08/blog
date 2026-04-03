import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getTopPapers } from "@/lib/arxivDb";

export const runtime = "nodejs";
export const revalidate = 3600; // 1시간 캐시

const client = new Anthropic({ apiKey: process.env.CLAUDE_TOKEN });

async function summarize(title: string, abstract: string): Promise<string> {
  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 150,
      messages: [
        {
          role: "user",
          content: `다음 논문을 한국어로 2문장 이내로 핵심만 요약해줘. 전문 용어는 유지해도 돼.\n\n제목: ${title}\n초록: ${abstract.slice(0, 600)}`,
        },
      ],
    });
    const block = msg.content[0];
    return block.type === "text" ? block.text : "";
  } catch {
    return "";
  }
}

export async function GET() {
  const papers = getTopPapers(10).filter((p) => {
    if (!p.published_at) return false;
    const age = Date.now() - new Date(p.published_at).getTime();
    return age < 7 * 24 * 60 * 60 * 1000; // 7일 이내
  }).slice(0, 3);

  const withSummary = await Promise.all(
    papers.map(async (p) => ({
      arxiv_id: p.arxiv_id,
      title: p.title,
      pdf_url: p.pdf_url,
      primary_category: p.primary_category,
      importance_score: p.importance_score,
      published_at: p.published_at,
      summary: await summarize(p.title, p.abstract),
    }))
  );

  return NextResponse.json(withSummary);
}

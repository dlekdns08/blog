import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/posts";

export async function GET() {
  const posts = await getAllPosts();
  // 챗 컨텍스트용 — 최근 50개의 핵심 메타만 추려서 반환
  const slim = posts.slice(0, 50).map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description ?? null,
    tags: p.tags ?? [],
    category: p.category,
    date: p.date,
  }));
  return NextResponse.json(slim);
}

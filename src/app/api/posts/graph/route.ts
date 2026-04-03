import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/posts";

export const revalidate = 3600;

const API = process.env.API_URL ?? "https://api.koala.ai.kr";

export async function GET() {
  const posts = await getAllPosts();

  const postInputs = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    category: p.category,
    subcategory: p.subcategory ?? null,
    tags: p.tags ?? [],
    date: p.date,
  }));

  try {
    const res = await fetch(`${API}/posts/graph/build`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ posts: postInputs }),
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({ nodes: data.nodes, edges: data.edges });
    }
  } catch {
    // FastAPI 호출 실패 시 로컬 계산으로 폴백
  }

  // 폴백: 로컬에서 그래프 계산
  const nodes = postInputs.map((p) => ({
    id: p.slug,
    title: p.title,
    category: p.category,
    subcategory: p.subcategory,
    tags: p.tags,
    date: p.date,
  }));

  const edges: { source: string; target: string; weight: number }[] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      let w = 0;
      if (a.category && a.category === b.category) w += 0.4;
      if (a.subcategory && a.subcategory === b.subcategory) w += 0.6;
      const sharedTags = (a.tags ?? []).filter((t) => (b.tags ?? []).includes(t));
      w += sharedTags.length * 0.5;
      if (w >= 0.4) edges.push({ source: a.id, target: b.id, weight: Math.min(w, 2) });
    }
  }

  return NextResponse.json({ nodes, edges });
}

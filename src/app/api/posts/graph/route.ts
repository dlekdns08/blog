import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/posts";

export const revalidate = 3600;

export async function GET() {
  const posts = await getAllPosts();

  const nodes = posts.map((p) => ({
    id: p.slug,
    title: p.title,
    category: p.category,
    subcategory: p.subcategory ?? null,
    tags: p.tags ?? [],
    date: p.date,
  }));

  // 엣지: 같은 subcategory(강) or category(약) or 공유 태그
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

import { Suspense } from "react";
import { getAllPosts } from "@/lib/posts";
import { CATEGORY_CONFIG } from "@/lib/categories";
import { ExploreTabs } from "@/components/ExploreTabs";

export const metadata = {
  title: "탐색",
  description: "워드클라우드, 논문 그래프, 지식 그래프를 한 곳에서 탐색합니다.",
};

export default async function ExplorePage() {
  const posts = await getAllPosts();
  const catCounts: Record<string, number> = {};
  for (const p of posts) catCounts[p.category] = (catCounts[p.category] ?? 0) + 1;

  const categories = Object.entries(catCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, cnt]) => {
      const cfg = CATEGORY_CONFIG[cat];
      return {
        key: cat,
        label: cfg?.label ?? cat,
        icon: cfg?.icon ?? null,
        count: cnt,
        pct: Math.round((cnt / posts.length) * 100),
      };
    });

  return (
    <Suspense>
      <ExploreTabs
        postCount={posts.length}
        categoryCount={Object.keys(catCounts).length}
        categories={categories}
      />
    </Suspense>
  );
}

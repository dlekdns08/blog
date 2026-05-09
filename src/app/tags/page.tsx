import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const metadata: Metadata = {
  title: "태그",
  description: "모든 태그를 한눈에",
};

export default async function TagsIndexPage() {
  const posts = await getAllPosts();
  const tagMap = new Map<string, number>();
  for (const p of posts) {
    if (!p.tags) continue;
    for (const t of p.tags) {
      tagMap.set(t, (tagMap.get(t) ?? 0) + 1);
    }
  }
  const tags = Array.from(tagMap.entries()).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...tags.map(([, c]) => c), 1);

  return (
    <main className="py-10 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">태그</h1>
        <p className="text-sm text-muted mb-8">
          전체 {tags.length}개 태그 · {posts.length}개 글
        </p>

        <SectionHeader>인기 태그</SectionHeader>

        {tags.length === 0 ? (
          <p className="text-sm text-subtle py-8 text-center">
            아직 태그가 없습니다.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map(([tag, count]) => {
              // 사용 빈도에 따라 폰트 크기 조절
              const ratio = count / max;
              const size =
                ratio > 0.66
                  ? "text-base font-semibold"
                  : ratio > 0.33
                  ? "text-sm font-medium"
                  : "text-xs";
              return (
                <Link
                  key={tag}
                  href={`/tags/${encodeURIComponent(tag)}`}
                  className={`inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 ${size} text-body hover:border-accent hover:text-accent transition-colors`}
                >
                  <span>{tag}</span>
                  <span className="text-[10px] text-subtle tabular-nums">{count}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

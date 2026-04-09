import Link from "next/link";
import type { PostMeta } from "@/lib/posts";
import { CATEGORY_CONFIG } from "@/lib/categories";
import { formatRelativeDate } from "@/lib/date";

function getRelated(current: PostMeta, all: PostMeta[], limit = 3): PostMeta[] {
  const others = all.filter((p) => p.slug !== current.slug);

  const scored = others.map((p) => {
    let score = 0;
    // 같은 소분류 +3
    if (current.subcategory && p.subcategory === current.subcategory) score += 3;
    // 같은 카테고리 +2
    if (current.category && p.category === current.category) score += 2;
    // 공통 태그 +1씩
    if (current.tags && p.tags) {
      const tagSet = new Set(current.tags);
      score += p.tags.filter((t) => tagSet.has(t)).length;
    }
    return { post: p, score };
  });

  return scored
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || Date.parse(b.post.date) - Date.parse(a.post.date))
    .slice(0, limit)
    .map(({ post }) => post);
}

export function RelatedPosts({ current, all }: { current: PostMeta; all: PostMeta[] }) {
  const related = getRelated(current, all);
  if (related.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="mb-4 text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
        관련 글
      </h2>
      <ul className="space-y-2">
        {related.map((p) => {
          const catLabel = CATEGORY_CONFIG[p.category]?.label ?? p.category;
          return (
            <li key={p.slug}>
              <Link
                href={`/posts/${p.slug}`}
                className="group flex items-start gap-3 rounded-xl border border-black/8 bg-white p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/8"
              >
                <div className="flex-1 min-w-0">
                  {catLabel && (
                    <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 mb-0.5">{catLabel}</p>
                  )}
                  <p className="text-sm font-semibold text-zinc-900 group-hover:text-violet-700 dark:text-zinc-100 dark:group-hover:text-violet-300 transition-colors truncate">
                    {p.title}
                  </p>
                  {p.description && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">{p.description}</p>
                  )}
                </div>
                <time className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500 tabular-nums mt-0.5">
                  {formatRelativeDate(p.date)}
                </time>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

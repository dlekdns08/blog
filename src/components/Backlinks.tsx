import Link from "next/link";
import type { PostMeta } from "@/lib/posts";
import { CATEGORY_CONFIG } from "@/lib/categories";
import { SectionHeader } from "@/components/ui/SectionHeader";

/**
 * 현재 글을 인용한 다른 글 목록.
 * RelatedPosts(태그 기반)와 보완 — 명시적 internal link만 추적.
 */
export function Backlinks({ posts }: { posts: PostMeta[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-10">
      <SectionHeader>이 글을 인용한 글</SectionHeader>
      <ul className="space-y-1.5">
        {posts.map((p) => {
          const catLabel = CATEGORY_CONFIG[p.category]?.label ?? p.category;
          return (
            <li key={p.slug}>
              <Link
                href={`/posts/${p.slug}`}
                className="flex items-center gap-2 text-sm text-body hover:text-accent transition-colors group"
              >
                <span className="text-subtle group-hover:text-accent">↩</span>
                <span className="truncate">{p.title}</span>
                {catLabel && (
                  <span className="ml-auto text-[10px] text-subtle shrink-0">{catLabel}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

import Link from "next/link";
import type { PostMeta } from "@/lib/posts";
import { CATEGORY_CONFIG } from "@/lib/categories";
import { SectionHeader } from "@/components/ui/SectionHeader";

/**
 * frontmatter `featured: true`로 마크된 글을 홈 상단에 노출.
 */
export function FeaturedPosts({ posts }: { posts: PostMeta[] }) {
  const featured = posts.filter((p) => p.featured).slice(0, 3);
  if (featured.length === 0) return null;

  return (
    <section className="mb-8">
      <SectionHeader accent>📌 Featured</SectionHeader>
      <div className="grid sm:grid-cols-3 gap-3">
        {featured.map((p) => {
          const catLabel = CATEGORY_CONFIG[p.category]?.label ?? p.category;
          return (
            <Link
              key={p.slug}
              href={`/posts/${p.slug}`}
              className="group block rounded-xl border border-accent/30 bg-violet-50/40 dark:bg-violet-500/5 p-4 hover:border-accent transition-colors"
            >
              {catLabel && (
                <p className="text-[10px] font-medium text-accent mb-1.5 uppercase tracking-widest">
                  {catLabel}
                </p>
              )}
              <p className="text-sm font-semibold text-body group-hover:text-accent transition-colors line-clamp-2">
                {p.title}
              </p>
              {p.description && (
                <p className="text-xs text-subtle mt-1.5 line-clamp-2">{p.description}</p>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

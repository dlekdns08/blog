import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts } from "@/lib/posts";
import { Container } from "@/components/Container";
import { CATEGORY_CONFIG } from "@/lib/categories";
import { formatRelativeDate } from "@/lib/date";

type PageProps = { params: Promise<{ tag: string }> };

export async function generateStaticParams() {
  const posts = await getAllPosts();
  const tags = new Set(posts.flatMap((p) => p.tags ?? []));
  return Array.from(tags).map((tag) => ({ tag: encodeURIComponent(tag) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  return {
    title: `#${decoded}`,
    description: `"${decoded}" 태그가 달린 글 목록입니다.`,
  };
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);

  const allPosts = await getAllPosts();
  const posts = allPosts.filter((p) => p.tags?.includes(decoded));

  if (posts.length === 0) notFound();

  return (
    <main className="py-10">
      <Container>
        <div className="space-y-8">
          {/* 헤더 */}
          <header className="space-y-2">
            <div className="flex items-center gap-2">
              <Link
                href="/posts"
                className="text-xs text-zinc-400 hover:text-violet-600 dark:text-zinc-500 dark:hover:text-violet-400 transition-colors"
              >
                글 목록
              </Link>
              <span className="text-zinc-300 dark:text-zinc-600">/</span>
              <span className="text-xs text-subtle">태그</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="text-accent">#</span>
              {decoded}
            </h1>
            <p className="text-sm text-muted">
              {posts.length}개의 글
            </p>
          </header>

          {/* 글 목록 */}
          <ul className="space-y-3">
            {posts.map((p) => {
              const catLabel = CATEGORY_CONFIG[p.category]?.label ?? p.category;
              return (
                <li key={p.slug}>
                  <Link
                    href={`/posts/${p.slug}`}
                    className="group block rounded-xl border border-black/8 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/8"
                  >
                    {catLabel && (
                      <p className="text-[11px] font-medium text-subtle mb-1">
                        {catLabel}
                        {p.subcategory && <> / {p.subcategory}</>}
                      </p>
                    )}
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="font-semibold text-zinc-900 group-hover:text-violet-700 dark:text-zinc-100 dark:group-hover:text-violet-300 transition-colors">
                        {p.title}
                      </span>
                      <div className="shrink-0 flex items-center gap-2">
                        {p.readingTime && (
                          <span className="text-xs text-subtle">{p.readingTime}분</span>
                        )}
                        <time className="text-xs text-subtle tabular-nums">
                          {formatRelativeDate(p.date)}
                        </time>
                      </div>
                    </div>
                    {p.description && (
                      <p className="mt-1.5 text-sm text-muted leading-relaxed">
                        {p.description}
                      </p>
                    )}
                    {p.tags && p.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {p.tags.map((t) => (
                          <span
                            key={t}
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              t === decoded
                                ? "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300"
                                : "bg-zinc-100 text-zinc-500 dark:bg-white/10 dark:text-zinc-400"
                            }`}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { getAllPosts, getPostBySlug } from "@/lib/posts";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getPostBySlug(slug);
    return {
      title: post.meta.title,
      description: post.meta.description,
    };
  } catch {
    return { title: "글을 찾을 수 없음" };
  }
}

export default async function PostDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let post: Awaited<ReturnType<typeof getPostBySlug>>;
  try {
    post = await getPostBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <main className="py-10">
      <Container>
        {/* 뒤로가기 */}
        <Link
          href="/posts"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-violet-600 dark:text-zinc-500 dark:hover:text-violet-400 transition-colors mb-8"
        >
          <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 12L6 8l4-4" />
          </svg>
          글 목록
        </Link>

        {/* 포스트 헤더 */}
        <header className="mb-10 space-y-3">
          <h1 className="text-2xl font-bold tracking-tight leading-tight">
            {post.meta.title}
          </h1>
          {post.meta.description && (
            <p className="text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {post.meta.description}
            </p>
          )}
          <div className="flex items-center gap-3 pt-1">
            <time className="text-xs text-zinc-400 dark:text-zinc-500 tabular-nums">
              {post.meta.date}
            </time>
            {post.meta.tags && post.meta.tags.length > 0 && (
              <>
                <span className="text-zinc-200 dark:text-zinc-700">·</span>
                <div className="flex flex-wrap gap-1.5">
                  {post.meta.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-500 dark:bg-white/10 dark:text-zinc-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </header>

        {/* 구분선 */}
        <div className="mb-10 h-px bg-black/8 dark:bg-white/8" />

        {/* 본문 */}
        <article
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
      </Container>
    </main>
  );
}

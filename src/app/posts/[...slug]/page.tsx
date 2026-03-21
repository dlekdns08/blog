import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmojiReactions } from "@/components/EmojiReactions";
import { CommentSection } from "@/components/CommentSection";
import { PostAttachments } from "@/components/PostAttachments";
import { PostContent } from "@/components/PostContent";
import { PostNav } from "@/components/PostNav";
import { ReadingProgress } from "@/components/ReadingProgress";
import { TableOfContents } from "@/components/TableOfContents";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { CATEGORY_CONFIG } from "@/lib/categories";
import { injectHeadingIds } from "@/lib/headings";

type PageProps = {
  params: Promise<{ slug: string[] }>;
};

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug.split("/") }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const slugStr = slug.map(decodeURIComponent).join("/");
  try {
    const post = await getPostBySlug(slugStr);

    const ogUrl = new URL("/api/og", process.env.NEXT_PUBLIC_SITE_URL ?? "https://koala.ai.kr");
    ogUrl.searchParams.set("title", post.meta.title);
    if (post.meta.category) ogUrl.searchParams.set("category", post.meta.category);
    if (post.meta.date) ogUrl.searchParams.set("date", post.meta.date);

    return {
      title: post.meta.title,
      description: post.meta.description,
      openGraph: {
        title: post.meta.title,
        description: post.meta.description,
        images: [{ url: ogUrl.toString(), width: 1200, height: 630 }],
      },
      twitter: {
        card: "summary_large_image",
        title: post.meta.title,
        description: post.meta.description,
        images: [ogUrl.toString()],
      },
    };
  } catch {
    return { title: "글을 찾을 수 없음" };
  }
}

export default async function PostDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const slugStr = slug.map(decodeURIComponent).join("/");

  let post: Awaited<ReturnType<typeof getPostBySlug>>;
  try {
    post = await getPostBySlug(slugStr);
  } catch {
    notFound();
  }

  // 헤딩 ID 주입 및 목차 추출
  const { html, headings } = injectHeadingIds(post.html);

  // 이전 / 다음 포스트
  const allPosts = await getAllPosts();
  const idx = allPosts.findIndex((p) => p.slug === slugStr);
  const prevPost = idx < allPosts.length - 1 ? allPosts[idx + 1] : null; // 더 오래된
  const nextPost = idx > 0 ? allPosts[idx - 1] : null;                   // 더 최근

  const catConfig = CATEGORY_CONFIG[post.meta.category];
  const categoryLabel = catConfig?.label ?? post.meta.category;

  return (
    <main className="py-10">
      {/* 읽기 진행률 바 */}
      <ReadingProgress />

      <div className="mx-auto w-full max-w-5xl px-6 sm:px-8">
        <div className="xl:flex xl:gap-12">

          {/* ── 메인 컨텐츠 ── */}
          <div className="flex-1 min-w-0">

            {/* 뒤로가기 */}
            <Link
              href={`/posts${post.meta.category ? `?category=${post.meta.category}` : ""}`}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-violet-600 dark:text-zinc-500 dark:hover:text-violet-400 transition-colors mb-8"
            >
              <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 12L6 8l4-4" />
              </svg>
              글 목록
            </Link>

            {/* 포스트 헤더 */}
            <header className="mb-10 space-y-3">
              {categoryLabel && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-widest">
                  <span>{categoryLabel}</span>
                  {post.meta.subcategory && (
                    <>
                      <span className="text-violet-300 dark:text-violet-600">/</span>
                      <span>{post.meta.subcategory}</span>
                    </>
                  )}
                  {post.meta.subSubcategory && (
                    <>
                      <span className="text-violet-300 dark:text-violet-600">/</span>
                      <span>{post.meta.subSubcategory}</span>
                    </>
                  )}
                </div>
              )}
              <h1 className="text-2xl font-bold tracking-tight leading-tight">
                {post.meta.title}
              </h1>
              {post.meta.description && (
                <p className="text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {post.meta.description}
                </p>
              )}
              <time className="block text-xs text-zinc-400 dark:text-zinc-500 tabular-nums pt-1">
                {post.meta.date}
              </time>
            </header>

            {/* 구분선 */}
            <div className="mb-10 h-px bg-black/8 dark:bg-white/8" />

            {/* 본문 */}
            <PostContent html={html} />

            {/* 첨부 파일 */}
            {post.meta.attachments && post.meta.attachments.length > 0 && (
              <PostAttachments attachments={post.meta.attachments} />
            )}

            {/* 이모지 반응 */}
            <div className="mt-12 flex justify-center">
              <EmojiReactions slug={slugStr} />
            </div>

            {/* 이전 / 다음 포스트 */}
            <PostNav prev={prevPost} next={nextPost} />

            {/* 댓글 구분선 */}
            <div className="mt-12 h-px bg-black/8 dark:bg-white/8" />

            {/* 댓글 섹션 */}
            <CommentSection slug={slugStr} />
          </div>

          {/* ── 목차 사이드바 (xl+ 전용) ── */}
          {headings.length >= 2 && (
            <aside className="hidden xl:block w-52 shrink-0">
              <div className="sticky top-10">
                <TableOfContents headings={headings} />
              </div>
            </aside>
          )}
        </div>
      </div>
    </main>
  );
}

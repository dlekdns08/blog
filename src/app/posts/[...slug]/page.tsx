import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { EmojiReactions } from "@/components/EmojiReactions";
import { CommentSection } from "@/components/CommentSection";
import { PostAttachments } from "@/components/PostAttachments";
import { PostContent } from "@/components/PostContent";
import { PostNav } from "@/components/PostNav";
import { ReadingProgress } from "@/components/ReadingProgress";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ShareButton } from "@/components/ShareButton";
import { TableOfContents } from "@/components/TableOfContents";
import { BookmarkButton } from "@/components/BookmarkButton";
import { ViewCounter } from "@/components/ViewCounter";
import { CollapsibleTOC } from "@/components/CollapsibleTOC";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { RelatedPosts } from "@/components/RelatedPosts";
import { SeriesNav } from "@/components/SeriesNav";
import { PostTldr } from "@/components/PostTldr";
import { Backlinks } from "@/components/Backlinks";
import { LastUpdated } from "@/components/LastUpdated";
import { TTSButton } from "@/components/TTSButton";
import { EditSuggestion } from "@/components/EditSuggestion";
import { ReadingPositionRestore } from "@/components/ReadingPositionRestore";
import { ReadHistoryTracker } from "@/components/ReadHistoryTracker";
import { CATEGORY_CONFIG } from "@/lib/categories";
import { injectHeadingIds } from "@/lib/headings";
import { formatDate } from "@/lib/date";
import { getTldr } from "@/lib/tldrs";
import { getBacklinks } from "@/lib/backlinks";

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
    const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://koala.ai.kr";

    // 프론트매터에 image가 있으면 그걸 사용, 없으면 동적 OG 이미지 생성
    const ogImageUrl = post.meta.image
      ? (post.meta.image.startsWith("http") ? post.meta.image : `${BASE}${post.meta.image}`)
      : `${BASE}/api/og?title=${encodeURIComponent(post.meta.title)}&category=${encodeURIComponent(post.meta.category)}&date=${encodeURIComponent(post.meta.date)}`;

    return {
      title: post.meta.title,
      description: post.meta.description,
      alternates: {
        canonical: `${BASE}/posts/${slugStr}`,
      },
      openGraph: {
        title: post.meta.title,
        description: post.meta.description,
        images: [{ url: ogImageUrl, width: 1536, height: 429 }],
      },
      twitter: {
        card: "summary_large_image",
        title: post.meta.title,
        description: post.meta.description,
        images: [{ url: ogImageUrl }],
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

  // allPosts에는 series 정보가 채워져 있음 — 현재 글 메타에도 동일 정보 주입
  const currentMeta = allPosts.find((p) => p.slug === slugStr) ?? post.meta;
  const tldr = await getTldr(slugStr);
  const backlinks = await getBacklinks(slugStr);

  const catConfig = CATEGORY_CONFIG[post.meta.category];
  const categoryLabel = catConfig?.label ?? post.meta.category;

  const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://koala.ai.kr";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.meta.title,
    datePublished: post.meta.date,
    author: { "@type": "Person", name: "이다운 (Koala)" },
    url: `${BASE}/posts/${slugStr}`,
    ...(post.meta.description && { description: post.meta.description }),
  };

  return (
    <main className="py-6 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReadingProgress />
      <ScrollToTop />
      <ReadingPositionRestore slug={slugStr} />
      <ReadHistoryTracker slug={slugStr} />

      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="xl:flex xl:gap-12">

          {/* ── 메인 컨텐츠 — 항상 max-w-3xl 유지 ── */}
          <div className="w-full max-w-3xl mx-auto xl:mx-0 min-w-0">

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
                <div className="flex items-center gap-1.5 text-xs font-semibold text-accent uppercase tracking-widest">
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
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight">
                {post.meta.title}
              </h1>
              {post.meta.description && (
                <p className="text-base text-muted leading-relaxed">
                  {post.meta.description}
                </p>
              )}
              <div className="flex items-center gap-3 pt-1 flex-wrap">
                <time className="text-xs text-subtle tabular-nums">
                  {formatDate(post.meta.date)}
                </time>
                {post.meta.readingTime && (
                  <span className="text-xs text-subtle">
                    · {post.meta.readingTime}분 읽기
                  </span>
                )}
                <LastUpdated date={post.meta.date} updated={post.meta.updated} />
                <ViewCounter slug={slugStr} />
                <div className="flex items-center gap-1 ml-auto">
                  <TTSButton />
                  <BookmarkButton slug={slugStr} title={post.meta.title} />
                  <ShareButton />
                </div>
              </div>
            </header>

            {/* 구분선 */}
            <div className="mb-10 h-px bg-black/8 dark:bg-white/8" />

            {/* 시리즈 네비게이션 */}
            <SeriesNav current={currentMeta} all={allPosts} />

            {/* AI 3줄 요약 */}
            <PostTldr summary={tldr} />

            {/* 인라인 목차 (xl 미만) */}
            {headings.length >= 2 && <CollapsibleTOC headings={headings} />}

            {/* 본문 */}
            <Suspense fallback={
              <article className="prose max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
            }>
              <PostContent html={html} />
            </Suspense>

            {/* 첨부 파일 */}
            {post.meta.attachments && post.meta.attachments.length > 0 && (
              <PostAttachments attachments={post.meta.attachments} />
            )}

            {/* 이모지 반응 */}
            <div className="mt-12 flex justify-center">
              <EmojiReactions slug={slugStr} />
            </div>

            {/* 관련 글 */}
            <RelatedPosts current={post.meta} all={allPosts} />

            {/* 인용 (백링크) */}
            <Backlinks posts={backlinks} />

            {/* 편집 제안 */}
            <div className="mt-8 flex justify-end">
              <EditSuggestion slug={slugStr} />
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

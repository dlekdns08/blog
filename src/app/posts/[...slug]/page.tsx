import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { EmojiReactions } from "@/components/EmojiReactions";
import { CommentSection } from "@/components/CommentSection";
import { PostAttachments } from "@/components/PostAttachments";
import { PostContent } from "@/components/PostContent";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { CATEGORY_CONFIG } from "@/lib/categories";

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
  const slugStr = slug.map(decodeURIComponent).join("/");

  let post: Awaited<ReturnType<typeof getPostBySlug>>;
  try {
    post = await getPostBySlug(slugStr);
  } catch {
    notFound();
  }

  const catConfig = CATEGORY_CONFIG[post.meta.category];
  const categoryLabel = catConfig?.label ?? post.meta.category;

  return (
    <main className="py-10">
      <Container>
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
          {/* 카테고리 경로 */}
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
        <PostContent html={post.html} />

        {/* 첨부 파일 */}
        {post.meta.attachments && post.meta.attachments.length > 0 && (
          <PostAttachments attachments={post.meta.attachments} />
        )}

        {/* 이모지 반응 */}
        <div className="mt-12 flex justify-center">
          <EmojiReactions slug={slugStr} />
        </div>

        {/* 댓글 구분선 */}
        <div className="mt-12 h-px bg-black/8 dark:bg-white/8" />

        {/* 댓글 섹션 */}
        <CommentSection slug={slugStr} />
      </Container>
    </main>
  );
}

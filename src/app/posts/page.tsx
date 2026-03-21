import { Suspense } from "react";
import { Container } from "@/components/Container";
import { PostList } from "@/components/PostList";
import { CategoryNav } from "@/components/CategoryNav";
import { getAllPosts } from "@/lib/posts";
import { buildCategoryTree } from "@/lib/categories";

export const dynamic = 'force-dynamic'

export const metadata = {
  title: "글",
};

export default async function PostsPage() {
  const posts = await getAllPosts();
  const categories = buildCategoryTree(posts);

  return (
    <main className="py-10">
      <Container>

        {/* 페이지 헤더 — 전체 폭 */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">글</h1>
          <p className="mt-1 text-sm text-black/50 dark:text-white/50">
            작성한 글 목록입니다.
          </p>
        </div>

        {/* 본문 2단 레이아웃 */}
        <div className="lg:flex lg:gap-10 lg:items-start">

          {/* 카테고리 네비게이션 */}
          <div className="hidden lg:block w-44 shrink-0 sticky top-10">
            <CategoryNav categories={categories} />
          </div>

          {/* 포스트 목록 */}
          <div className="flex-1 min-w-0">
            <Suspense>
              <PostList posts={posts} />
            </Suspense>
          </div>

        </div>
      </Container>
    </main>
  );
}

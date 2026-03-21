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
        <div className="lg:flex lg:gap-8 lg:items-start">

          {/* 카테고리 네비게이션 (lg+ 왼쪽 고정 패널) */}
          <div className="hidden lg:block w-56 shrink-0 sticky top-10">
            <CategoryNav categories={categories} />
          </div>

          {/* 포스트 목록 */}
          <div className="flex-1 min-w-0">
            <div className="space-y-2 mb-8">
              <h1 className="text-2xl font-semibold tracking-tight">글</h1>
              <p className="text-sm leading-6 text-black/70 dark:text-white/70">
                작성한 글 목록입니다.
              </p>
            </div>

            <Suspense>
              <PostList posts={posts} />
            </Suspense>
          </div>

        </div>
      </Container>
    </main>
  );
}

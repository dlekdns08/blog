import { Suspense } from "react";
import { Container } from "@/components/Container";
import { PostList } from "@/components/PostList";
import { getAllPosts } from "@/lib/posts";

export const dynamic = 'force-dynamic'

export const metadata = {
  title: "글",
};

export default async function PostsPage() {
  const posts = await getAllPosts();

  return (
    <main className="py-10">
      <Container>
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">글</h1>
          <p className="mt-1 text-sm text-black/50 dark:text-white/50">
            작성한 글 목록입니다.
          </p>
        </div>

        <Suspense>
          <PostList posts={posts} />
        </Suspense>
      </Container>
    </main>
  );
}

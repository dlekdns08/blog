import type { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import { BookmarksList } from "@/components/BookmarksList";

export const metadata: Metadata = {
  title: "저장한 글",
  description: "북마크한 글 모아 보기",
};

export default async function BookmarksPage() {
  const posts = await getAllPosts();

  return (
    <main className="py-8 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold">저장한 글</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            브라우저에 저장된 북마크 (서버에 전송되지 않음)
          </p>
        </header>
        <BookmarksList posts={posts} />
      </div>
    </main>
  );
}

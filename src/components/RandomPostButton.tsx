"use client";

import { useRouter } from "next/navigation";
import type { PostMeta } from "@/lib/posts";

export function RandomPostButton({ posts }: { posts: PostMeta[] }) {
  const router = useRouter();

  function goRandom() {
    if (posts.length === 0) return;
    const pick = posts[Math.floor(Math.random() * posts.length)];
    router.push(`/posts/${pick.slug}`);
  }

  return (
    <button
      onClick={goRandom}
      title="랜덤 글 읽기"
      className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2 text-sm text-muted hover:bg-zinc-100/80 hover:text-zinc-800 dark:hover:bg-white/8 dark:hover:text-zinc-200 transition-all duration-150"
    >
      <svg className="size-4 shrink-0 text-subtle" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
      </svg>
      <span className="text-sm">랜덤 글</span>
    </button>
  );
}

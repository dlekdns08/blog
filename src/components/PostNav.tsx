import Link from "next/link";
import type { PostMeta } from "@/lib/posts";
import { CATEGORY_CONFIG } from "@/lib/categories";

type Props = {
  prev: PostMeta | null; // 이전 글 (더 오래된)
  next: PostMeta | null; // 다음 글 (더 최근)
};

function NavCard({
  post,
  direction,
}: {
  post: PostMeta;
  direction: "prev" | "next";
}) {
  const isPrev = direction === "prev";
  return (
    <Link
      href={`/posts/${post.slug}`}
      className={`group flex flex-col h-full rounded-xl border border-black/8 dark:border-white/10 bg-white dark:bg-white/5 p-4 hover:border-violet-200 dark:hover:border-violet-500/30 hover:shadow-sm transition-all duration-150 ${
        isPrev ? "" : "text-right"
      }`}
    >
      <span
        className={`inline-flex items-center gap-1 text-[10px] font-medium text-zinc-400 dark:text-zinc-500 mb-2 ${
          isPrev ? "" : "justify-end"
        }`}
      >
        {isPrev && (
          <svg
            className="size-3"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 16 16"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 12L6 8l4-4"
            />
          </svg>
        )}
        {isPrev ? "이전 글" : "다음 글"}
        {!isPrev && (
          <svg
            className="size-3"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 16 16"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 4l4 4-4 4"
            />
          </svg>
        )}
      </span>
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors line-clamp-2 leading-snug">
        {post.title}
      </span>
      {post.category && (
        <span className="mt-2 text-[10px] text-zinc-400 dark:text-zinc-500">
          {CATEGORY_CONFIG[post.category]?.icon}{" "}
          {CATEGORY_CONFIG[post.category]?.label ?? post.category}
        </span>
      )}
    </Link>
  );
}

export function PostNav({ prev, next }: Props) {
  if (!prev && !next) return null;

  return (
    <div className="mt-10 grid grid-cols-2 gap-3">
      <div>{prev && <NavCard post={prev} direction="prev" />}</div>
      <div>{next && <NavCard post={next} direction="next" />}</div>
    </div>
  );
}

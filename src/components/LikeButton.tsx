"use client";

import { useEffect, useState } from "react";

function getClientId(): string {
  const key = "blog_client_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export function LikeButton({ slug }: { slug: string }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);

  // 초기 좋아요 상태 조회
  useEffect(() => {
    const clientId = getClientId();
    fetch(`/api/likes/${slug}?client_id=${clientId}`)
      .then((r) => r.json())
      .then((data) => {
        setLiked(data.liked);
        setCount(data.count);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  async function toggle() {
    if (pending) return;
    setPending(true);

    // 낙관적 업데이트
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => c + (nextLiked ? 1 : -1));

    try {
      const clientId = getClientId();
      const res = await fetch(`/api/likes/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId }),
      });
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setCount(data.count);
      }
    } catch {
      // 실패 시 롤백
      setLiked(!nextLiked);
      setCount((c) => c + (nextLiked ? -1 : 1));
    } finally {
      setPending(false);
    }
  }

  if (loading) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm text-zinc-400 dark:border-white/10 animate-pulse">
        <span className="size-4 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        <span className="w-8 h-3 rounded bg-zinc-200 dark:bg-zinc-700" />
      </div>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      aria-label={liked ? "좋아요 취소" : "좋아요"}
      className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-150 select-none ${
        liked
          ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
          : "border-black/10 bg-white text-zinc-500 hover:border-red-200 hover:text-red-400 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400 dark:hover:border-red-500/30 dark:hover:text-red-400"
      }`}
    >
      <svg
        className={`size-4 transition-transform duration-150 ${liked ? "scale-110" : "group-hover:scale-110"}`}
        viewBox="0 0 24 24"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={liked ? 0 : 1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
        />
      </svg>
      <span>좋아요</span>
      {count > 0 && (
        <span className="tabular-nums">{count}</span>
      )}
    </button>
  );
}

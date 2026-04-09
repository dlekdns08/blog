"use client";

import { useEffect, useState } from "react";

import { getClientId } from "@/lib/clientId";

const EMOJIS = ["❤️", "👍", "😄", "🤔", "🚀", "🎉"];

type ReactionCount = { emoji: string; count: number; reacted: boolean };

export function EmojiReactions({ slug }: { slug: string }) {
  const [reactions, setReactions] = useState<ReactionCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    const clientId = getClientId();
    fetch(`/api/reactions/${slug}?client_id=${clientId}`)
      .then((r) => r.json())
      .then((data) => setReactions(data.reactions))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  async function toggle(emoji: string) {
    if (pending) return;
    setPending(emoji);

    // 낙관적 업데이트
    setReactions((prev) =>
      prev.map((r) =>
        r.emoji === emoji
          ? { ...r, reacted: !r.reacted, count: r.count + (r.reacted ? -1 : 1) }
          : r
      )
    );

    try {
      const clientId = getClientId();
      const res = await fetch(`/api/reactions/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId, emoji }),
      });
      if (res.ok) {
        const data = await res.json();
        setReactions(data.reactions);
      }
    } catch {
      // 롤백
      setReactions((prev) =>
        prev.map((r) =>
          r.emoji === emoji
            ? { ...r, reacted: !r.reacted, count: r.count + (r.reacted ? -1 : 1) }
            : r
        )
      );
    } finally {
      setPending(null);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-wrap gap-2">
        {EMOJIS.map((e) => (
          <div
            key={e}
            className="h-9 w-14 rounded-full border border-black/10 bg-zinc-100 dark:border-white/10 dark:bg-white/5 animate-pulse"
          />
        ))}
      </div>
    );
  }

  // 서버 응답이 없으면 기본값으로 채움
  const displayReactions =
    reactions.length > 0
      ? reactions
      : EMOJIS.map((e) => ({ emoji: e, count: 0, reacted: false }));

  return (
    <div className="flex flex-wrap gap-2">
      {displayReactions.map(({ emoji, count, reacted }) => (
        <button
          key={emoji}
          onClick={() => toggle(emoji)}
          disabled={pending !== null}
          aria-label={`${emoji} 반응`}
          aria-pressed={reacted}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-150 select-none ${
            reacted
              ? "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300"
              : "border-black/10 bg-white text-zinc-600 hover:border-violet-200 hover:bg-violet-50/50 hover:text-violet-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400 dark:hover:border-violet-500/30 dark:hover:text-violet-400"
          } ${pending !== null ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          <span className={`transition-transform duration-150 ${reacted ? "scale-110" : ""}`}>
            {emoji}
          </span>
          {count > 0 && (
            <span className="tabular-nums text-xs">{count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";

type Ranking = {
  id?: string | number;
  nickname: string;
  score: number;
  created_at?: string;
};

const CLIENT_KEY = "koala_client_id";
const PENDING_KEY = "koala_pending_score";
const NICK_KEY = "koala_nickname";

function getClientId() {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(CLIENT_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(CLIENT_KEY, id);
  }
  return id;
}

export function KoalaRanking() {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState("");
  const [pendingScore, setPendingScore] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/game/rankings?limit=10", { cache: "no-store" });
      const data = await res.json();
      setRankings(Array.isArray(data) ? data : []);
    } catch {
      setRankings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const savedNick = localStorage.getItem(NICK_KEY) ?? "";
    setNickname(savedNick);

    const onGameOver = (e: Event) => {
      const detail = (e as CustomEvent<{ score: number }>).detail;
      if (!detail || typeof detail.score !== "number" || detail.score <= 0) return;
      setPendingScore(detail.score);
      setSubmitted(false);
      localStorage.setItem(PENDING_KEY, String(detail.score));
    };
    window.addEventListener("koala:gameover", onGameOver);
    return () => window.removeEventListener("koala:gameover", onGameOver);
  }, [load]);

  const submit = async () => {
    if (pendingScore == null || submitting) return;
    const nick = nickname.trim().slice(0, 20) || "익명 코알라";
    setSubmitting(true);
    try {
      const res = await fetch("/api/game/rankings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: nick,
          score: pendingScore,
          client_id: getClientId(),
        }),
      });
      const data = await res.json().catch(() => ({ ok: false }));
      if (data?.ok !== false && res.ok) {
        localStorage.setItem(NICK_KEY, nick);
        localStorage.removeItem(PENDING_KEY);
        setSubmitted(true);
        setPendingScore(null);
        await load();
      } else {
        setSubmitted(true);
      }
    } catch {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const skip = () => {
    setPendingScore(null);
    localStorage.removeItem(PENDING_KEY);
  };

  return (
    <section className="mt-10 max-w-[700px] mx-auto w-full">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-bold tracking-tight">🏆 랭킹</h2>
        <span className="text-xs text-zinc-400">TOP 10</span>
        <button
          onClick={load}
          className="ml-auto text-xs px-2.5 py-1 rounded-lg text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/8 transition-colors"
        >
          새로고침
        </button>
      </div>

      {pendingScore != null && !submitted && (
        <div className="mb-4 rounded-2xl border border-violet-200 dark:border-violet-500/25 bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-500/10 dark:to-violet-600/5 p-4">
          <p className="text-sm font-semibold text-violet-700 dark:text-violet-300 mb-1">
            새 기록: {pendingScore}점
          </p>
          <p className="text-xs text-muted mb-3">
            닉네임을 입력하고 랭킹에 등록해보세요.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
              placeholder="익명 코알라"
              maxLength={20}
              className="flex-1 rounded-lg px-3 py-2 text-sm bg-panel border border-line focus:outline-none focus:border-violet-400 dark:focus:border-violet-500/60"
            />
            <button
              onClick={submit}
              disabled={submitting}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-violet-500 text-white hover:bg-violet-600 disabled:opacity-50 transition-colors"
            >
              {submitting ? "등록 중…" : "등록"}
            </button>
            <button
              onClick={skip}
              className="px-3 py-2 rounded-lg text-sm text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/8 transition-colors"
            >
              건너뛰기
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-line bg-panel/40 overflow-hidden">
        {loading ? (
          <p className="text-sm text-zinc-400 text-center py-10">불러오는 중…</p>
        ) : rankings.length === 0 ? (
          <p className="text-sm text-zinc-400 text-center py-10">
            아직 등록된 기록이 없습니다. 1등의 주인공이 되어보세요!
          </p>
        ) : (
          <ol className="divide-y divide-black/5 dark:divide-white/5">
            {rankings.map((r, i) => {
              const rank = i + 1;
              const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
              return (
                <li
                  key={r.id ?? `${r.nickname}-${i}`}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm"
                >
                  <span className={`w-7 text-center font-bold tabular-nums ${rank <= 3 ? "text-amber-500" : "text-zinc-400"}`}>
                    {medal ?? rank}
                  </span>
                  <span className="flex-1 truncate text-zinc-800 dark:text-zinc-100">
                    {r.nickname || "익명 코알라"}
                  </span>
                  <span className="font-bold tabular-nums text-accent">
                    {r.score.toLocaleString()}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Event = {
  id: string;
  type: string;
  repo: { name: string };
  created_at: string;
  payload?: { commits?: { message: string }[] };
};

type SimplifiedEvent = {
  id: string;
  repo: string;
  message: string;
  date: string;
};

const TYPE_LABEL: Record<string, string> = {
  PushEvent: "🟢 push",
  CreateEvent: "🆕 create",
  PullRequestEvent: "🔁 PR",
  IssuesEvent: "🐞 issue",
  WatchEvent: "⭐ star",
  ForkEvent: "🍴 fork",
};

function summarize(e: Event): string {
  if (e.type === "PushEvent" && e.payload?.commits?.[0]) {
    return e.payload.commits[0].message.split("\n")[0].slice(0, 60);
  }
  return TYPE_LABEL[e.type] ?? e.type;
}

/**
 * GitHub 최근 공개 활동을 사이드바에 표시.
 * NEXT_PUBLIC_GITHUB_USER 환경변수가 있으면 활성화.
 * 1시간 캐시 (sessionStorage).
 */
export function GitHubActivityWidget() {
  const user = process.env.NEXT_PUBLIC_GITHUB_USER;
  const [events, setEvents] = useState<SimplifiedEvent[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user) return;
    const cacheKey = `gh_events:${user}`;
    try {
      const raw = sessionStorage.getItem(cacheKey);
      if (raw) {
        const cached = JSON.parse(raw);
        if (cached.expires > Date.now()) {
          setEvents(cached.data);
          return;
        }
      }
    } catch {}

    fetch(`https://api.github.com/users/${user}/events/public?per_page=5`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Event[] | null) => {
        if (!data) {
          setError(true);
          return;
        }
        const simplified: SimplifiedEvent[] = data.slice(0, 5).map((e) => ({
          id: e.id,
          repo: e.repo.name,
          message: summarize(e),
          date: e.created_at,
        }));
        setEvents(simplified);
        try {
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({ data: simplified, expires: Date.now() + 60 * 60 * 1000 })
          );
        } catch {}
      })
      .catch(() => setError(true));
  }, [user]);

  if (!user || error) return null;
  if (!events) {
    return (
      <div className="rounded-xl border border-line bg-surface p-3 text-xs text-subtle">
        GitHub 활동 로딩 중...
      </div>
    );
  }
  if (events.length === 0) return null;

  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-subtle">
          GitHub
        </span>
        <Link
          href={`https://github.com/${user}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-accent hover:underline"
        >
          @{user}
        </Link>
      </div>
      <ul className="space-y-1.5">
        {events.map((e) => (
          <li key={e.id} className="text-xs">
            <Link
              href={`https://github.com/${e.repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:text-accent transition-colors"
            >
              <p className="text-body line-clamp-1">{e.message}</p>
              <p className="text-[10px] text-subtle truncate">{e.repo}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

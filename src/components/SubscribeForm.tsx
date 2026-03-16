"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.koala.ai.kr";

export function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch(`${API_URL}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? "오류 발생");
      setStatus("done");
      setMessage(data.message);
      setEmail("");
    } catch (err: unknown) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "오류가 발생했습니다.");
    }
  }

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2.5">
        <svg className="size-3.5 text-violet-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
        </svg>
        <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
          새 글 알림 받기
        </p>
      </div>
      {status === "done" ? (
        <p className="text-xs text-violet-600 dark:text-violet-400 leading-relaxed">{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            type="email"
            required
            placeholder="이메일 주소"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-violet-200 dark:border-violet-500/25 bg-white dark:bg-zinc-900/50 px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-300 dark:focus:ring-violet-500/40 transition-shadow"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-50 px-3 py-1.5 text-xs font-semibold text-white transition-colors shadow-sm"
          >
            {status === "loading" ? "전송 중..." : "구독하기"}
          </button>
          {status === "error" && (
            <p className="text-xs text-red-500">{message}</p>
          )}
        </form>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://5.104.87.242:8000";

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
    <div className="mt-4">
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
        새 글 알림 받기
      </p>
      {status === "done" ? (
        <p className="text-xs text-violet-600 dark:text-violet-400">{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-1.5">
          <input
            type="email"
            required
            placeholder="이메일 주소"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-md bg-violet-600 hover:bg-violet-700 disabled:opacity-50 px-2.5 py-1.5 text-xs font-medium text-white transition-colors"
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

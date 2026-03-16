"use client";

import { useEffect, useRef, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.koala.ai.kr";

interface Comment {
  id: number;
  nickname: string;
  content: string;
  created_at: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── 댓글 아이템 ────────────────────────────────────────────

function CommentItem({
  comment,
  slug,
  onDeleted,
}: {
  comment: Comment;
  slug: string;
  onDeleted: (id: number) => void;
}) {
  const [showDelete, setShowDelete] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!password) return;
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/posts/${slug}/comments/${comment.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        onDeleted(comment.id);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.detail ?? "삭제에 실패했습니다.");
      }
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="group rounded-xl border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {/* 아바타 */}
          <div className="size-7 rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-violet-600 dark:text-violet-300">
              {comment.nickname.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">
            {comment.nickname}
          </span>
          <time className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0">
            {formatDate(comment.created_at)}
          </time>
        </div>

        <button
          onClick={() => {
            setShowDelete((v) => !v);
            setError("");
            setPassword("");
          }}
          className="text-xs text-zinc-400 hover:text-red-400 dark:text-zinc-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0"
        >
          삭제
        </button>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
        {comment.content}
      </p>

      {/* 삭제 폼 */}
      {showDelete && (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleDelete()}
            placeholder="비밀번호 입력"
            className="flex-1 rounded-lg border border-black/10 bg-zinc-50 px-3 py-1.5 text-xs outline-none focus:border-red-300 focus:ring-1 focus:ring-red-100 dark:border-white/10 dark:bg-white/5 dark:focus:border-red-500/40 dark:focus:ring-red-500/10"
          />
          <button
            onClick={handleDelete}
            disabled={deleting || !password}
            className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            {deleting ? "삭제 중…" : "확인"}
          </button>
        </div>
      )}
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── 댓글 작성 폼 ───────────────────────────────────────────

function CommentForm({
  slug,
  onCreated,
}: {
  slug: string;
  onCreated: (comment: Comment) => void;
}) {
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/posts/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, password, content }),
      });

      if (res.ok) {
        const created: Comment = await res.json();
        onCreated(created);
        setContent("");
        // nickname/password는 유지 (연속 작성 편의)
      } else {
        const data = await res.json().catch(() => ({}));
        if (data.detail) {
          const msg = Array.isArray(data.detail)
            ? data.detail.map((d: { msg: string }) => d.msg).join(", ")
            : data.detail;
          setError(msg);
        } else {
          setError("댓글 작성에 실패했습니다.");
        }
      }
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임"
          required
          maxLength={50}
          className="flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none placeholder:text-zinc-400 focus:border-violet-300 focus:ring-2 focus:ring-violet-100 dark:border-white/10 dark:bg-white/5 dark:placeholder:text-zinc-500 dark:focus:border-violet-500/40 dark:focus:ring-violet-500/10 transition-shadow"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호 (삭제용)"
          required
          minLength={4}
          className="flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none placeholder:text-zinc-400 focus:border-violet-300 focus:ring-2 focus:ring-violet-100 dark:border-white/10 dark:bg-white/5 dark:placeholder:text-zinc-500 dark:focus:border-violet-500/40 dark:focus:ring-violet-500/10 transition-shadow"
        />
      </div>

      <textarea
        ref={contentRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="댓글을 작성해주세요..."
        required
        rows={3}
        maxLength={1000}
        className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none resize-none placeholder:text-zinc-400 focus:border-violet-300 focus:ring-2 focus:ring-violet-100 dark:border-white/10 dark:bg-white/5 dark:placeholder:text-zinc-500 dark:focus:border-violet-500/40 dark:focus:ring-violet-500/10 transition-shadow"
      />

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400">{content.length} / 1000</span>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60 transition-colors"
        >
          {submitting ? "등록 중…" : "댓글 등록"}
        </button>
      </div>
    </form>
  );
}

// ── 메인 컴포넌트 ──────────────────────────────────────────

export function CommentSection({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/posts/${slug}/comments`)
      .then((r) => r.json())
      .then((data) => setComments(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  function handleCreated(comment: Comment) {
    setComments((prev) => [...prev, comment]);
  }

  function handleDeleted(id: number) {
    setComments((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <section className="mt-14 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold">댓글</h2>
        {comments.length > 0 && (
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-white/10 dark:text-zinc-400">
            {comments.length}
          </span>
        )}
      </div>

      {/* 댓글 목록 */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 rounded-xl border border-black/8 bg-zinc-50 animate-pulse dark:border-white/10 dark:bg-white/5" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="py-6 text-center text-sm text-zinc-400 dark:text-zinc-500">
          첫 번째 댓글을 남겨보세요 🐨
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              slug={slug}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}

      {/* 구분선 */}
      <div className="h-px bg-black/8 dark:bg-white/8" />

      {/* 작성 폼 */}
      <CommentForm slug={slug} onCreated={handleCreated} />
    </section>
  );
}

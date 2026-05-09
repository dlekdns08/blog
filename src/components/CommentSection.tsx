"use client";

import { useEffect, useRef, useState } from "react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.koala.ai.kr";

interface Comment {
  id: number;
  nickname: string;
  content: string;
  created_at: string;
  parent_id: number | null;
  replies: Comment[];
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

// ── 댓글 작성 폼 ───────────────────────────────────────────

function CommentForm({
  slug,
  parentId = null,
  onCreated,
  onCancel,
  autoFocus = false,
}: {
  slug: string;
  parentId?: number | null;
  onCreated: (comment: Comment) => void;
  onCancel?: () => void;
  autoFocus?: boolean;
}) {
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus();
  }, [autoFocus]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/posts/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, password, content, parent_id: parentId }),
      });

      if (res.ok) {
        const created: Comment = await res.json();
        onCreated(created);
        setContent("");
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

  const isReply = parentId !== null;

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
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
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={isReply ? "답글을 작성해주세요..." : "댓글을 작성해주세요..."}
        required
        rows={isReply ? 2 : 3}
        maxLength={1000}
        className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none resize-none placeholder:text-zinc-400 focus:border-violet-300 focus:ring-2 focus:ring-violet-100 dark:border-white/10 dark:bg-white/5 dark:placeholder:text-zinc-500 dark:focus:border-violet-500/40 dark:focus:ring-violet-500/10 transition-shadow"
      />

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400">{content.length} / 1000</span>
        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              취소
            </button>
          )}
          <PrimaryButton type="submit" size="sm" disabled={submitting}>
            {submitting ? "등록 중…" : isReply ? "답글 등록" : "댓글 등록"}
          </PrimaryButton>
        </div>
      </div>
    </form>
  );
}

// ── 댓글 아이템 ────────────────────────────────────────────

function CommentItem({
  comment,
  slug,
  onDeleted,
  onReplyCreated,
  isReply = false,
}: {
  comment: Comment;
  slug: string;
  onDeleted: (id: number, parentId: number | null) => void;
  onReplyCreated?: (parentId: number, reply: Comment) => void;
  isReply?: boolean;
}) {
  const [showDelete, setShowDelete] = useState(false);
  const [password, setPassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);

  async function handleDelete() {
    if (!password) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(`${API_URL}/posts/${slug}/comments/${comment.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        onDeleted(comment.id, comment.parent_id);
      } else {
        const data = await res.json().catch(() => ({}));
        setDeleteError(data.detail ?? "삭제에 실패했습니다.");
      }
    } catch {
      setDeleteError("네트워크 오류가 발생했습니다.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className={`group rounded-xl border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-white/5 ${isReply ? "rounded-tl-none" : ""}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`size-6 rounded-full flex items-center justify-center shrink-0 ${isReply ? "bg-zinc-100 dark:bg-white/10" : "bg-violet-100 dark:bg-violet-500/20"}`}>
              <span className={`text-xs font-semibold ${isReply ? "text-muted" : "text-violet-600 dark:text-violet-300"}`}>
                {comment.nickname.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-semibold text-body truncate">
              {comment.nickname}
            </span>
            <time className="text-xs text-subtle shrink-0">
              {formatDate(comment.created_at)}
            </time>
          </div>

          <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-all">
            {!isReply && (
              <button
                onClick={() => {
                  setShowReplyForm((v) => !v);
                  setShowDelete(false);
                }}
                className="text-xs text-zinc-400 hover:text-violet-500 dark:text-zinc-500 dark:hover:text-violet-400 transition-colors"
              >
                답글
              </button>
            )}
            <button
              onClick={() => {
                setShowDelete((v) => !v);
                setShowReplyForm(false);
                setDeleteError("");
                setPassword("");
              }}
              className="text-xs text-zinc-400 hover:text-red-400 dark:text-zinc-500 dark:hover:text-red-400 transition-colors"
            >
              삭제
            </button>
          </div>
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
        {deleteError && <p className="mt-1.5 text-xs text-red-500">{deleteError}</p>}
      </div>

      {/* 답글 작성 폼 */}
      {showReplyForm && (
        <div className="ml-6 mt-1.5 pl-3 border-l-2 border-violet-200 dark:border-violet-500/30">
          <div className="rounded-xl border border-violet-200/60 bg-violet-50/40 p-3 dark:border-violet-500/20 dark:bg-violet-500/5">
            <CommentForm
              slug={slug}
              parentId={comment.id}
              onCreated={(reply) => {
                onReplyCreated?.(comment.id, reply);
                setShowReplyForm(false);
              }}
              onCancel={() => setShowReplyForm(false)}
              autoFocus
            />
          </div>
        </div>
      )}

      {/* 대댓글 목록 */}
      {comment.replies.length > 0 && (
        <div className="ml-6 mt-1.5 pl-3 border-l-2 border-zinc-100 dark:border-white/10 space-y-1.5">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              slug={slug}
              onDeleted={onDeleted}
              isReply
            />
          ))}
        </div>
      )}
    </div>
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

  const totalCount = comments.reduce((sum, c) => sum + 1 + c.replies.length, 0);

  function handleCreated(comment: Comment) {
    setComments((prev) => [...prev, { ...comment, replies: [] }]);
  }

  function handleDeleted(id: number, parentId: number | null) {
    if (parentId === null) {
      // 원댓글 삭제 (대댓글도 함께 사라짐)
      setComments((prev) => prev.filter((c) => c.id !== id));
    } else {
      // 대댓글 삭제
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? { ...c, replies: c.replies.filter((r) => r.id !== id) }
            : c
        )
      );
    }
  }

  function handleReplyCreated(parentId: number, reply: Comment) {
    setComments((prev) =>
      prev.map((c) =>
        c.id === parentId
          ? { ...c, replies: [...c.replies, reply] }
          : c
      )
    );
  }

  return (
    <section className="mt-14 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold">댓글</h2>
        {totalCount > 0 && (
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-white/10 dark:text-zinc-400">
            {totalCount}
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
        <p className="py-6 text-center text-sm text-subtle">
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
              onReplyCreated={handleReplyCreated}
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

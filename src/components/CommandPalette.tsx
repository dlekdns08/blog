"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { PostMeta } from "@/lib/posts";
import { CATEGORY_CONFIG } from "@/lib/categories";

type Props = {
  posts: PostMeta[];
  open: boolean;
  onClose: () => void;
};

function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 rounded-sm not-italic">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export function CommandPalette({ posts, open, onClose }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? posts
        .filter(
          (p) =>
            p.title.toLowerCase().includes(query.toLowerCase()) ||
            p.description?.toLowerCase().includes(query.toLowerCase()) ||
            (CATEGORY_CONFIG[p.category]?.label ?? p.category)
              .toLowerCase()
              .includes(query.toLowerCase())
        )
        .slice(0, 8)
    : posts.slice(0, 8);

  const navigate = useCallback(
    (post: PostMeta) => {
      const q = query.trim();
      const url = q
        ? `/posts/${post.slug}?q=${encodeURIComponent(q)}`
        : `/posts/${post.slug}`;
      router.push(url);
      onClose();
    },
    [router, onClose, query]
  );

  // 열릴 때 초기화 + 포커스
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // query 변경 시 선택 초기화
  useEffect(() => {
    setSelected(0);
  }, [query]);

  // 키보드 핸들러
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, filtered.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      }
      if (e.key === "Enter" && filtered[selected]) {
        navigate(filtered[selected]);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, filtered, selected, navigate, onClose]);

  // 선택 항목 스크롤
  useEffect(() => {
    const item = listRef.current?.children[selected] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  // 포커스 트랩
  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    function onTab(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    }
    dialog.addEventListener("keydown", onTab);
    return () => dialog.removeEventListener("keydown", onTab);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-4"
      style={{ paddingTop: "15vh" }}
      onClick={onClose}
    >
      {/* 백드롭 */}
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="명령어 팔레트"
        className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 검색 입력 */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-black/8 dark:border-white/8">
          <svg
            className="size-4 text-zinc-400 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 15.803a7.5 7.5 0 0 0 10.607 0Z"
            />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="포스트 검색..."
            className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none"
          />
          <kbd className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-white/8 rounded px-1.5 py-0.5 leading-5">
            esc
          </kbd>
        </div>

        {/* 결과 목록 */}
        <ul ref={listRef} className="max-h-80 overflow-y-auto py-1.5">
          {filtered.length === 0 ? (
            <li className="px-4 py-10 text-center text-sm text-zinc-400">
              검색 결과가 없습니다.
            </li>
          ) : (
            filtered.map((post, i) => {
              const isSelected = i === selected;
              const catIcon = CATEGORY_CONFIG[post.category]?.icon ?? "📝";
              return (
                <li key={post.slug}>
                  <button
                    onClick={() => navigate(post)}
                    onMouseEnter={() => setSelected(i)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      isSelected
                        ? "bg-violet-50 dark:bg-violet-500/10"
                        : "hover:bg-zinc-50 dark:hover:bg-white/5"
                    }`}
                  >
                    <span className="text-base w-5 text-center shrink-0 leading-none">
                      {catIcon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          isSelected
                            ? "text-violet-700 dark:text-violet-300"
                            : "text-zinc-800 dark:text-zinc-200"
                        }`}
                      >
                        {highlight(post.title, query)}
                      </p>
                      {post.description && (
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                          {post.description}
                        </p>
                      )}
                    </div>
                    <time className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0 tabular-nums">
                      {post.date}
                    </time>
                  </button>
                </li>
              );
            })
          )}
        </ul>

        {/* 하단 힌트 바 */}
        <div className="px-4 py-2 border-t border-black/8 dark:border-white/8 flex items-center gap-4 text-[10px] text-zinc-400 dark:text-zinc-500">
          <span>
            <kbd className="font-semibold">↑↓</kbd> 이동
          </span>
          <span>
            <kbd className="font-semibold">↵</kbd> 열기
          </span>
          <span>
            <kbd className="font-semibold">esc</kbd> 닫기
          </span>
          <span className="ml-auto">{filtered.length}개 결과</span>
        </div>
      </div>
    </div>
  );
}

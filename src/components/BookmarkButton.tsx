"use client";

import { useEffect, useState } from "react";

const KEY = "koala_bookmarks";

function getBookmarks(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveBookmarks(slugs: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(slugs));
  } catch { /* ignore */ }
}

export function BookmarkButton({ slug, title }: { slug: string; title: string }) {
  const [saved, setSaved] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    setSaved(getBookmarks().includes(slug));
  }, [slug]);

  function toggle() {
    const current = getBookmarks();
    let next: string[];
    if (current.includes(slug)) {
      next = current.filter((s) => s !== slug);
    } else {
      next = [slug, ...current];
    }
    saveBookmarks(next);
    setSaved(!current.includes(slug));
    setFlash(true);
    setTimeout(() => setFlash(false), 600);

    // Dispatch event so BookmarksWidget updates live
    window.dispatchEvent(new CustomEvent("bookmarks-changed"));
  }

  return (
    <button
      onClick={toggle}
      aria-label={saved ? `"${title}" 북마크 해제` : `"${title}" 북마크에 저장`}
      title={saved ? "북마크 해제" : "북마크에 저장"}
      className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-all duration-200 ${
        flash ? "scale-125" : "scale-100"
      } ${
        saved
          ? "text-amber-500 dark:text-amber-400"
          : "text-zinc-400 hover:text-amber-500 dark:text-zinc-500 dark:hover:text-amber-400"
      }`}
    >
      <svg
        className="size-4"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={1.75}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
        />
      </svg>
    </button>
  );
}

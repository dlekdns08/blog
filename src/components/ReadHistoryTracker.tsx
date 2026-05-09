"use client";

import { useEffect } from "react";

const KEY = "koala_read_history";

/**
 * 글 페이지 방문 시 slug를 localStorage에 누적.
 * ReadingMap 위젯이 이 데이터를 읽음.
 */
export function ReadHistoryTracker({ slug }: { slug: string }) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const arr = raw ? (JSON.parse(raw) as string[]) : [];
      if (!arr.includes(slug)) {
        arr.push(slug);
        localStorage.setItem(KEY, JSON.stringify(arr));
        window.dispatchEvent(new Event("read-history-changed"));
      }
    } catch {
      // ignore
    }
  }, [slug]);

  return null;
}

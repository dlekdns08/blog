"use client";

import { useEffect } from "react";

/**
 * 글 읽던 스크롤 위치를 sessionStorage에 저장하고
 * 같은 글 재방문 시 복원한다. (서버 전송 0)
 */
export function ReadingPositionRestore({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `read_pos:${slug}`;

    // 복원 — 페이지 마운트 후 약간 기다렸다가 (이미지 로드 등 레이아웃 안정화)
    const restoreTimer = window.setTimeout(() => {
      try {
        const saved = Number(sessionStorage.getItem(key) ?? "0");
        if (saved > 200) {
          window.scrollTo({ top: saved, behavior: "instant" as ScrollBehavior });
        }
      } catch {}
    }, 60);

    let raf = 0;
    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        try {
          sessionStorage.setItem(key, String(window.scrollY));
        } catch {}
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.clearTimeout(restoreTimer);
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [slug]);

  return null;
}

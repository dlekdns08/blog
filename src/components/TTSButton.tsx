"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** 읽을 텍스트 노드의 root selector (기본: 'article.prose') */
  selector?: string;
};

/**
 * Web Speech API 기반 글 낭독.
 * 외부 의존 0, 한국어 OS 음성 사용.
 */
export function TTSButton({ selector = "article.prose" }: Props) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSupported(true);
    }
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!supported) return null;

  function start() {
    const root = document.querySelector(selector) as HTMLElement | null;
    if (!root) return;
    // pre/code 블록 제외 (긴 코드 낭독은 무의미)
    const clone = root.cloneNode(true) as HTMLElement;
    clone.querySelectorAll("pre, code, .mermaid-rendered").forEach((el) => el.remove());
    const text = clone.textContent?.trim() ?? "";
    if (!text) return;

    const u = new SpeechSynthesisUtterance(text.slice(0, 12000));
    u.lang = "ko-KR";
    u.rate = 1.05;
    u.pitch = 1;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    utterRef.current = u;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    setSpeaking(true);
  }

  function stop() {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  return (
    <button
      onClick={speaking ? stop : start}
      aria-label={speaking ? "낭독 정지" : "글 듣기"}
      title={speaking ? "낭독 정지" : "글 듣기"}
      className="inline-flex items-center justify-center size-7 rounded-md text-subtle hover:text-accent hover:bg-line transition-colors"
    >
      {speaking ? (
        <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </svg>
      ) : (
        <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
        </svg>
      )}
    </button>
  );
}

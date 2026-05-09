"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const LABELS: Record<string, string> = {
  ko: "KO",
  en: "EN",
};

type Props = {
  /** 사용 가능한 번역 언어 코드 목록 (기본 'ko' 외 추가) */
  availableLanguages: string[];
};

/**
 * 글 페이지 우측 상단 언어 토글 버튼.
 * URL ?lang=en|ko로 전환. 'ko'(원본)는 항상 사용 가능.
 */
export function LangToggle({ availableLanguages }: Props) {
  const pathname = usePathname();
  const sp = useSearchParams();
  const current = sp.get("lang") ?? "ko";

  // ko는 항상 가능, 그 외는 cache 보유 여부에 따라
  const langs = ["ko", ...availableLanguages.filter((l) => l !== "ko")];
  if (langs.length < 2) return null;

  function hrefFor(lang: string): string {
    const params = new URLSearchParams(sp.toString());
    if (lang === "ko") params.delete("lang");
    else params.set("lang", lang);
    const qs = params.toString();
    return `${pathname}${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="inline-flex items-center gap-0.5 rounded-md border border-line bg-surface p-0.5">
      {langs.map((lang) => {
        const active = current === lang;
        return (
          <Link
            key={lang}
            href={hrefFor(lang)}
            scroll={false}
            className={`px-1.5 py-0.5 text-[10px] font-semibold rounded transition-colors ${
              active
                ? "bg-violet-600 text-white"
                : "text-subtle hover:text-body"
            }`}
          >
            {LABELS[lang] ?? lang.toUpperCase()}
          </Link>
        );
      })}
    </div>
  );
}

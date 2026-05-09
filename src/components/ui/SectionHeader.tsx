import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** 사이트 액센트(보라) 색을 쓸지 (기본은 subtle gray) */
  accent?: boolean;
  /** 우측에 끝부분에 표시할 보조 요소 (e.g. "더 보기" 링크) */
  action?: ReactNode;
  className?: string;
};

/**
 * 통일된 섹션 헤더 — `text-xs font-semibold uppercase tracking-widest`.
 * "관련 글", "오늘의 논문", "3줄 요약" 등의 라벨 톤에 사용.
 */
export function SectionHeader({
  children,
  accent = false,
  action,
  className = "",
}: Props) {
  const tone = accent ? "text-accent" : "text-subtle";
  return (
    <div className={`flex items-center justify-between mb-3 ${className}`}>
      <h2
        className={`text-xs font-semibold uppercase tracking-widest ${tone}`}
      >
        {children}
      </h2>
      {action}
    </div>
  );
}

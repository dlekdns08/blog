import type { ReactNode, HTMLAttributes } from "react";

type Variant = "surface" | "panel";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: Variant;
  children: ReactNode;
};

/**
 * 통일된 카드 베이스 — `rounded-xl border border-line` + variant별 배경.
 * 패딩/hover 등은 className으로 전달.
 *
 * - variant="surface" (기본): 일반 카드 (bg-surface)
 * - variant="panel": 강조 패널/모달 (bg-panel)
 */
export function Card({
  variant = "surface",
  className = "",
  children,
  ...rest
}: CardProps) {
  const bg = variant === "panel" ? "bg-panel" : "bg-surface";
  return (
    <div className={`rounded-xl border border-line ${bg} ${className}`} {...rest}>
      {children}
    </div>
  );
}

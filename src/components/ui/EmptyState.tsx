import type { ReactNode } from "react";

type Props = {
  /** 아이콘 또는 이모지 */
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

/**
 * 빈 상태 표시 — "데이터 없음", "검색 결과가 없습니다" 등.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: Props) {
  return (
    <div
      className={`rounded-xl border border-line p-8 text-center ${className}`}
    >
      {icon && <div className="mb-3 text-3xl">{icon}</div>}
      <p className="text-sm text-muted mb-1">{title}</p>
      {description && (
        <p className="text-xs text-subtle">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

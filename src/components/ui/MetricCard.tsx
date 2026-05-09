import type { ReactNode } from "react";
import { Card } from "./Card";

type Props = {
  label: string;
  value: number | string | null | undefined;
  /** 값 옆에 표시할 단위 (e.g. "분", "%") */
  unit?: string;
  /** 보조 정보 (값 아래 작은 글씨) */
  hint?: ReactNode;
  className?: string;
};

/**
 * 라벨 + 큰 숫자 형태의 메트릭 카드.
 * 통계/대시보드에서 KPI 표시에 사용.
 */
export function MetricCard({ label, value, unit, hint, className = "" }: Props) {
  const display =
    value === null || value === undefined
      ? "—"
      : typeof value === "number"
      ? value.toLocaleString()
      : value;

  return (
    <Card className={`p-3 ${className}`}>
      <div className="text-[11px] text-subtle">{label}</div>
      <div className="text-lg font-semibold tabular-nums mt-0.5 text-foreground">
        {display}
        {unit && <span className="text-xs text-muted ml-1">{unit}</span>}
      </div>
      {hint && <div className="text-[10px] text-subtle mt-1">{hint}</div>}
    </Card>
  );
}

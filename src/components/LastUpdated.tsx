import { formatDate } from "@/lib/date";

type Props = {
  date: string;        // 최초 작성일
  updated?: string;    // 수정일
};

/**
 * 글 헤더 옆에 "마지막 수정 X" 표시.
 * 수정일이 작성일과 같거나 없으면 표시 안 함.
 */
export function LastUpdated({ date, updated }: Props) {
  if (!updated) return null;
  const d = Date.parse(date);
  const u = Date.parse(updated);
  if (Number.isNaN(u) || Number.isNaN(d) || u <= d) return null;

  return (
    <span
      className="text-xs text-subtle"
      title={`작성일: ${formatDate(date)} · 수정일: ${formatDate(updated)}`}
    >
      · 마지막 수정 {formatDate(updated)}
    </span>
  );
}

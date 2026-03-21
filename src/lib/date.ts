/**
 * "2025-03-21", "2025.03.21" 등 다양한 형식을 Date로 파싱합니다.
 */
function parseDate(dateStr: string): Date | null {
  const normalized = dateStr
    .replace(/년\s*/g, "-")
    .replace(/월\s*/g, "-")
    .replace(/일/g, "")
    .replace(/\./g, "-")
    .trim();
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? null : d;
}

/** "2025년 3월 21일" 형태로 반환 */
export function formatDate(dateStr: string): string {
  const d = parseDate(dateStr);
  if (!d) return dateStr;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

/**
 * 7일 이내: "3일 전" / 그 이전: "2025년 3월 21일"
 * 클라이언트 컴포넌트에서만 사용 — 서버 빌드 시 current time이 고정되므로.
 */
export function formatRelativeDate(dateStr: string): string {
  const d = parseDate(dateStr);
  if (!d) return dateStr;

  const diffMs = Date.now() - d.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffDays < 0) return formatDate(dateStr);
  if (diffDays === 0) return "오늘";
  if (diffDays === 1) return "어제";
  if (diffDays < 7) return `${diffDays}일 전`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;
  return formatDate(dateStr);
}

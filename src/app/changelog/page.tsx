import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { Container } from "@/components/Container";

export const metadata = {
  title: "업데이트 기록",
};

// ── 타입 ───────────────────────────────────────────────────
interface ChangelogEntry {
  hash: string;
  type: string;
  typeLabel: string;
  scope: string | null;
  description: string;
}

interface ChangelogDay {
  date: string;
  entries: ChangelogEntry[];
}

// ── 타입별 색상 ────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
  feat: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  fix: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
  style: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400",
  refactor: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  docs: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  perf: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400",
  chore: "bg-zinc-100 text-zinc-600 dark:bg-zinc-500/20 dark:text-zinc-400",
};

function getTypeColor(type: string) {
  return TYPE_COLORS[type] ?? TYPE_COLORS.chore;
}

// ── 날짜 포맷 ──────────────────────────────────────────────
function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekday = weekdays[d.getDay()];
  return `${year}년 ${month}월 ${day}일 (${weekday})`;
}

// ── 데이터 로드 ────────────────────────────────────────────
function loadChangelog(): ChangelogDay[] {
  const filePath = resolve(process.cwd(), "content", "changelog.json");
  if (!existsSync(filePath)) return [];
  const raw = readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

// ── 페이지 ─────────────────────────────────────────────────
export default function ChangelogPage() {
  const changelog = loadChangelog();

  const totalCommits = changelog.reduce(
    (sum, day) => sum + day.entries.length,
    0,
  );

  return (
    <main className="py-12">
      <Container>
        <article className="space-y-8">
          {/* 헤더 */}
          <header className="space-y-3 pb-6 border-b border-[var(--border)]">
            <h1 className="text-2xl font-bold tracking-tight">
              업데이트 기록
            </h1>
            <p className="text-sm text-[var(--muted)]">
              블로그의 변경사항을 기록합니다. 총{" "}
              <strong className="text-[var(--foreground)]">
                {totalCommits}
              </strong>
              건의 업데이트가{" "}
              <strong className="text-[var(--foreground)]">
                {changelog.length}
              </strong>
              일에 걸쳐 기록되었습니다.
            </p>
            <p className="text-xs text-[var(--muted)]">
              <code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-white/8 text-[11px]">
                npm run changelog
              </code>
              {" "}명령으로 최신 커밋 기반으로 자동 생성됩니다.
            </p>
          </header>

          {/* 타임라인 */}
          {changelog.length === 0 ? (
            <p className="text-sm text-[var(--muted)] text-center py-12">
              아직 기록된 업데이트가 없습니다.
            </p>
          ) : (
            <div className="space-y-8">
              {changelog.map((day) => (
                <section key={day.date} className="relative">
                  {/* 날짜 헤더 */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="size-2.5 rounded-full bg-violet-500 dark:bg-violet-400 shrink-0 ring-4 ring-violet-100 dark:ring-violet-500/15" />
                    <h2 className="text-sm font-semibold">
                      {formatDate(day.date)}
                    </h2>
                    <span className="text-xs text-[var(--muted)]">
                      {day.entries.length}건
                    </span>
                  </div>

                  {/* 커밋 목록 */}
                  <div className="ml-[5px] border-l-2 border-zinc-200 dark:border-white/10 pl-5 space-y-2">
                    {day.entries.map((entry) => (
                      <div
                        key={entry.hash}
                        className="flex items-start gap-2.5 text-sm"
                      >
                        <span
                          className={`shrink-0 mt-0.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${getTypeColor(entry.type)}`}
                        >
                          {entry.typeLabel}
                        </span>
                        <span className="text-[var(--foreground)] leading-relaxed">
                          {entry.description}
                        </span>
                        <code className="shrink-0 text-[11px] text-[var(--muted)] font-mono mt-0.5">
                          {entry.hash}
                        </code>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </article>
      </Container>
    </main>
  );
}

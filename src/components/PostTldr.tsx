export function PostTldr({ summary }: { summary: string | null }) {
  if (!summary) return null;
  const lines = summary
    .split("\n")
    .map((l) => l.trim().replace(/^[-•]\s*/, ""))
    .filter(Boolean);
  if (lines.length === 0) return null;

  return (
    <aside className="mb-10 rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5 p-4">
      <div className="flex items-center gap-2 mb-2">
        <svg
          className="size-3.5 text-amber-600 dark:text-amber-400"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 1.5a.75.75 0 0 1 .75.75V7.5h-1.5V2.25A.75.75 0 0 1 12 1.5ZM5.636 4.136a.75.75 0 0 1 1.06 0l2.653 2.654-1.06 1.06L5.636 5.197a.75.75 0 0 1 0-1.06Zm12.728 0a.75.75 0 0 1 0 1.06l-2.652 2.653-1.061-1.06 2.652-2.653a.75.75 0 0 1 1.06 0ZM1.5 12a.75.75 0 0 1 .75-.75H7.5v1.5H2.25A.75.75 0 0 1 1.5 12Zm14.25 0v-.75H21.75a.75.75 0 0 1 0 1.5H15.75V12ZM4.576 18.364l2.652-2.652 1.061 1.06-2.653 2.653a.75.75 0 1 1-1.06-1.061Zm14.848 0a.75.75 0 0 1-1.06 1.06l-2.653-2.652 1.06-1.061 2.653 2.653ZM12 15.75a.75.75 0 0 1 .75.75v5.25h-1.5V16.5a.75.75 0 0 1 .75-.75Z" />
        </svg>
        <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-widest">
          3줄 요약 (AI)
        </span>
      </div>
      <ul className="space-y-1">
        {lines.map((line, i) => (
          <li
            key={i}
            className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed flex gap-2"
          >
            <span className="text-amber-500 shrink-0">•</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

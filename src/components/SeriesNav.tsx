import Link from "next/link";
import type { PostMeta } from "@/lib/posts";

export function SeriesNav({
  current,
  all,
}: {
  current: PostMeta;
  all: PostMeta[];
}) {
  if (!current.series) return null;

  const seriesName = current.series.name;
  const seriesPosts = all
    .filter((p) => p.series?.name === seriesName)
    .sort((a, b) => (a.series?.order ?? 0) - (b.series?.order ?? 0));

  if (seriesPosts.length < 2) return null;

  const idx = seriesPosts.findIndex((p) => p.slug === current.slug);

  return (
    <section className="mb-8 rounded-xl border border-violet-200 dark:border-violet-500/20 bg-violet-50/50 dark:bg-violet-500/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-semibold text-violet-700 dark:text-violet-400 uppercase tracking-widest">
          시리즈
        </span>
        <h3 className="text-sm font-semibold">{seriesName}</h3>
        <span className="ml-auto text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
          {idx >= 0 ? idx + 1 : "?"}/{seriesPosts.length}편
        </span>
      </div>
      <ol className="space-y-1">
        {seriesPosts.map((p, i) => {
          const isCurrent = p.slug === current.slug;
          if (isCurrent) {
            return (
              <li key={p.slug}>
                <span className="flex items-start gap-2 rounded-md px-2 py-1.5 bg-violet-100 dark:bg-violet-500/15 text-sm font-medium text-violet-900 dark:text-violet-200">
                  <span className="tabular-nums shrink-0 text-violet-500">
                    {i + 1}.
                  </span>
                  <span className="truncate">{p.title}</span>
                  <span className="ml-auto text-[10px] text-violet-500 shrink-0">
                    현재
                  </span>
                </span>
              </li>
            );
          }
          return (
            <li key={p.slug}>
              <Link
                href={`/posts/${p.slug}`}
                className="flex items-start gap-2 rounded-md px-2 py-1.5 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-violet-100/60 dark:hover:bg-violet-500/10 transition-colors"
              >
                <span className="tabular-nums shrink-0 text-zinc-400">
                  {i + 1}.
                </span>
                <span className="truncate">{p.title}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

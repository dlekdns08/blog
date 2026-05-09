"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CATEGORY_CONFIG } from "@/lib/categories";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";

type Result = {
  slug: string;
  title: string;
  category: string;
  description: string | null;
  snippet: string;
  score: number;
};

function highlight(text: string, q: string) {
  if (!q.trim()) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-violet-100 dark:bg-violet-500/20 text-accent rounded-sm not-italic px-0.5">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
}

function SearchInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const initialQ = sp.get("q") ?? "";
  const [q, setQ] = useState(initialQ);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}`)
        .then((r) => r.json())
        .then((data) => setResults(data.results ?? []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.replace(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <main className="py-10 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">검색</h1>

        <form onSubmit={onSubmit} className="mb-8">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="제목·본문·태그 검색 (2자 이상)"
            autoFocus
            className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-body placeholder-subtle focus:border-accent focus:ring-2 focus:ring-violet-500/15 outline-none"
          />
        </form>

        <SectionHeader
          action={
            <span className="text-xs text-subtle tabular-nums">
              {loading ? "검색 중..." : results.length > 0 ? `${results.length}건` : ""}
            </span>
          }
        >
          결과
        </SectionHeader>

        {!loading && q.trim().length >= 2 && results.length === 0 ? (
          <EmptyState
            title="검색 결과가 없습니다"
            description={`"${q}"에 해당하는 글을 찾을 수 없어요.`}
          />
        ) : (
          <ul className="space-y-2">
            {results.map((r) => {
              const catLabel = CATEGORY_CONFIG[r.category]?.label ?? r.category;
              return (
                <li key={r.slug}>
                  <Link
                    href={`/posts/${r.slug}?q=${encodeURIComponent(q)}`}
                    className="block rounded-xl border border-line bg-surface p-4 hover:border-accent transition-colors"
                  >
                    {catLabel && (
                      <p className="text-[10px] font-medium text-subtle uppercase tracking-widest mb-1">
                        {catLabel}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-body">
                      {highlight(r.title, q)}
                    </p>
                    {r.description && (
                      <p className="text-xs text-muted mt-1 line-clamp-1">
                        {highlight(r.description, q)}
                      </p>
                    )}
                    <p className="text-xs text-subtle mt-1.5 line-clamp-2 leading-relaxed">
                      {highlight(r.snippet, q)}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<main className="py-10 px-4 text-sm text-subtle">로딩 중...</main>}>
      <SearchInner />
    </Suspense>
  );
}

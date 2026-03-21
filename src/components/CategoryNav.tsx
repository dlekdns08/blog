"use client";

import Link from "next/link";
import { useState } from "react";
import type { CategoryData, SubCategoryData } from "@/lib/categories";

function ChevronRight() {
  return (
    <svg className="size-3 shrink-0 text-zinc-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}

const rowBase = "flex items-center justify-between w-full rounded-lg px-2.5 py-2 text-sm transition-all duration-150";
const rowIdle = "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/8 dark:hover:text-white";
const rowActive = "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300";

export function CategoryNav({ categories }: { categories: CategoryData[] }) {
  const [selCat, setSelCat] = useState<string | null>(null);
  const [selSub, setSelSub] = useState<string | null>(null);

  const depth = selCat ? (selSub ? 2 : 1) : 0;
  const activeCat = categories.find((c) => c.name === selCat);
  const activeSub: SubCategoryData | undefined = activeCat?.children.find((s) => s.name === selSub);

  if (categories.length === 0) return null;

  return (
    <nav className="space-y-0.5">

      {/* 헤더 */}
      <div className="flex items-center gap-2 px-2.5 pb-3">
        {depth > 0 ? (
          <button
            onClick={() => { if (selSub) setSelSub(null); else setSelCat(null); }}
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
          >
            <svg className="size-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            <span className="truncate max-w-[7rem]">
              {depth === 2 ? `${activeCat?.label} / ${selSub}` : activeCat?.label}
            </span>
          </button>
        ) : (
          <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            카테고리
          </span>
        )}
      </div>

      {/* 패널 0: 대분류 */}
      {depth === 0 && (
        <>
          <Link href="/posts" className={`${rowBase} ${rowIdle}`}>
            <span className="flex items-center gap-2">
              <span className="text-sm leading-none">📋</span>
              <span className="font-medium">전체</span>
            </span>
            <span className="text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
              {categories.reduce((s, c) => s + c.count, 0)}
            </span>
          </Link>

          <div className="h-px mx-2.5 bg-black/6 dark:bg-white/6 my-1" />

          {categories.map((cat) =>
            cat.children.length > 0 ? (
              <button
                key={cat.name}
                onClick={() => { setSelCat(cat.name); setSelSub(null); }}
                className={`${rowBase} ${rowIdle}`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-sm leading-none">{cat.icon}</span>
                  <span className="font-medium">{cat.label}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-xs tabular-nums text-zinc-400 dark:text-zinc-500">{cat.count}</span>
                  <ChevronRight />
                </span>
              </button>
            ) : (
              <Link
                key={cat.name}
                href={`/posts?category=${cat.name}`}
                className={`${rowBase} ${rowIdle}`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-sm leading-none">{cat.icon}</span>
                  <span className="font-medium">{cat.label}</span>
                </span>
                <span className="text-xs tabular-nums text-zinc-400 dark:text-zinc-500">{cat.count}</span>
              </Link>
            )
          )}
        </>
      )}

      {/* 패널 1: 소분류 */}
      {depth === 1 && activeCat && (
        <>
          <Link
            href={`/posts?category=${activeCat.name}`}
            className={`${rowBase} ${rowActive}`}
          >
            <span className="flex items-center gap-2">
              <span className="text-sm leading-none">{activeCat.icon}</span>
              <span className="font-medium">전체</span>
            </span>
            <span className="text-xs tabular-nums">{activeCat.count}</span>
          </Link>

          <div className="h-px mx-2.5 bg-black/6 dark:bg-white/6 my-1" />

          {activeCat.children.map((sub) =>
            sub.children.length > 0 ? (
              <button
                key={sub.name}
                onClick={() => setSelSub(sub.name)}
                className={`${rowBase} ${rowIdle}`}
              >
                <span className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600 shrink-0 ml-0.5" />
                  <span className="font-medium">{sub.name}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-xs tabular-nums text-zinc-400 dark:text-zinc-500">{sub.count}</span>
                  <ChevronRight />
                </span>
              </button>
            ) : (
              <Link
                key={sub.name}
                href={`/posts?category=${activeCat.name}&sub=${sub.name}`}
                className={`${rowBase} ${rowIdle}`}
              >
                <span className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600 shrink-0 ml-0.5" />
                  <span className="font-medium">{sub.name}</span>
                </span>
                <span className="text-xs tabular-nums text-zinc-400 dark:text-zinc-500">{sub.count}</span>
              </Link>
            )
          )}
        </>
      )}

      {/* 패널 2: 세분류 */}
      {depth === 2 && activeCat && activeSub && (
        <>
          <Link
            href={`/posts?category=${activeCat.name}&sub=${activeSub.name}`}
            className={`${rowBase} ${rowActive}`}
          >
            <span className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-violet-400 dark:bg-violet-500 shrink-0 ml-0.5" />
              <span className="font-medium">전체</span>
            </span>
            <span className="text-xs tabular-nums">{activeSub.count}</span>
          </Link>

          <div className="h-px mx-2.5 bg-black/6 dark:bg-white/6 my-1" />

          {activeSub.children.map((ss) => (
            <Link
              key={ss.name}
              href={`/posts?category=${activeCat.name}&sub=${activeSub.name}&subsub=${ss.name}`}
              className={`${rowBase} ${rowIdle}`}
            >
              <span className="flex items-center gap-2">
                <span className="size-1 rounded-full bg-zinc-300 dark:bg-zinc-600 shrink-0 ml-1" />
                <span className="font-medium">{ss.name}</span>
              </span>
              <span className="text-xs tabular-nums text-zinc-400 dark:text-zinc-500">{ss.count}</span>
            </Link>
          ))}
        </>
      )}
    </nav>
  );
}

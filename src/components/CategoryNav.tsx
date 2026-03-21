"use client";

import Link from "next/link";
import { useState } from "react";
import type { CategoryData, SubCategoryData } from "@/lib/categories";

function ChevronRight() {
  return (
    <svg className="size-3.5 shrink-0 text-zinc-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}

function BackArrow() {
  return (
    <svg className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  );
}

function StepIndicator({ depth }: { depth: number }) {
  const STEPS = ["대분류", "소분류", "세분류"];
  return (
    <div className="flex items-center gap-px mb-4 px-0.5">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center" style={{ flex: i < 2 ? "1 1 0%" : undefined }}>
          <div className="flex flex-col items-center gap-0.5">
            <span
              className={`size-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-200 ${
                depth >= i
                  ? "bg-violet-600 text-white shadow-sm shadow-violet-300 dark:shadow-violet-900"
                  : "bg-zinc-100 text-zinc-400 dark:bg-white/8 dark:text-zinc-500"
              }`}
            >
              {i + 1}
            </span>
            <span
              className={`text-[9px] font-medium whitespace-nowrap transition-colors duration-200 ${
                depth >= i ? "text-violet-600 dark:text-violet-400" : "text-zinc-400 dark:text-zinc-600"
              }`}
            >
              {label}
            </span>
          </div>
          {i < 2 && (
            <span
              className={`flex-1 h-px mx-1 mb-3.5 transition-colors duration-200 ${
                depth > i ? "bg-violet-400 dark:bg-violet-600" : "bg-zinc-200 dark:bg-white/10"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

const rowBase = "flex items-center justify-between w-full rounded-xl px-3 py-2.5 text-sm transition-all duration-150";
const rowIdle = "text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/8 dark:hover:text-white";

export function CategoryNav({ categories }: { categories: CategoryData[] }) {
  const [selCat, setSelCat] = useState<string | null>(null);
  const [selSub, setSelSub] = useState<string | null>(null);

  const depth = selCat ? (selSub ? 2 : 1) : 0;
  const activeCat = categories.find((c) => c.name === selCat);
  const activeSub: SubCategoryData | undefined = activeCat?.children.find((s) => s.name === selSub);

  function goBack() {
    if (selSub) setSelSub(null);
    else setSelCat(null);
  }

  if (categories.length === 0) return null;

  return (
    <div className="rounded-2xl border border-black/8 dark:border-white/10 bg-white dark:bg-white/5 p-4">
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-3 min-h-[1.5rem]">
        {depth > 0 ? (
          <button
            onClick={goBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-violet-700 dark:text-zinc-400 dark:hover:text-violet-300 transition-colors"
          >
            <BackArrow />
            <span className="truncate max-w-[9rem]">
              {depth === 2 ? `${activeCat?.label} / ${selSub}` : activeCat?.label}
            </span>
          </button>
        ) : (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 px-1">
            카테고리
          </p>
        )}
      </div>

      <StepIndicator depth={depth} />

      {/* 패널 0: 대분류 */}
      {depth === 0 && (
        <div className="space-y-0.5">
          <Link href="/posts" className={`${rowBase} ${rowIdle}`}>
            <span className="flex items-center gap-2.5">
              <span className="text-base leading-none w-5 text-center">📋</span>
              <span className="font-medium">전체</span>
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 tabular-nums">
              {categories.reduce((s, c) => s + c.count, 0)}
            </span>
          </Link>
          <div className="h-px bg-black/5 dark:bg-white/5 my-1" />
          {categories.map((cat) =>
            cat.children.length > 0 ? (
              <button
                key={cat.name}
                onClick={() => { setSelCat(cat.name); setSelSub(null); }}
                className={`${rowBase} ${rowIdle}`}
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-base leading-none w-5 text-center">{cat.icon}</span>
                  <span className="font-medium">{cat.label}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 tabular-nums">{cat.count}</span>
                  <ChevronRight />
                </span>
              </button>
            ) : (
              <Link
                key={cat.name}
                href={`/posts?category=${cat.name}`}
                className={`${rowBase} ${rowIdle}`}
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-base leading-none w-5 text-center">{cat.icon}</span>
                  <span className="font-medium">{cat.label}</span>
                </span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500 tabular-nums">{cat.count}</span>
              </Link>
            )
          )}
        </div>
      )}

      {/* 패널 1: 소분류 */}
      {depth === 1 && activeCat && (
        <div className="space-y-0.5">
          <Link
            href={`/posts?category=${activeCat.name}`}
            className={`${rowBase} ${rowIdle} border border-dashed border-black/8 dark:border-white/10`}
          >
            <span className="flex items-center gap-2.5">
              <span className="text-base leading-none w-5 text-center">{activeCat.icon}</span>
              <span className="font-medium text-zinc-500 dark:text-zinc-400">전체보기</span>
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 tabular-nums">{activeCat.count}</span>
          </Link>
          <div className="h-px bg-black/5 dark:bg-white/5 my-1" />
          {activeCat.children.map((sub) =>
            sub.children.length > 0 ? (
              <button
                key={sub.name}
                onClick={() => setSelSub(sub.name)}
                className={`${rowBase} ${rowIdle}`}
              >
                <span className="flex items-center gap-2.5">
                  <span className="size-1.5 rounded-full bg-violet-400 dark:bg-violet-500 shrink-0 ml-1.5" />
                  <span className="font-medium">{sub.name}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 tabular-nums">{sub.count}</span>
                  <ChevronRight />
                </span>
              </button>
            ) : (
              <Link
                key={sub.name}
                href={`/posts?category=${activeCat.name}&sub=${sub.name}`}
                className={`${rowBase} ${rowIdle}`}
              >
                <span className="flex items-center gap-2.5">
                  <span className="size-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600 shrink-0 ml-1.5" />
                  <span className="font-medium">{sub.name}</span>
                </span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500 tabular-nums">{sub.count}</span>
              </Link>
            )
          )}
        </div>
      )}

      {/* 패널 2: 세분류 */}
      {depth === 2 && activeCat && activeSub && (
        <div className="space-y-0.5">
          <Link
            href={`/posts?category=${activeCat.name}&sub=${activeSub.name}`}
            className={`${rowBase} ${rowIdle} border border-dashed border-black/8 dark:border-white/10`}
          >
            <span className="flex items-center gap-2.5">
              <span className="size-1.5 rounded-full bg-violet-400 dark:bg-violet-500 shrink-0 ml-1.5" />
              <span className="font-medium text-zinc-500 dark:text-zinc-400">전체보기</span>
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 tabular-nums">{activeSub.count}</span>
          </Link>
          <div className="h-px bg-black/5 dark:bg-white/5 my-1" />
          {activeSub.children.map((ss) => (
            <Link
              key={ss.name}
              href={`/posts?category=${activeCat.name}&sub=${activeSub.name}&subsub=${ss.name}`}
              className={`${rowBase} ${rowIdle}`}
            >
              <span className="flex items-center gap-2.5">
                <span className="size-1 rounded-full bg-zinc-300 dark:bg-zinc-600 shrink-0 ml-2" />
                <span className="font-medium">{ss.name}</span>
              </span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500 tabular-nums">{ss.count}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

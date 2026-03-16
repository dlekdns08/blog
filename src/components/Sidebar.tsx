"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SubscribeForm } from "@/components/SubscribeForm";
import type { CategoryData, SubCategoryData } from "@/lib/categories";

// ── 아이콘 ──────────────────────────────────────────────────

function HomeIcon() {
  return (
    <svg className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="m3 9.75 9-7.5 9 7.5V21a.75.75 0 0 1-.75.75H15v-6H9v6H3.75A.75.75 0 0 1 3 21V9.75Z" />
    </svg>
  );
}

function PostsIcon() {
  return (
    <svg className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );
}

function AboutIcon() {
  return (
    <svg className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
    </svg>
  );
}

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

// ── 스텝 인디케이터 ──────────────────────────────────────────

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
                depth > i
                  ? "bg-violet-400 dark:bg-violet-600"
                  : "bg-zinc-200 dark:bg-white/10"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── 공통 행 스타일 ───────────────────────────────────────────

const rowBase =
  "flex items-center justify-between w-full rounded-xl px-3 py-2.5 text-sm transition-all duration-150";
const rowIdle =
  "text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/8 dark:hover:text-white";
const rowActive =
  "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300";

// ── 메인 컴포넌트 ───────────────────────────────────────────

const NAV = [
  { href: "/",      label: "홈",  icon: <HomeIcon /> },
  { href: "/posts", label: "글",  icon: <PostsIcon /> },
  { href: "/about", label: "소개", icon: <AboutIcon /> },
];

export function Sidebar({ categories }: { categories: CategoryData[] }) {
  const pathname = usePathname();

  // 드릴다운 선택 상태
  const [selCat, setSelCat] = useState<string | null>(null);
  const [selSub, setSelSub] = useState<string | null>(null);

  const depth = selCat ? (selSub ? 2 : 1) : 0;

  const activeCat = categories.find((c) => c.name === selCat);
  const activeSub: SubCategoryData | undefined = activeCat?.children.find((s) => s.name === selSub);

  function goBack() {
    if (selSub) {
      setSelSub(null);
    } else {
      setSelCat(null);
    }
  }

  return (
    <aside className="w-64 shrink-0 border-r border-black/8 dark:border-white/8 self-stretch">
      <div className="sticky top-0 h-dvh flex flex-col overflow-hidden px-4 py-7">

        {/* ── 헤더 ─────────────────────────────────────── */}
        <Link href="/" className="group flex items-center gap-3 mb-7 px-1 shrink-0">
          <div className="size-10 rounded-2xl bg-gradient-to-br from-violet-100 to-violet-200 dark:from-violet-500/25 dark:to-violet-600/15 flex items-center justify-center text-xl shadow-sm shrink-0">
            🐨
          </div>
          <div>
            <div className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">
              이다운
            </div>
            <div className="text-xs text-zinc-400 dark:text-zinc-500 leading-tight mt-0.5 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
              코알라 오딧세이
            </div>
          </div>
        </Link>

        {/* ── 메인 네비게이션 ──────────────────────────── */}
        <nav className="space-y-0.5 mb-5 shrink-0">
          {NAV.map(({ href, label, icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300 shadow-sm"
                    : "text-zinc-500 hover:bg-zinc-100/80 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/8 dark:hover:text-white"
                }`}
              >
                <span className={active ? "text-violet-600 dark:text-violet-400" : "text-zinc-400 dark:text-zinc-500"}>
                  {icon}
                </span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* ── 구분선 ───────────────────────────────────── */}
        {categories.length > 0 && (
          <div className="h-px bg-black/6 dark:bg-white/6 mb-5" />
        )}

        {/* ── 카테고리 드릴다운 ─────────────────────────── */}
        {categories.length > 0 && (
          <div className="flex-1 min-h-0 overflow-y-auto mb-1 pr-0.5">

            {/* 패널 헤더 */}
            <div className="flex items-center gap-2 mb-3 min-h-[1.5rem]">
              {depth > 0 ? (
                <button
                  onClick={goBack}
                  className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-violet-700 dark:text-zinc-400 dark:hover:text-violet-300 transition-colors"
                >
                  <BackArrow />
                  <span className="truncate max-w-[9rem]">
                    {depth === 2
                      ? `${activeCat?.label} / ${selSub}`
                      : activeCat?.label}
                  </span>
                </button>
              ) : (
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 px-1">
                  카테고리
                </p>
              )}
            </div>

            {/* 스텝 인디케이터 */}
            <StepIndicator depth={depth} />

            {/* ── 패널 0: 대분류 ─────────────────────── */}
            {depth === 0 && (
              <div className="space-y-0.5">
                {categories.map((cat) => (
                  cat.children.length > 0 ? (
                    /* 서브카테고리 있음 → 드릴다운 */
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
                    /* 서브카테고리 없음 → 바로 링크 */
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
                ))}
              </div>
            )}

            {/* ── 패널 1: 소분류 ─────────────────────── */}
            {depth === 1 && activeCat && (
              <div className="space-y-0.5">
                {/* 대분류 전체 */}
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

                {activeCat.children.map((sub) => (
                  sub.children.length > 0 ? (
                    /* 3단계 있음 → 드릴다운 */
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
                    /* 3단계 없음 → 바로 링크 */
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
                ))}
              </div>
            )}

            {/* ── 패널 2: 세분류 ─────────────────────── */}
            {depth === 2 && activeCat && activeSub && (
              <div className="space-y-0.5">
                {/* 소분류 전체 */}
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
        )}

        {/* ── 하단 고정 영역 (구독 + 푸터) ─────────────── */}
        <div className="shrink-0 pt-3 space-y-4">
          {/* 구독 폼 */}
          <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-500/10 dark:to-violet-600/5 p-4 border border-violet-100 dark:border-violet-500/15">
            <SubscribeForm />
          </div>

          {/* 푸터 */}
          <div className="space-y-2.5 px-1">
            <a
              href="https://github.com/dlekdns08"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-200 transition-colors"
            >
              <GitHubIcon />
              <span>GitHub</span>
            </a>
            <p className="text-[11px] text-zinc-300 dark:text-white/20">
              © {new Date().getFullYear()} 이다운
            </p>
          </div>
        </div>

      </div>
    </aside>
  );
}

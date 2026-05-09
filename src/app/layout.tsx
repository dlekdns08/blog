import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github.css";
import { Sidebar } from "@/components/Sidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { CommandPaletteProvider } from "@/components/CommandPaletteProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CursorTrail } from "@/components/CursorTrail";
import { ChatWidget } from "@/components/ChatWidget";
import { getAllPosts } from "@/lib/posts";
import { buildCategoryTree } from "@/lib/categories";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://koala.ai.kr";
// 정적 이미지를 기본 OG로 사용 (동적 생성 실패 시 fallback)
const DEFAULT_OG = `${SITE_URL}/coala_odsey2.png`;

export const metadata: Metadata = {
  title: {
    default: "이다운의 코알라 오딧세이",
    template: "%s · 이다운의 코알라 오딧세이",
  },
  description:
    "코알라의 여정을 기록하는 블로그. LLM/IT 기술, 전문연구요원 일상, AI 개발의 도전과 성취를 나눕니다.",
  alternates: {
    canonical: SITE_URL,
    types: {
      "application/rss+xml": `${SITE_URL}/rss.xml`,
    },
  },
  openGraph: {
    siteName: "이다운의 코알라 오딧세이",
    images: [{ url: DEFAULT_OG, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: [DEFAULT_OG],
  },
};

// Inline script to apply dark class before first render (prevents FOUC)
const themeScript = `(function(){var t=localStorage.getItem("theme"),d=window.matchMedia("(prefers-color-scheme:dark)").matches;if(t==="dark"||(t!=="light"&&d)){document.documentElement.classList.add("dark")}else if(t==="light"){document.documentElement.classList.add("light")}})()`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const posts = await getAllPosts();
  const categories = buildCategoryTree(posts);

  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* Must run before body renders to avoid flash of wrong theme */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-zinc-50 text-zinc-950 antialiased dark:bg-black dark:text-zinc-50`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-black dark:focus:bg-zinc-900 dark:focus:text-white focus:top-2 focus:left-2 focus:rounded"
        >
          본문으로 건너뛰기
        </a>
        <ThemeProvider>
          <CommandPaletteProvider posts={posts}>
            <CursorTrail />

            {/* 모바일 헤더 */}
            <MobileHeader />

            <div className="flex min-h-dvh">
              {/* 데스크탑 사이드바 */}
              <div className="hidden md:flex self-stretch">
                <Sidebar categories={categories} posts={posts} />
              </div>

              {/* 본문 */}
              <div id="main-content" className="flex-1 min-w-0">
                {children}
              </div>
            </div>
            <ChatWidget />
          </CommandPaletteProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

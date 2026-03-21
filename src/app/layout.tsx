import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { Sidebar } from "@/components/Sidebar";
import { MobileHeader } from "@/components/MobileHeader";
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
const DEFAULT_OG = `${SITE_URL}/api/og?title=${encodeURIComponent("이다운의 코알라 오딧세이")}`;

export const metadata: Metadata = {
  title: {
    default: "이다운의 코알라 오딧세이",
    template: "%s · 이다운의 코알라 오딧세이",
  },
  description:
    "코알라의 여정을 기록하는 블로그. LLM/IT 기술, 전문연구요원 일상, AI 개발의 도전과 성취를 나눕니다.",
  openGraph: {
    siteName: "이다운의 코알라 오딧세이",
    images: [{ url: DEFAULT_OG, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: [DEFAULT_OG],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const posts = await getAllPosts();
  const categories = buildCategoryTree(posts);

  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-zinc-50 text-zinc-950 antialiased dark:bg-black dark:text-zinc-50`}
      >
        {/* 모바일 헤더 */}
        <MobileHeader />

        <div className="flex min-h-dvh">
          {/* 데스크탑 사이드바 */}
          <div className="hidden md:flex self-stretch">
            <Sidebar categories={categories} />
          </div>

          {/* 본문 */}
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}

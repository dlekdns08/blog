import Image from "next/image";
import Link from "next/link";
import {
  SiPython, SiR, SiLangchain, SiPytorch,
  SiSvelte, SiNextdotjs, SiJavascript, SiDocker,
  SiMongodb, SiGit, SiNodedotjs, SiVuedotjs,
  SiMysql, SiReact, SiMariadb,
  SiKubernetes, SiJenkins, SiRedis, SiPostgresql, SiUbuntu,
} from "react-icons/si";
import { FaJava } from "react-icons/fa";
import { TbBrain } from "react-icons/tb";
import type { IconType } from "react-icons";
import { getAllPosts } from "@/lib/posts";
import { CATEGORY_CONFIG } from "@/lib/categories";
import { formatRelativeDate } from "@/lib/date";
import { TypingText } from "@/components/TypingText";
import { DailyPaperWidget } from "@/components/DailyPaperWidget";

type Stack = { icon: IconType; label: string; color: string };

const PRIMARY_STACKS: Stack[] = [
  { icon: SiPython,    label: "Python",        color: "#3776AB" },
  { icon: SiR,         label: "R",             color: "#276DC3" },
  { icon: SiLangchain, label: "LangChain",     color: "#1C3C3C" },
  { icon: SiLangchain, label: "LangGraph",     color: "#1C3C3C" },
  { icon: SiPytorch,   label: "PyTorch",       color: "#EE4C2C" },
  { icon: TbBrain,     label: "NLP",           color: "#7C3AED" },
  { icon: TbBrain,     label: "ML / DL",       color: "#059669" },
  { icon: TbBrain,     label: "LLM",           color: "#DC2626" },
];

const OTHER_STACKS: Stack[] = [
  { icon: TbBrain,       label: "ComputerVision", color: "#0EA5E9" },
  { icon: SiSvelte,      label: "Svelte",          color: "#FF3E00" },
  { icon: SiNextdotjs,   label: "Next.js",         color: "#000000" },
  { icon: SiJavascript,  label: "JavaScript",      color: "#F7DF1E" },
  { icon: SiDocker,      label: "Docker",          color: "#2496ED" },
  { icon: SiMongodb,     label: "MongoDB",         color: "#47A248" },
  { icon: SiGit,         label: "Git",             color: "#F05032" },
  { icon: SiNodedotjs,   label: "Node.js",         color: "#339933" },
  { icon: SiVuedotjs,    label: "Vue.js",          color: "#4FC08D" },
  { icon: FaJava,        label: "Java",            color: "#007396" },
  { icon: SiMysql,       label: "MySQL",           color: "#4479A1" },
  { icon: SiReact,       label: "React",           color: "#61DAFB" },
  { icon: SiMariadb,     label: "MariaDB",         color: "#003545" },
  { icon: SiKubernetes,  label: "Kubernetes",      color: "#326CE5" },
  { icon: SiJenkins,     label: "Jenkins",         color: "#D24939" },
  { icon: SiRedis,       label: "Redis",           color: "#DC382D" },
  { icon: SiPostgresql,  label: "PostgreSQL",      color: "#4169E1" },
  { icon: SiUbuntu,      label: "Ubuntu",          color: "#E95420" },
];

function StackBadge({ icon: Icon, label, color }: Stack) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-black/8 bg-white px-3 py-2 text-xs shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/8">
      <Icon style={{ color }} className="size-3.5 shrink-0" />
      <span className="font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
    </div>
  );
}

export default async function Home() {
  const recentPosts = (await getAllPosts()).slice(0, 5);

  return (
    <main className="flex flex-col min-h-dvh">
      {/* 히어로 이미지 */}
      <div className="relative w-full overflow-hidden">
        <Image
          src="/coala_odsey2.png"
          alt="코알라 오딧세이"
          width={1536}
          height={429}
          priority
          className="w-full h-auto"
        />
        {/* 그라디언트 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent dark:from-[#0a0a0a] dark:via-[#0a0a0a]/30" />
        {/* 이미지 위 텍스트 */}
        <div className="absolute bottom-0 left-0 right-0 px-5 sm:px-8 pb-6 sm:pb-8">
          <h1 className="text-2xl font-bold tracking-tight drop-shadow-sm">
            코알라 오딧세이
          </h1>
          <p className="mt-1 text-sm text-black/60 dark:text-white/60">
            <TypingText
              texts={[
                "이다운의 여정을 기록하는 블로그",
                "LLM · AI 탐구",
                "코알라의 끝없는 오딧세이",
              ]}
            />
          </p>
        </div>
      </div>

      {/* 본문 */}
      <div className="px-4 sm:px-8 py-8 sm:py-10 max-w-3xl space-y-8 sm:space-y-10">

        {/* 소개 */}
        <section className="space-y-4">
          <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-400">
            대학교에서 생명과학과 빅데이터 분석을, 대학원에서 LLM을 공부했고
            현재는 전문연구요원으로 AI 개발을 하며 살아가는 코알라입니다.
          </p>
          <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-400">
            LLM/IT 기술, 전문연구요원 일상, AI 개발의 도전과 성취까지 —
            그때그때의 경험과 생각을 솔직하게 나눕니다.
          </p>

          {/* 인포 카드 */}
          <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-3 pt-1">
            <div className="rounded-xl border border-black/8 bg-white px-4 py-3 text-sm shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="text-xs text-zinc-400 dark:text-zinc-500 mb-1 font-medium tracking-wide uppercase">관심사</div>
              <div className="font-semibold text-zinc-800 dark:text-zinc-200">LLM · AI · 생명과학</div>
            </div>
            <div className="rounded-xl border border-black/8 bg-white px-4 py-3 text-sm shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="text-xs text-zinc-400 dark:text-zinc-500 mb-1 font-medium tracking-wide uppercase">현재</div>
              <div className="font-semibold text-zinc-800 dark:text-zinc-200">전문연구요원 AI 개발</div>
            </div>
            <Link
              href="/posts"
              className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm shadow-sm hover:bg-violet-100 transition-colors dark:border-violet-500/20 dark:bg-violet-500/10 dark:hover:bg-violet-500/15"
            >
              <div className="text-xs text-violet-500 dark:text-violet-400 mb-1 font-medium tracking-wide uppercase">바로가기</div>
              <div className="font-semibold text-violet-700 dark:text-violet-300">글 보러가기 →</div>
            </Link>
          </div>
        </section>

        {/* 구분선 */}
        <div className="h-px bg-black/8 dark:bg-white/8" />

        {/* 최근 글 */}
        {recentPosts.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                최근 글
              </h2>
              <Link
                href="/posts"
                className="text-xs text-violet-600 dark:text-violet-400 hover:underline"
              >
                전체 보기 →
              </Link>
            </div>
            <ul className="space-y-2">
              {recentPosts.map((post) => {
                const catConfig = CATEGORY_CONFIG[post.category];
                return (
                  <li key={post.slug}>
                    <Link
                      href={`/posts/${post.slug}`}
                      className="group flex items-center justify-between gap-3 rounded-xl border border-black/8 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 hover:border-violet-200 dark:hover:border-violet-500/30 hover:shadow-sm transition-all duration-150"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {catConfig && (
                          <span className="text-base leading-none shrink-0">
                            {catConfig.icon}
                          </span>
                        )}
                        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors truncate">
                          {post.title}
                        </span>
                      </div>
                      <time className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0 tabular-nums">
                        {formatRelativeDate(post.date)}
                      </time>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* 구분선 */}
        <div className="h-px bg-black/8 dark:bg-white/8" />

        {/* 오늘의 논문 */}
        <DailyPaperWidget />

        {/* 구분선 */}
        <div className="h-px bg-black/8 dark:bg-white/8" />

        {/* 기술 스택 */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3">주력 스택</h2>
            <div className="flex flex-wrap gap-2">
              {PRIMARY_STACKS.map((s) => (
                <StackBadge key={s.label} {...s} />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3">그 외</h2>
            <div className="flex flex-wrap gap-2">
              {OTHER_STACKS.map((s) => (
                <StackBadge key={s.label} {...s} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

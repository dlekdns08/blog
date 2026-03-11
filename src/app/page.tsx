import Image from "next/image";
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
    <div className="flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-white/5">
      <Icon style={{ color }} className="size-4 shrink-0" />
      <span className="font-medium">{label}</span>
    </div>
  );
}

export default function Home() {
  return (
    <main className="flex flex-col min-h-dvh">
      {/* 히어로 이미지 */}
      <div className="relative w-full">
        <Image
          src="/coala_odsey2.png"
          alt="코알라의 오딧세이"
          width={1536}
          height={429}
          priority
          className="w-full h-auto"
        />
        {/* 하단 그라디언트 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 via-zinc-50/20 to-transparent dark:from-black dark:via-black/20" />
        {/* 이미지 위 텍스트 */}
        <div className="absolute bottom-0 left-0 right-0 px-8 pb-8">
          <h1 className="text-2xl font-semibold tracking-tight drop-shadow">
            코알라의 오딧세이
          </h1>
          <p className="mt-1 text-sm text-black/70 dark:text-white/70">
            이다운의 여정을 기록하는 블로그
          </p>
        </div>
      </div>

      {/* 소개 */}
      <div className="px-8 py-8 max-w-3xl space-y-8">
        <div className="space-y-4">
          <p className="text-sm leading-7 text-black/70 dark:text-white/70">
            대학교에서 생명과학과 빅데이터 분석을, 대학원에서 LLM을 공부했고
            현재는 전문연구요원으로 AI 개발을 하며 살아가는 코알라입니다.
          </p>
          <p className="text-sm leading-7 text-black/70 dark:text-white/70">
            LLM/IT 기술, 전문연구요원 일상, AI 개발의 도전과 성취까지 —
            그때그때의 경험과 생각을 솔직하게 나눕니다.
          </p>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-lg border border-black/10 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5">
              <div className="text-xs text-black/50 dark:text-white/50 mb-1">관심사</div>
              <div className="font-medium">LLM · AI · 생명과학</div>
            </div>
            <div className="rounded-lg border border-black/10 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5">
              <div className="text-xs text-black/50 dark:text-white/50 mb-1">현재</div>
              <div className="font-medium">전문연구요원 AI 개발</div>
            </div>
          </div>
        </div>

        {/* 기술 스택 */}
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold mb-3">주력 스택</h2>
            <div className="flex flex-wrap gap-2">
              {PRIMARY_STACKS.map((s) => (
                <StackBadge key={s.label} {...s} />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold mb-3">그 외</h2>
            <div className="flex flex-wrap gap-2">
              {OTHER_STACKS.map((s) => (
                <StackBadge key={s.label} {...s} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

import Image from "next/image";

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
      <div className="px-8 py-8 max-w-2xl space-y-4">
        <p className="text-sm leading-7 text-black/70 dark:text-white/70">
          대학교에서 생명과학과 빅데이터 분석을, 대학원에서 LLM을 공부했고
          현재는 전문연구요원으로 AI 개발을 하며 살아가는 코알라입니다.
        </p>
        <p className="text-sm leading-7 text-black/70 dark:text-white/70">
          LLM/IT 기술, 전문연구요원 일상, AI 개발의 도전과 성취까지 —
          그때그때의 경험과 생각을 솔직하게 나눕니다.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
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
    </main>
  );
}

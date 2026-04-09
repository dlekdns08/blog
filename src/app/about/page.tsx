import { Container } from "@/components/Container";

export const metadata = {
  title: "소개",
  description: "AI 개발자 코알라의 소개 페이지. 생명과학과 빅데이터 출신으로 현재 LLM/AI 개발을 하며 블로그를 운영합니다.",
};

export default function AboutPage() {
  return (
    <main className="py-12">
      <Container>
        <article className="space-y-10">

          {/* Hero */}
          <header className="flex flex-col items-center text-center gap-5 pb-8 border-b border-[var(--border)]">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-[var(--accent-muted)] flex items-center justify-center text-5xl shadow-md ring-4 ring-[var(--border)]">
                🐨
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                이다운의 코알라 오딧세이
              </h1>
              <p className="text-sm text-[var(--muted)]">
                AI 개발자 · 전문연구요원 · 생명과학 + 빅데이터 출신
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {["LLM", "AI 개발", "빅데이터", "생명과학", "Next.js"].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--accent-muted)] text-[var(--accent)] border border-[var(--accent-muted)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </header>

          {/* About */}
          <section className="grid sm:grid-cols-2 gap-4">
            <Card emoji="👋" title="안녕하세요!">
              대학교에서 <strong>생명과학</strong>과 <strong>빅데이터 분석</strong>을,
              대학원에서 LLM(이라고 하기엔 데이터 분석에 조금 더 가까웠습니다..)을
              공부했습니다. 현재는 전문연구요원으로 모 IT 업체에서{" "}
              <strong>AI 개발</strong>을 하며 살고 있는 코알라입니다.
            </Card>
            <Card emoji="🧭" title="왜 코알라 오딧세이?">
              제 별명인 <strong>&apos;코알라&apos;</strong>와 고대 그리스의 서사시이자
              긴 여행을 의미하는 <strong>&apos;오딧세이&apos;</strong>를 결합하여,
              인생이라는 저만의 여정을 기록하고 소중한 추억으로 간직하고자 이 블로그를
              시작했습니다.
            </Card>
          </section>

          {/* Philosophy */}
          <section className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-6 space-y-3">
            <h2 className="font-semibold text-base flex items-center gap-2">
              <span>🌿</span> 블로그 운영 방식
            </h2>
            <p className="text-sm leading-7 text-[var(--muted)]">
              인생은 때로는 빠르게 달려가기도 하고, 때로는 그늘에서 휴식을 취하며
              여유를 즐기기도 합니다. 이 블로그의 포스팅 역시 규칙적이지 않을 수
              있지만, 그때그때의 경험과 생각을 <strong>솔직하게</strong> 나누고자
              합니다.
            </p>
          </section>

          {/* Topics */}
          <section className="space-y-4">
            <h2 className="font-semibold text-base">📝 이런 이야기를 씁니다</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { emoji: "🤖", title: "AI & LLM", desc: "연구 중인 기술과 개발 과정의 도전과 성취" },
                { emoji: "💼", title: "전문연구요원 일상", desc: "연구소 생활과 개발자로서의 일상적인 경험" },
                { emoji: "🐨", title: "코알라의 에피소드", desc: "개인적인 삶 속에서 겪는 다양한 이야기" },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-[var(--border)] p-4 space-y-2 hover:bg-[var(--card)] transition-colors"
                >
                  <div className="text-2xl">{item.emoji}</div>
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs leading-5 text-[var(--muted)]">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="pt-6 border-t border-[var(--border)] flex flex-col items-center gap-1 text-sm text-[var(--muted)]">
            <p>
              저의 <strong>코알라 오딧세이</strong> 여정에 함께해 주셔서 감사합니다. 🙏
            </p>
            <p className="text-xs">— 코알라 드림</p>
          </footer>

        </article>
      </Container>
    </main>
  );
}

function Card({
  emoji,
  title,
  children,
}: {
  emoji: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-3">
      <h2 className="font-semibold text-sm flex items-center gap-2">
        <span>{emoji}</span> {title}
      </h2>
      <p className="text-sm leading-7 text-[var(--muted)]">{children}</p>
    </div>
  );
}

import { Container } from "@/components/Container";

export const metadata = {
  title: "소개",
};

export default function AboutPage() {
  return (
    <main className="py-10">
      <Container>
        <article className="space-y-6">
          <header className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              이다운의 코알라 오딧세이
            </h1>
            <p className="text-sm leading-7 text-black/70 dark:text-white/70">
              안녕하세요. 저는 대학교에서 생명과학과 빅데이터 분석을, 대학원에서
              LLM(이라고 하기엔 데이터 분석에 조금 더 가까웠습니다.. ) 를 공부했고
              현재는 전문연구요원으로 모 IT 업체에서 AI 개발을 하면서 먹고 살고
              있는 코알라라고 합니다.
            </p>
          </header>

          <section className="space-y-3 text-sm leading-7 text-black/70 dark:text-white/70">
            <p>
              제가 &quot;코알라 오딧세이&quot;라는 블로그를 개설하게 된 이유는 제
              별명인 &apos;코알라&apos;와 고대 그리스의 서사시이자 긴 여행을 의미하는
              &apos;오딧세이&apos;를 결합하여, 인생이라는 저만의 여정을 기록하고
              소중한 추억으로 간직하고자 함입니다.
            </p>
            <p>
              인생은 때로는 빠르게 달려가기도 하고, 때로는 그늘에서 휴식을 취하며
              여유를 즐기기도 하듯이, 이 블로그의 포스팅 역시 규칙적이지 않을 수
              있습니다. 하지만 그때그때의 경험과 생각을 솔직하게 나누고자 합니다.
            </p>
          </section>

          <section className="space-y-3 text-sm leading-7 text-black/70 dark:text-white/70">
            <p>
              이 블로그에서는 제가 현재 연구하고 있는 LLM 및 IT 기술에 대한 심도
              있는 이야기부터, 전문연구요원으로서의 일상적인 경험, 그리고 개인적인
              삶 속에서 겪는 다양한 에피소드까지 폭넓게 다룰 예정입니다. 또한, AI
              개발 과정에서의 도전과 성취 등도 공유하고자 합니다.
            </p>
            <p>
              저의 &quot;코알라 오딧세이&quot; 여정에 함께해 주신다면 큰 힘이 될 것입니다.
              앞으로 이 공간을 통해 많은 분들과 소통하며 서로의 경험과 지식을 나눌
              수 있기를 기대합니다. 지속적인 관심과 응원 부탁드리며, 잘 부탁드립니다!
            </p>
          </section>

          <footer className="text-sm leading-7 text-black/70 dark:text-white/70">
            <p>감사합니다.</p>
            <p className="mt-2">코알라 드림</p>
          </footer>
        </article>
      </Container>
    </main>
  );
}


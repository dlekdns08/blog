import { Container } from "@/components/Container";
import { WordCloud } from "@/components/WordCloud";

export const metadata = {
  title: "워드 클라우드",
  description: "블로그 글의 제목, 설명, 태그에서 추출한 핵심 키워드 시각화.",
};

export default function WordCloudPage() {
  return (
    <main className="py-10">
      <Container>
        <div className="space-y-2 mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">워드 클라우드</h1>
          <p className="text-sm leading-6 text-black/70 dark:text-white/70">
            블로그 글의 제목·설명·태그에서 추출한 핵심 키워드입니다.
          </p>
        </div>
        <WordCloud />
      </Container>
    </main>
  );
}

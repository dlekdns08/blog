import Link from "next/link";
import { Container } from "@/components/Container";
import { getAllPosts } from "@/lib/posts";

export default async function NotFound() {
  const recent = (await getAllPosts()).slice(0, 5);

  return (
    <main className="py-16">
      <Container>
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-7xl mb-4">🐨</div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            페이지를 찾지 못했어요
          </h1>
          <p className="text-sm text-muted mb-8">
            주소를 다시 확인해 주세요. 혹시 이런 글을 찾으셨나요?
          </p>

          <div className="flex justify-center gap-3 mb-10">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors"
            >
              홈으로
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-line bg-surface hover:border-accent text-body transition-colors"
            >
              🔍 검색
            </Link>
          </div>

          {recent.length > 0 && (
            <div className="text-left">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-subtle mb-3">
                최근 글
              </p>
              <ul className="space-y-1.5">
                {recent.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/posts/${p.slug}`}
                      className="block rounded-lg border border-line bg-surface px-3 py-2 text-sm text-body hover:border-accent hover:text-accent transition-colors"
                    >
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Container>
    </main>
  );
}

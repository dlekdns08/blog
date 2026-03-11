import Link from "next/link";
import { Container } from "@/components/Container";

export default function NotFound() {
  return (
    <main className="py-16">
      <Container>
        <h1 className="text-2xl font-semibold tracking-tight">페이지를 찾을 수 없어요.</h1>
        <p className="mt-3 text-sm text-black/70 dark:text-white/70">
          주소가 잘못되었거나, 삭제된 페이지일 수 있습니다.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
          >
            홈으로
          </Link>
        </div>
      </Container>
    </main>
  );
}


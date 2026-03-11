import Link from "next/link";
import { Container } from "@/components/Container";

export function SiteHeader() {
  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <Container>
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="font-semibold tracking-tight">
            이다운의 코알라 오딧세이
          </Link>
          <nav className="flex items-center gap-4 text-sm text-black/70 dark:text-white/70">
            <Link href="/posts" className="hover:text-black dark:hover:text-white">
              글
            </Link>
            <Link href="/about" className="hover:text-black dark:hover:text-white">
              소개
            </Link>
          </nav>
        </div>
      </Container>
    </header>
  );
}


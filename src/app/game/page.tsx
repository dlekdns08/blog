import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { KoalaGame } from "@/components/KoalaGame";
import { KoalaRanking } from "@/components/KoalaRanking";

export const metadata: Metadata = {
  title: "코알라 점프",
  description: "귀여운 코알라와 함께하는 점프 게임!",
};

export default function GamePage() {
  return (
    <main className="py-10">
      <Container>
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-2">🐨 코알라 점프</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            장애물을 피해 달려보세요. 얼마나 멀리 갈 수 있을까요?
          </p>
        </div>
        <KoalaGame />
      </Container>
    </main>
  );
}

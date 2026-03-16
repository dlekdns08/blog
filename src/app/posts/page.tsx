import { Container } from "@/components/Container";
import { PostList } from "@/components/PostList";
import { getAllPosts } from "@/lib/posts";

export const metadata = {
  title: "글",
};

type Props = {
  searchParams: Promise<{
    category?: string;
    sub?: string;
    subsub?: string;
  }>;
};

export default async function PostsPage({ searchParams }: Props) {
  const [posts, params] = await Promise.all([getAllPosts(), searchParams]);

  return (
    <main className="py-10">
      <Container>
        <div className="space-y-2 mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">글</h1>
          <p className="text-sm leading-6 text-black/70 dark:text-white/70">
            작성한 글 목록입니다.
          </p>
        </div>

        <PostList
          posts={posts}
          initialCategory={params.category ?? null}
          initialSub={params.sub ?? null}
          initialSubSub={params.subsub ?? null}
        />
      </Container>
    </main>
  );
}

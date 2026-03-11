import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { getAllPosts, getPostBySlug } from "@/lib/posts";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getPostBySlug(slug);
    return {
      title: post.meta.title,
      description: post.meta.description,
    };
  } catch {
    return { title: "글을 찾을 수 없음" };
  }
}

export default async function PostDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let post: Awaited<ReturnType<typeof getPostBySlug>>;
  try {
    post = await getPostBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <main className="py-10">
      <Container>
        <div className="space-y-2">
          <Link
            href="/posts"
            className="text-sm text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white"
          >
            ← 글 목록
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{post.meta.title}</h1>
          <div className="text-xs text-black/60 dark:text-white/60">
            <time>{post.meta.date}</time>
          </div>
          {post.meta.description ? (
            <p className="text-sm leading-6 text-black/70 dark:text-white/70">
              {post.meta.description}
            </p>
          ) : null}
        </div>

        <article
          className="prose prose-zinc mt-8 max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
      </Container>
    </main>
  );
}


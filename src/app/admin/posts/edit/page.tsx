import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PostForm } from '@/components/admin/PostForm'

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts')

type Props = { searchParams: Promise<{ slug?: string }> }

export default async function EditPostPage({ searchParams }: Props) {
  const { slug } = await searchParams

  if (!slug) notFound()

  const filePath = path.join(POSTS_DIR, `${slug}.md`)

  let frontmatter: Record<string, unknown>
  let content: string

  try {
    const raw = await fs.readFile(filePath, 'utf8')
    const parsed = matter(raw)
    frontmatter = parsed.data
    content = parsed.content.trimStart()
  } catch {
    notFound()
  }

  const tagsRaw = frontmatter.tags
  const tagsStr = Array.isArray(tagsRaw) ? tagsRaw.join(', ') : ''

  const attachmentsRaw = frontmatter.attachments
  const initialAttachments = Array.isArray(attachmentsRaw)
    ? attachmentsRaw
        .filter((a) => a && typeof a.name === 'string' && typeof a.file === 'string')
        .map((a) => ({ name: String(a.name), file: String(a.file) }))
    : []

  return (
    <main className="py-8 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/admin/dashboard"
            className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            ← 목록으로
          </Link>
          <span className="text-zinc-200 dark:text-zinc-700">/</span>
          <h1 className="text-xl font-bold">글 수정</h1>
          <span className="text-xs font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
            {slug}
          </span>
        </div>

        <PostForm
          mode="edit"
          slug={slug}
          initialTitle={String(frontmatter.title ?? '')}
          initialDate={String(frontmatter.date ?? '')}
          initialDescription={String(frontmatter.description ?? '')}
          initialTags={tagsStr}
          initialContent={content}
          initialAttachments={initialAttachments}
        />
      </div>
    </main>
  )
}

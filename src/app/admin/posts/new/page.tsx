import Link from 'next/link'
import { PostForm } from '@/components/admin/PostForm'

export default function NewPostPage() {
  const today = new Date().toISOString().split('T')[0]

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
          <h1 className="text-xl font-bold">새 글 쓰기</h1>
        </div>

        <PostForm mode="create" initialDate={today} />
      </div>
    </main>
  )
}

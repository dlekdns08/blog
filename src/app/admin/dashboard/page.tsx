import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'
import { DeleteButton } from '@/components/admin/DeleteButton'
import { LogoutButton } from '@/components/admin/LogoutButton'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const posts = await getAllPosts()

  return (
    <main className="py-8 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">관리자 패널</h1>
            <p className="text-sm text-muted mt-1">
              총 {posts.length}개의 글
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/posts/new"
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              + 새 글 쓰기
            </Link>
            <LogoutButton />
          </div>
        </div>

        {/* 포스트 목록 */}
        <div className="rounded-xl border border-divider overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-divider bg-zinc-50 dark:bg-zinc-900/50">
                <th className="text-left px-4 py-3 font-medium text-zinc-500">제목</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500 hidden md:table-cell">
                  경로
                </th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500 hidden sm:table-cell">
                  날짜
                </th>
                <th className="px-4 py-3 w-40" />
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr
                  key={post.slug}
                  className="border-b last:border-0 border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/posts/${post.slug}`}
                      target="_blank"
                      className="font-medium hover:text-violet-600 dark:hover:text-violet-400 transition-colors line-clamp-1"
                    >
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 font-mono text-xs hidden md:table-cell">
                    {post.slug}
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-xs hidden sm:table-cell tabular-nums">
                    {post.date}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        href={`/admin/posts/edit?slug=${post.slug}`}
                        className="px-3 py-1 text-xs font-medium rounded-md border border-divider hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                      >
                        수정
                      </Link>
                      <DeleteButton slug={post.slug} />
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-16 text-center text-zinc-400 text-sm"
                  >
                    작성된 글이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}

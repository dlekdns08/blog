'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function DeleteButton({ slug }: { slug: string }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/posts/${slug}`, { method: 'DELETE' })
      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error ?? '삭제 실패')
      }
    } finally {
      setDeleting(false)
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-zinc-400">정말 삭제?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-2 py-1 text-xs font-medium rounded-md bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
        >
          {deleting ? '...' : '확인'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-2 py-1 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 transition-colors"
        >
          취소
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="px-3 py-1 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-700 hover:border-red-400 hover:text-red-500 transition-colors"
    >
      삭제
    </button>
  )
}

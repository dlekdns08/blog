'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MarkdownEditor } from './MarkdownEditor'

type Props = {
  mode: 'create' | 'edit'
  slug?: string
  initialTitle?: string
  initialDate?: string
  initialDescription?: string
  initialTags?: string
  initialContent?: string
}

export function PostForm({
  mode,
  slug: initialSlug = '',
  initialTitle = '',
  initialDate = '',
  initialDescription = '',
  initialTags = '',
  initialContent = '',
}: Props) {
  const [slug, setSlug] = useState(initialSlug)
  const [title, setTitle] = useState(initialTitle)
  const [date, setDate] = useState(initialDate)
  const [description, setDescription] = useState(initialDescription)
  const [tags, setTags] = useState(initialTags)
  const [content, setContent] = useState(initialContent)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const tagList = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    try {
      if (mode === 'create') {
        const res = await fetch('/api/admin/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, title, date, description, tags: tagList, content }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        router.push('/admin/dashboard')
        router.refresh()
      } else {
        const res = await fetch(`/api/admin/posts/${initialSlug}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, date, description, tags: tagList, content }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        router.push('/admin/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mode === 'create' && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1.5">
              경로 (slug) <span className="text-red-500">*</span>
            </label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="예: ai/LLM/my-new-post"
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 outline-none focus:ring-2 focus:ring-violet-500 font-mono"
            />
            <p className="mt-1 text-xs text-zinc-400">
              영문, 숫자, /, -, _ 사용 가능 · 카테고리 구분은 /로
            </p>
          </div>
        )}

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1.5">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="글 제목"
            required
            className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            날짜 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">태그</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="태그1, 태그2, 태그3"
            className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1.5">설명</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="글 설명 (선택사항)"
            className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">내용</label>
        <MarkdownEditor value={content} onChange={setContent} />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center gap-3 pt-2 pb-6">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {saving ? '저장 중...' : mode === 'create' ? '글 발행' : '수정 저장'}
        </button>
        <Link
          href="/admin/dashboard"
          className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
        >
          취소
        </Link>
      </div>
    </form>
  )
}

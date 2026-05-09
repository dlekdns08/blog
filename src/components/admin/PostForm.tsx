'use client'

import { useState, useCallback, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MarkdownEditor } from './MarkdownEditor'
import { CategoryPicker, type CategoryParts } from './CategoryPicker'

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
  const [catParts, setCatParts] = useState<CategoryParts>({
    category: '',
    subcategory: '',
    subSubcategory: '',
  })
  const [filename, setFilename] = useState('')
  const [title, setTitle] = useState(initialTitle)
  const [date, setDate] = useState(initialDate)
  const [description, setDescription] = useState(initialDescription)
  const [tags, setTags] = useState(initialTags)
  const [content, setContent] = useState(initialContent)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleCategoryChange = useCallback((parts: CategoryParts) => {
    setCatParts(parts)
  }, [])

  // 카테고리 선택 + 파일명으로 최종 slug 조합
  const computedSlug = [
    catParts.category,
    catParts.subcategory,
    catParts.subSubcategory,
    filename,
  ]
    .filter(Boolean)
    .join('/')

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
        if (!catParts.category) {
          setError('카테고리를 선택해주세요.')
          setSaving(false)
          return
        }
        if (!filename.trim()) {
          setError('파일명을 입력해주세요.')
          setSaving(false)
          return
        }
        const res = await fetch('/api/admin/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: computedSlug, title, date, description, tags: tagList, content }),
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
          <>
            {/* 카테고리 선택기 */}
            <div className="md:col-span-2 rounded-xl border border-divider p-4 space-y-4">
              <CategoryPicker onChange={handleCategoryChange} />

              {/* 파일명 입력 */}
              {catParts.category && (
                <div>
                  <label className="text-xs font-medium text-muted block mb-2">
                    파일명 <span className="text-red-500">*</span>
                    <span className="font-normal text-zinc-400 ml-1">(영문, 숫자, -, _ 사용)</span>
                  </label>
                  <input
                    value={filename}
                    onChange={(e) => setFilename(e.target.value.replace(/[^a-zA-Z0-9_-]/g, '-'))}
                    placeholder="my-new-post"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-divider bg-panel outline-none focus:ring-2 focus:ring-violet-500 font-mono"
                  />
                </div>
              )}

              {/* 최종 slug 미리보기 */}
              {computedSlug && (
                <div className="flex items-center gap-2 text-xs text-subtle font-mono bg-zinc-50 dark:bg-zinc-900/50 px-3 py-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-300 dark:text-zinc-600">경로:</span>
                  <span className="text-accent">content/posts/</span>
                  <span className="text-body">{computedSlug}.md</span>
                </div>
              )}
            </div>
          </>
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
            className="w-full px-3 py-2 text-sm rounded-lg border border-divider bg-panel outline-none focus:ring-2 focus:ring-violet-500"
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
            className="w-full px-3 py-2 text-sm rounded-lg border border-divider bg-panel outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">태그</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="태그1, 태그2, 태그3"
            className="w-full px-3 py-2 text-sm rounded-lg border border-divider bg-panel outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1.5">설명</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="글 설명 (선택사항)"
            className="w-full px-3 py-2 text-sm rounded-lg border border-divider bg-panel outline-none focus:ring-2 focus:ring-violet-500"
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

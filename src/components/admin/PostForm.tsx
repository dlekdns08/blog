'use client'

import { useState, useCallback, useRef, FormEvent, ChangeEvent, DragEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MarkdownEditor } from './MarkdownEditor'
import { CategoryPicker, type CategoryParts } from './CategoryPicker'

type Attachment = { name: string; file: string }

type Props = {
  mode: 'create' | 'edit'
  slug?: string
  initialTitle?: string
  initialDate?: string
  initialDescription?: string
  initialTags?: string
  initialContent?: string
  initialAttachments?: Attachment[]
}

export function PostForm({
  mode,
  slug: initialSlug = '',
  initialTitle = '',
  initialDate = '',
  initialDescription = '',
  initialTags = '',
  initialContent = '',
  initialAttachments = [],
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
  const [attachments, setAttachments] = useState<Attachment[]>(initialAttachments)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [suggestingTags, setSuggestingTags] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleCategoryChange = useCallback((parts: CategoryParts) => {
    setCatParts(parts)
  }, [])

  // 카테고리 선택 + 파일명으로 최종 slug 조합 (create), edit는 initialSlug 사용
  const computedSlug =
    mode === 'edit'
      ? initialSlug
      : [catParts.category, catParts.subcategory, catParts.subSubcategory, filename]
          .filter(Boolean)
          .join('/')

  // ── 파일 업로드 ────────────────────────────────────────────
  async function uploadFiles(files: FileList | File[]) {
    if (!computedSlug) {
      setError('업로드 전에 카테고리/파일명을 입력해주세요.')
      return
    }
    setError('')
    setInfo('')
    setUploading(true)
    const added: Attachment[] = []
    let firstError: string | null = null

    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('slug', computedSlug)
      try {
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok) {
          if (!firstError) firstError = data.error ?? `${file.name} 업로드 실패`
          continue
        }
        added.push({ name: data.name as string, file: data.file as string })
      } catch (e) {
        if (!firstError) firstError = (e instanceof Error ? e.message : '업로드 실패')
      }
    }

    if (added.length > 0) {
      setAttachments((prev) => [...prev, ...added])
      setInfo(`${added.length}개 파일 업로드 완료`)
    }
    if (firstError) setError(firstError)
    setUploading(false)
  }

  function onFileInputChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files)
      e.target.value = ''
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) uploadFiles(e.dataTransfer.files)
  }

  function removeAttachment(idx: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== idx))
  }

  // ── AI 태그 추천 ───────────────────────────────────────────
  async function suggestTags() {
    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 먼저 입력해주세요.')
      return
    }
    setError('')
    setInfo('')
    setSuggestingTags(true)
    try {
      const res = await fetch('/api/admin/suggest-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'AI 응답 실패')
      const existing = new Set(
        tags.split(',').map((t) => t.trim()).filter(Boolean),
      )
      const added: string[] = []
      ;(data.tags as string[]).forEach((t) => {
        if (!existing.has(t)) {
          existing.add(t)
          added.push(t)
        }
      })
      setTags([...existing].join(', '))
      setInfo(added.length > 0 ? `${added.length}개 태그 추가됨` : '새로 추가할 태그 없음')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'AI 추천 실패')
    } finally {
      setSuggestingTags(false)
    }
  }

  // ── 제출 ────────────────────────────────────────────────
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setInfo('')

    const tagList = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const body = { title, date, description, tags: tagList, content, attachments }

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
          body: JSON.stringify({ slug: computedSlug, ...body }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        router.push('/admin/dashboard')
        router.refresh()
      } else {
        const res = await fetch(`/api/admin/posts/${initialSlug}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
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
          <label className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium">태그</span>
            <button
              type="button"
              onClick={suggestTags}
              disabled={suggestingTags || !title.trim() || !content.trim()}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:text-violet-700 dark:hover:text-violet-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="제목+본문 기반으로 Claude가 태그 추천"
            >
              <svg className="size-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1.5a.75.75 0 0 1 .75.75V7.5h-1.5V2.25A.75.75 0 0 1 12 1.5ZM5.636 4.136a.75.75 0 0 1 1.06 0l2.653 2.654-1.06 1.06L5.636 5.197a.75.75 0 0 1 0-1.06Zm12.728 0a.75.75 0 0 1 0 1.06l-2.652 2.653-1.061-1.06 2.652-2.653a.75.75 0 0 1 1.06 0Z" />
              </svg>
              {suggestingTags ? '추천 중...' : '✨ AI 추천'}
            </button>
          </label>
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

        {/* ── 첨부 파일 ─────────────────────────────────── */}
        <div className="md:col-span-2 space-y-2">
          <label className="block text-sm font-medium mb-1.5">
            첨부 파일{' '}
            <span className="text-xs font-normal text-subtle ml-1">
              (이미지·PDF·zip 등 · 최대 10MB)
            </span>
          </label>

          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`rounded-xl border-2 border-dashed px-4 py-6 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-accent bg-violet-50/40 dark:bg-violet-500/10'
                : 'border-divider hover:border-accent bg-surface'
            } ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={onFileInputChange}
              className="hidden"
            />
            <p className="text-sm text-muted">
              {uploading ? '업로드 중...' : '파일을 드래그하거나 클릭해서 선택'}
            </p>
            {!computedSlug && mode === 'create' && (
              <p className="text-[11px] text-subtle mt-1">
                ※ 카테고리/파일명을 먼저 입력해주세요
              </p>
            )}
          </div>

          {attachments.length > 0 && (
            <ul className="space-y-1">
              {attachments.map((a, i) => (
                <li
                  key={`${a.file}-${i}`}
                  className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm"
                >
                  <span className="text-subtle">📎</span>
                  <span className="flex-1 truncate font-mono text-xs text-body">{a.file}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(i)}
                    className="text-xs text-subtle hover:text-red-500 transition-colors"
                  >
                    제거
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">내용</label>
        <MarkdownEditor value={content} onChange={setContent} />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {info && <p className="text-sm text-accent">{info}</p>}

      <div className="flex items-center gap-3 pt-2 pb-6">
        <button
          type="submit"
          disabled={saving || uploading}
          className="px-6 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {saving ? '저장 중...' : mode === 'create' ? '글 발행' : '수정 저장'}
        </button>
        <Link
          href="/admin/dashboard"
          className="px-4 py-2 text-sm text-muted hover:text-body transition-colors"
        >
          취소
        </Link>
      </div>
    </form>
  )
}

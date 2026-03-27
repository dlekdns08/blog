'use client'

import { useState, useEffect, KeyboardEvent } from 'react'
import { CATEGORY_CONFIG } from '@/lib/categories'
import type { CategoryData } from '@/lib/categories'

export type CategoryParts = {
  category: string
  subcategory: string
  subSubcategory: string
}

type Props = {
  onChange: (parts: CategoryParts) => void
}

type AddingState = { level: 1 | 2 | 3; value: string }

const PILL = 'px-3 py-1.5 text-sm rounded-lg border transition-colors cursor-pointer select-none'
const PILL_ACTIVE = 'border-violet-500 bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-medium'
const PILL_IDLE = 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-violet-300 dark:hover:border-violet-700 text-zinc-700 dark:text-zinc-300'
const PILL_NEW = 'border-dashed border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 hover:border-violet-400 hover:text-violet-600 dark:hover:border-violet-600'

export function CategoryPicker({ onChange }: Props) {
  const [tree, setTree] = useState<CategoryData[]>([])
  const [category, setCategory] = useState('')
  const [subcategory, setSubcategory] = useState('')
  const [subSubcategory, setSubSubcategory] = useState('')

  // 사용자가 이 세션에서 추가한 새 카테고리
  const [extraL1, setExtraL1] = useState<string[]>([])
  const [extraL2, setExtraL2] = useState<Record<string, string[]>>({})
  const [extraL3, setExtraL3] = useState<Record<string, string[]>>({})

  // 인라인 새 카테고리 입력 상태
  const [adding, setAdding] = useState<AddingState | null>(null)

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then((data) => setTree(data.categories ?? []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    onChange({ category, subcategory, subSubcategory })
  }, [category, subcategory, subSubcategory, onChange])

  // ── L1 옵션 계산 ──────────────────────────────────────────
  const l1Options: { name: string; label: string; icon: string }[] = []
  const seenL1 = new Set<string>()

  for (const [name, cfg] of Object.entries(CATEGORY_CONFIG)) {
    l1Options.push({ name, label: cfg.label, icon: cfg.icon })
    seenL1.add(name)
  }
  for (const c of tree) {
    if (!seenL1.has(c.name)) {
      l1Options.push({ name: c.name, label: c.label, icon: c.icon })
      seenL1.add(c.name)
    }
  }
  for (const name of extraL1) {
    if (!seenL1.has(name)) {
      l1Options.push({ name, label: name, icon: '📁' })
      seenL1.add(name)
    }
  }

  // ── L2 옵션 계산 ──────────────────────────────────────────
  const selectedCatNode = tree.find((c) => c.name === category)
  const l2Options = [
    ...new Set([
      ...(selectedCatNode?.children.map((c) => c.name) ?? []),
      ...(extraL2[category] ?? []),
    ]),
  ]

  // ── L3 옵션 계산 ──────────────────────────────────────────
  const selectedSubNode = selectedCatNode?.children.find((c) => c.name === subcategory)
  const l3Options = [
    ...new Set([
      ...(selectedSubNode?.children.map((c) => c.name) ?? []),
      ...(extraL3[`${category}/${subcategory}`] ?? []),
    ]),
  ]

  // ── 선택 핸들러 ───────────────────────────────────────────
  function selectL1(name: string) {
    setCategory(name)
    setSubcategory('')
    setSubSubcategory('')
    setAdding(null)
  }

  function selectL2(name: string) {
    setSubcategory((prev) => (prev === name ? '' : name))
    setSubSubcategory('')
    setAdding(null)
  }

  function selectL3(name: string) {
    setSubSubcategory((prev) => (prev === name ? '' : name))
    setAdding(null)
  }

  // ── 새 카테고리 추가 ──────────────────────────────────────
  function sanitize(val: string) {
    return val.trim().replace(/\s+/g, '-')
  }

  function confirmNew() {
    if (!adding) return
    const val = sanitize(adding.value)
    if (!val) { setAdding(null); return }

    if (adding.level === 1) {
      setExtraL1((prev) => (prev.includes(val) ? prev : [...prev, val]))
      selectL1(val)
    } else if (adding.level === 2 && category) {
      setExtraL2((prev) => ({
        ...prev,
        [category]: [...new Set([...(prev[category] ?? []), val])],
      }))
      selectL2(val)
    } else if (adding.level === 3 && subcategory) {
      const key = `${category}/${subcategory}`
      setExtraL3((prev) => ({
        ...prev,
        [key]: [...new Set([...(prev[key] ?? []), val])],
      }))
      selectL3(val)
    }
    setAdding(null)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); confirmNew() }
    if (e.key === 'Escape') setAdding(null)
  }

  // ── 인라인 입력 UI ────────────────────────────────────────
  function NewInput({ level }: { level: 1 | 2 | 3 }) {
    const placeholder = level === 1 ? '카테고리명' : level === 2 ? '서브카테고리명' : '세부분류명'
    return adding?.level === level ? (
      <span className="inline-flex items-center gap-1">
        <input
          autoFocus
          value={adding.value}
          onChange={(e) => setAdding({ level, value: e.target.value })}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="px-2 py-1.5 text-sm rounded-lg border border-violet-400 outline-none w-32 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
        />
        <button
          type="button"
          onClick={confirmNew}
          className="text-xs px-2.5 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
        >
          추가
        </button>
        <button
          type="button"
          onClick={() => setAdding(null)}
          className="text-xs px-2 py-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          취소
        </button>
      </span>
    ) : (
      <button
        type="button"
        onClick={() => setAdding({ level, value: '' })}
        className={`${PILL} ${PILL_NEW}`}
      >
        + 새 {placeholder}
      </button>
    )
  }

  return (
    <div className="space-y-4">
      {/* L1 카테고리 */}
      <div>
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
          카테고리 <span className="text-red-500">*</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {l1Options.map((opt) => (
            <button
              key={opt.name}
              type="button"
              onClick={() => selectL1(opt.name)}
              className={`${PILL} ${category === opt.name ? PILL_ACTIVE : PILL_IDLE}`}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
          <NewInput level={1} />
        </div>
      </div>

      {/* L2 서브카테고리 */}
      {category && (
        <div>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
            서브카테고리{' '}
            <span className="font-normal text-zinc-400">(선택 — 건너뛰면 {category}/ 바로 저장)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {l2Options.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => selectL2(name)}
                className={`${PILL} ${subcategory === name ? PILL_ACTIVE : PILL_IDLE}`}
              >
                {name}
              </button>
            ))}
            <NewInput level={2} />
          </div>
        </div>
      )}

      {/* L3 세부 분류 */}
      {subcategory && (
        <div>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
            세부 분류{' '}
            <span className="font-normal text-zinc-400">(선택)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {l3Options.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => selectL3(name)}
                className={`${PILL} ${subSubcategory === name ? PILL_ACTIVE : PILL_IDLE}`}
              >
                {name}
              </button>
            ))}
            <NewInput level={3} />
          </div>
        </div>
      )}
    </div>
  )
}

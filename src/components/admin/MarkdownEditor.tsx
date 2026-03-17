'use client'

import dynamic from 'next/dynamic'

const MDEditor = dynamic(() => import('@uiw/react-md-editor').then((m) => m.default), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-sm text-zinc-400">
      에디터 로딩 중...
    </div>
  ),
})

type Props = {
  value: string
  onChange: (value: string) => void
  height?: number
}

export function MarkdownEditor({ value, onChange, height = 500 }: Props) {
  return (
    <div data-color-mode="auto">
      <MDEditor
        value={value}
        onChange={(v) => onChange(v ?? '')}
        height={height}
        preview="live"
      />
    </div>
  )
}

import type { ReactNode } from 'react'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'
import { MdEditorThemeSync } from '@/components/admin/MdEditorThemeSync'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <MdEditorThemeSync />
      {children}
    </>
  )
}

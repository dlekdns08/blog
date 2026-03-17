import type { ReactNode } from 'react'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}

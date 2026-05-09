'use client'

import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 text-sm font-medium rounded-lg border border-divider hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
    >
      로그아웃
    </button>
  )
}

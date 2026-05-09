import { NextRequest, NextResponse } from 'next/server'
import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import { getAllPosts } from '@/lib/posts'
import { upsertGitHubFile } from '@/lib/github'
import { revalidatePath } from 'next/cache'

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts')

export async function GET() {
  const posts = await getAllPosts()
  return NextResponse.json(posts)
}

export async function POST(request: NextRequest) {
  const { slug, title, date, description, tags, content, attachments } = await request.json()

  if (!slug || !title || !date) {
    return NextResponse.json({ error: 'slug, title, date는 필수입니다.' }, { status: 400 })
  }

  if (!/^[a-zA-Z0-9/_-]+$/.test(slug)) {
    return NextResponse.json(
      { error: 'slug는 영문, 숫자, /, -, _만 사용 가능합니다.' },
      { status: 400 },
    )
  }

  const localPath = path.join(POSTS_DIR, `${slug}.md`)
  const repoPath = `content/posts/${slug}.md`

  try {
    await fs.access(localPath)
    return NextResponse.json({ error: '이미 존재하는 슬러그입니다.' }, { status: 409 })
  } catch {
    // 파일 없음 — 계속 진행
  }

  const frontmatter: Record<string, unknown> = { title, date }
  if (description) frontmatter.description = description
  if (Array.isArray(tags) && tags.length > 0) frontmatter.tags = tags
  if (Array.isArray(attachments) && attachments.length > 0) {
    frontmatter.attachments = attachments
      .filter((a) => a && typeof a.name === 'string' && typeof a.file === 'string')
      .map((a) => ({ name: a.name, file: a.file }))
  }

  const fileContent = matter.stringify(content ?? '', frontmatter)

  // 1. 로컬 파일시스템에 저장 (즉시 반영)
  await fs.mkdir(path.dirname(localPath), { recursive: true })
  await fs.writeFile(localPath, fileContent, 'utf8')

  // 2. GitHub에 커밋
  try {
    await upsertGitHubFile(repoPath, fileContent, `docs: ${title} 글 추가`)
  } catch (err) {
    // 로컬엔 저장됐지만 GitHub 실패 — 에러 반환
    await fs.unlink(localPath).catch(() => {})
    const message = err instanceof Error ? err.message : 'GitHub 커밋 실패'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  revalidatePath('/posts', 'page')
  revalidatePath(`/posts/${slug}`, 'page')
  revalidatePath('/', 'page')

  return NextResponse.json({ success: true, slug })
}

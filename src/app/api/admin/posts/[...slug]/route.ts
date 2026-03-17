import { NextRequest, NextResponse } from 'next/server'
import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import { upsertGitHubFile, deleteGitHubFile } from '@/lib/github'
import { revalidatePath } from 'next/cache'

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts')

type Params = { params: Promise<{ slug: string[] }> }

function getLocalPath(slug: string[]): string {
  return path.join(POSTS_DIR, `${slug.join('/')}.md`)
}

function getRepoPath(slug: string[]): string {
  return `content/posts/${slug.join('/')}.md`
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params

  try {
    const raw = await fs.readFile(getLocalPath(slug), 'utf8')
    const { data, content } = matter(raw)
    return NextResponse.json({ frontmatter: data, content: content.trimStart() })
  } catch {
    return NextResponse.json({ error: '포스트를 찾을 수 없습니다.' }, { status: 404 })
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { slug } = await params
  const localPath = getLocalPath(slug)
  const repoPath = getRepoPath(slug)
  const { title, date, description, tags, content } = await request.json()

  if (!title || !date) {
    return NextResponse.json({ error: 'title, date는 필수입니다.' }, { status: 400 })
  }

  try {
    await fs.access(localPath)
  } catch {
    return NextResponse.json({ error: '포스트를 찾을 수 없습니다.' }, { status: 404 })
  }

  const frontmatter: Record<string, unknown> = { title, date }
  if (description) frontmatter.description = description
  if (Array.isArray(tags) && tags.length > 0) frontmatter.tags = tags

  const fileContent = matter.stringify(content ?? '', frontmatter)

  // 롤백을 위해 기존 내용 백업
  const previous = await fs.readFile(localPath, 'utf8')

  // 1. 로컬 파일시스템 업데이트
  await fs.writeFile(localPath, fileContent, 'utf8')

  // 2. GitHub에 커밋
  try {
    await upsertGitHubFile(repoPath, fileContent, `docs: ${title} 글 수정`)
  } catch (err) {
    // 실패 시 로컬 롤백
    await fs.writeFile(localPath, previous, 'utf8')
    const message = err instanceof Error ? err.message : 'GitHub 커밋 실패'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  const slugStr = slug.join('/')
  revalidatePath('/posts', 'page')
  revalidatePath(`/posts/${slugStr}`, 'page')
  revalidatePath('/', 'page')

  return NextResponse.json({ success: true })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { slug } = await params
  const localPath = getLocalPath(slug)
  const repoPath = getRepoPath(slug)

  // 롤백을 위해 기존 내용 백업
  let previous: string
  try {
    previous = await fs.readFile(localPath, 'utf8')
  } catch {
    return NextResponse.json({ error: '포스트를 찾을 수 없습니다.' }, { status: 404 })
  }

  // 1. 로컬 파일 삭제
  await fs.unlink(localPath)

  // 2. GitHub에서 삭제
  try {
    await deleteGitHubFile(repoPath, `docs: ${slug.join('/')} 글 삭제`)
  } catch (err) {
    // 실패 시 로컬 롤백
    await fs.writeFile(localPath, previous, 'utf8')
    const message = err instanceof Error ? err.message : 'GitHub 삭제 실패'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  const slugStr = slug.join('/')
  revalidatePath('/posts', 'page')
  revalidatePath(`/posts/${slugStr}`, 'page')
  revalidatePath('/', 'page')

  return NextResponse.json({ success: true })
}

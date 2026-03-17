import { NextRequest, NextResponse } from 'next/server'
import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import { revalidatePath } from 'next/cache'

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts')

type Params = { params: Promise<{ slug: string[] }> }

function getFilePath(slug: string[]): string {
  return path.join(POSTS_DIR, `${slug.join('/')}.md`)
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params
  const filePath = getFilePath(slug)

  try {
    const raw = await fs.readFile(filePath, 'utf8')
    const { data, content } = matter(raw)
    return NextResponse.json({ frontmatter: data, content: content.trimStart() })
  } catch {
    return NextResponse.json({ error: '포스트를 찾을 수 없습니다.' }, { status: 404 })
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { slug } = await params
  const filePath = getFilePath(slug)
  const { title, date, description, tags, content } = await request.json()

  if (!title || !date) {
    return NextResponse.json({ error: 'title, date는 필수입니다.' }, { status: 400 })
  }

  try {
    await fs.access(filePath)
  } catch {
    return NextResponse.json({ error: '포스트를 찾을 수 없습니다.' }, { status: 404 })
  }

  const frontmatter: Record<string, unknown> = { title, date }
  if (description) frontmatter.description = description
  if (Array.isArray(tags) && tags.length > 0) frontmatter.tags = tags

  const fileContent = matter.stringify(content ?? '', frontmatter)
  await fs.writeFile(filePath, fileContent, 'utf8')

  const slugStr = slug.join('/')
  revalidatePath('/posts', 'page')
  revalidatePath(`/posts/${slugStr}`, 'page')
  revalidatePath('/', 'page')

  return NextResponse.json({ success: true })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { slug } = await params
  const filePath = getFilePath(slug)

  try {
    await fs.unlink(filePath)
  } catch {
    return NextResponse.json({ error: '포스트를 찾을 수 없습니다.' }, { status: 404 })
  }

  const slugStr = slug.join('/')
  revalidatePath('/posts', 'page')
  revalidatePath(`/posts/${slugStr}`, 'page')
  revalidatePath('/', 'page')

  return NextResponse.json({ success: true })
}

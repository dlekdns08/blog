import { NextRequest, NextResponse } from 'next/server'
import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import { getAllPosts } from '@/lib/posts'
import { revalidatePath } from 'next/cache'

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts')

export async function GET() {
  const posts = await getAllPosts()
  return NextResponse.json(posts)
}

export async function POST(request: NextRequest) {
  const { slug, title, date, description, tags, content } = await request.json()

  if (!slug || !title || !date) {
    return NextResponse.json({ error: 'slug, title, date는 필수입니다.' }, { status: 400 })
  }

  if (!/^[a-zA-Z0-9/_-]+$/.test(slug)) {
    return NextResponse.json(
      { error: 'slug는 영문, 숫자, /, -, _만 사용 가능합니다.' },
      { status: 400 },
    )
  }

  const filePath = path.join(POSTS_DIR, `${slug}.md`)

  try {
    await fs.access(filePath)
    return NextResponse.json({ error: '이미 존재하는 슬러그입니다.' }, { status: 409 })
  } catch {
    // File doesn't exist — proceed
  }

  await fs.mkdir(path.dirname(filePath), { recursive: true })

  const frontmatter: Record<string, unknown> = { title, date }
  if (description) frontmatter.description = description
  if (Array.isArray(tags) && tags.length > 0) frontmatter.tags = tags

  const fileContent = matter.stringify(content ?? '', frontmatter)
  await fs.writeFile(filePath, fileContent, 'utf8')

  revalidatePath('/posts', 'page')
  revalidatePath(`/posts/${slug}`, 'page')
  revalidatePath('/', 'page')

  return NextResponse.json({ success: true, slug })
}

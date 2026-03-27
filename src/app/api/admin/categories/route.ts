import { NextResponse } from 'next/server'
import { getAllPosts } from '@/lib/posts'
import { buildCategoryTree } from '@/lib/categories'

export async function GET() {
  const posts = await getAllPosts()
  const categories = buildCategoryTree(posts)
  return NextResponse.json({ categories })
}

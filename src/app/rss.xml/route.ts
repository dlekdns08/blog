import { getAllPosts } from '@/lib/posts'

export const revalidate = 300

export async function GET() {
  const posts = await getAllPosts()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://koala.ai.kr'

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>이다운의 코알라 오딧세이</title>
    <link>${siteUrl}</link>
    <description>코알라의 여정을 기록하는 블로그. LLM/IT 기술, 전문연구요원 일상, AI 개발의 도전과 성취를 나눕니다.</description>
    <language>ko</language>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${posts.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/posts/${post.slug}</link>
      <guid>${siteUrl}/posts/${post.slug}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description><![CDATA[${post.description || post.title}]]></description>
    </item>`).join('')}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

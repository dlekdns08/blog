import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";

export const revalidate = 300;

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://koala.ai.kr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE}/posts/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,              lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/posts`,   lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/about`,   lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/game`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/stats`,   lastModified: new Date(), changeFrequency: "daily",   priority: 0.4 },
    { url: `${BASE}/explore`, lastModified: new Date(), changeFrequency: "weekly",  priority: 0.6 },
    { url: `${BASE}/changelog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.3 },
  ];

  return [...staticPages, ...postEntries];
}

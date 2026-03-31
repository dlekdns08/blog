import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

type Params = { slug: string[] };

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  const { slug } = await params;
  const slugPath = slug.map(decodeURIComponent).join("/");
  const filePath = path.join(POSTS_DIR, `${slugPath}.md`);

  try {
    const raw = await fs.readFile(filePath, "utf8");
    const { data, content } = matter(raw);
    return NextResponse.json({ title: data.title, content });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

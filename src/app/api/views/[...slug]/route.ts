import { NextRequest, NextResponse } from "next/server";

const API = process.env.API_URL ?? "https://api.koala.ai.kr";

type Params = { params: Promise<{ slug: string[] }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const slugStr = slug.map(decodeURIComponent).join("/");
  try {
    const res = await fetch(`${API}/posts/${slugStr}/view`, { method: "POST" });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ views: 0 }, { status: 200 });
  }
}

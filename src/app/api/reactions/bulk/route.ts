import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.API_URL ?? "https://api.koala.ai.kr";

export async function GET(req: NextRequest) {
  const slugs = req.nextUrl.searchParams.get("slugs") ?? "";

  const res = await fetch(
    `${BACKEND}/posts/reactions/bulk?slugs=${encodeURIComponent(slugs)}`,
    { cache: "no-store" }
  );
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

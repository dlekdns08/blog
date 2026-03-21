import { NextRequest, NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function GET(req: NextRequest) {
  const slugs = req.nextUrl.searchParams.get("slugs") ?? "";
  try {
    const res = await fetch(`${API}/posts/views/bulk?slugs=${encodeURIComponent(slugs)}`, {
      next: { revalidate: 60 },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({}, { status: 200 });
  }
}

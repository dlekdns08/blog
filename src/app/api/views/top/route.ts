import { NextRequest, NextResponse } from "next/server";

const API = process.env.API_URL ?? "https://api.koala.ai.kr";

export async function GET(req: NextRequest) {
  const limit = req.nextUrl.searchParams.get("limit") ?? "5";
  try {
    const res = await fetch(`${API}/posts/views/top?limit=${limit}`, {
      next: { revalidate: 300 },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.API_URL ?? "https://api.koala.ai.kr";

export async function GET(req: NextRequest) {
  const limit = req.nextUrl.searchParams.get("limit") ?? "10";
  try {
    const res = await fetch(
      `${BACKEND}/game/koala/rankings?limit=${encodeURIComponent(limit)}`,
      { cache: "no-store" }
    );
    if (!res.ok) return NextResponse.json([], { status: 200 });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${BACKEND}/game/koala/rankings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({ ok: false }));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
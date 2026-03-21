import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.API_URL ?? "https://api.koala.ai.kr";

type Params = { slug: string[] };

export async function GET(req: NextRequest, { params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const slugPath = slug.join("/");
  const clientId = req.nextUrl.searchParams.get("client_id") ?? "";

  const res = await fetch(
    `${BACKEND}/posts/${slugPath}/reactions?client_id=${encodeURIComponent(clientId)}`,
    { cache: "no-store" }
  );
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest, { params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const slugPath = slug.join("/");
  const body = await req.json();

  const res = await fetch(`${BACKEND}/posts/${slugPath}/reactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

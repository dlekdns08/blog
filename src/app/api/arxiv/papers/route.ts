import { NextRequest, NextResponse } from "next/server";
import { getTopPapers } from "@/lib/arxivDb";

export const runtime = "nodejs";

export function GET(req: NextRequest) {
  const limit = Math.min(
    Number(req.nextUrl.searchParams.get("limit") ?? "50"),
    200
  );
  const papers = getTopPapers(limit);
  return NextResponse.json(papers);
}

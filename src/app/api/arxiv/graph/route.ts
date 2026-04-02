import { NextRequest, NextResponse } from "next/server";
import { getGraphData } from "@/lib/arxivDb";

export const runtime = "nodejs";

export function GET(req: NextRequest) {
  const limit = Math.min(
    Number(req.nextUrl.searchParams.get("limit") ?? "40"),
    100
  );
  return NextResponse.json(getGraphData(limit));
}

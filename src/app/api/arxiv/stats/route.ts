import { NextResponse } from "next/server";
import { getStats } from "@/lib/arxivDb";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json(getStats());
}

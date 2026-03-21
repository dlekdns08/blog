import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { CATEGORY_CONFIG } from "@/lib/categories";

export const runtime = "nodejs";

let _cachedFonts: { regular: ArrayBuffer | null; bold: ArrayBuffer | null } | null = null;

async function loadLocalFonts() {
  if (_cachedFonts) return _cachedFonts;
  try {
    const dir = path.join(process.cwd(), "public", "fonts");
    const [regular, bold] = await Promise.all([
      readFile(path.join(dir, "NotoSansKR-Regular.otf")).catch(() => null),
      readFile(path.join(dir, "NotoSansKR-Bold.otf")).catch(() => null),
    ]);
    _cachedFonts = {
      regular: regular ? regular.buffer as ArrayBuffer : null,
      bold: bold ? bold.buffer as ArrayBuffer : null,
    };
  } catch {
    _cachedFonts = { regular: null, bold: null };
  }
  return _cachedFonts;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get("title") ?? "코알라 오딧세이";
  const category = searchParams.get("category") ?? "";
  const date = searchParams.get("date") ?? "";

  const catConfig = CATEGORY_CONFIG[category];
  const catLabel = catConfig?.label ?? (category || null);
  const catIcon = catConfig?.icon ?? null;

  const { regular, bold } = await loadLocalFonts();

  type FontOption = {
    name: string;
    data: ArrayBuffer;
    weight?: 400 | 700;
    style?: "normal" | "italic";
  };
  const fonts: FontOption[] = [];
  if (regular) fonts.push({ name: "Noto", data: regular, weight: 400, style: "normal" });
  if (bold) fonts.push({ name: "Noto", data: bold, weight: 700, style: "normal" });

  const fontFamily = fonts.length > 0 ? "Noto" : "sans-serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          fontFamily,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 배경 장식 — 우상단 violet glow */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(109,40,217,0.30) 0%, transparent 70%)",
          }}
        />
        {/* 배경 장식 — 좌하단 subtle glow */}
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 320,
            height: 320,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(109,40,217,0.12) 0%, transparent 70%)",
          }}
        />

        {/* 상단 영역: 카테고리 필 */}
        <div style={{ display: "flex", alignItems: "center" }}>
          {catLabel ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(109,40,217,0.18)",
                border: "1px solid rgba(167,139,250,0.30)",
                borderRadius: 999,
                padding: "8px 18px",
                color: "#c4b5fd",
                fontSize: 22,
                fontWeight: 400,
                letterSpacing: "0.06em",
              }}
            >
              {catIcon && <span>{catIcon}</span>}
              <span>{catLabel}</span>
            </div>
          ) : (
            <div style={{ height: 40 }} />
          )}
        </div>

        {/* 중간 영역: 제목 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            padding: "32px 0",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#f0f0f0",
              fontSize: title.length > 30 ? 52 : 62,
              fontWeight: 700,
              lineHeight: 1.25,
              letterSpacing: "-0.02em",
              maxWidth: 980,
              // 긴 제목은 2줄로 자름
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {title}
          </p>
        </div>

        {/* 하단 영역: 날짜 + 블로그명 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <span
            style={{
              color: "rgba(255,255,255,0.35)",
              fontSize: 20,
              fontWeight: 400,
              letterSpacing: "0.02em",
            }}
          >
            {date}
          </span>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 28 }}>🐨</span>
            <span
              style={{
                color: "rgba(255,255,255,0.50)",
                fontSize: 20,
                fontWeight: 400,
              }}
            >
              이다운의 코알라 오딧세이
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts,
    }
  );
}

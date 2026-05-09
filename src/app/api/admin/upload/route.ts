import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { upsertGitHubBinary } from "@/lib/github";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const MAX_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "FormData가 아닙니다." }, { status: 400 });
  }

  const file = form.get("file");
  const slug = form.get("slug");

  if (!(file instanceof File) || typeof slug !== "string" || !slug) {
    return NextResponse.json(
      { error: "file과 slug가 필요합니다." },
      { status: 400 }
    );
  }
  if (!/^[a-zA-Z0-9/_-]+$/.test(slug)) {
    return NextResponse.json(
      { error: "slug는 영문/숫자/-/_/-만 허용." },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length === 0) {
    return NextResponse.json({ error: "빈 파일." }, { status: 400 });
  }
  if (buffer.length > MAX_BYTES) {
    return NextResponse.json(
      { error: `파일 크기는 ${MAX_BYTES / 1024 / 1024}MB 이하여야 합니다.` },
      { status: 400 }
    );
  }

  // 안전한 파일명: 영문/숫자/-/_ + 확장자 1개
  const ext = path.extname(file.name);
  const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
  const safeName = `${baseName || "file"}${ext.toLowerCase().replace(/[^.a-z0-9]/g, "")}`;

  const relPath = `attachments/${slug}/${safeName}`;
  const localPath = path.join(PUBLIC_DIR, relPath);
  const repoPath = `public/${relPath}`;

  // 1. 로컬 저장
  await fs.mkdir(path.dirname(localPath), { recursive: true });
  await fs.writeFile(localPath, buffer);

  // 2. GitHub 커밋
  try {
    await upsertGitHubBinary(repoPath, buffer, `chore: upload ${safeName} for ${slug}`);
  } catch (err) {
    await fs.unlink(localPath).catch(() => {});
    const message = err instanceof Error ? err.message : "GitHub 업로드 실패";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    name: file.name,
    file: relPath,
    size: buffer.length,
  });
}

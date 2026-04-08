#!/usr/bin/env node
/**
 * Git 커밋 로그를 파싱하여 content/changelog.json을 생성합니다.
 *
 * 사용법:
 *   node scripts/generate-changelog.mjs            # 전체 로그
 *   node scripts/generate-changelog.mjs --since=30  # 최근 30일
 */

import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ── 설정 ───────────────────────────────────────────────────
const TYPE_LABELS = {
  feat: "새 기능",
  fix: "버그 수정",
  style: "스타일",
  refactor: "리팩토링",
  docs: "문서",
  perf: "성능 개선",
  test: "테스트",
  chore: "기타",
  ci: "CI/CD",
  build: "빌드",
};

// ── CLI 인자 파싱 ──────────────────────────────────────────
const sinceArg = process.argv.find((a) => a.startsWith("--since="));
const sinceDays = sinceArg ? parseInt(sinceArg.split("=")[1], 10) : null;

const sinceFlag = sinceDays ? `--since="${sinceDays} days ago"` : "";

// ── Git 로그 가져오기 ──────────────────────────────────────
const SEP = "---COMMIT---";
const FORMAT = `${SEP}%n%H%n%ad%n%s`;

const raw = execSync(
  `git log --date=short --format="${FORMAT}" ${sinceFlag}`.trim(),
  { cwd: ROOT, encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 },
);

// ── 파싱 ───────────────────────────────────────────────────
const commits = raw
  .split(SEP)
  .filter((chunk) => chunk.trim())
  .map((chunk) => {
    const lines = chunk.trim().split("\n");
    const [hash, date, ...msgParts] = lines;
    const message = msgParts.join("\n");

    // conventional commit 파싱: type(scope): description
    const match = message.match(/^(\w+)(?:\(([^)]*)\))?:\s*(.+)/);
    if (match) {
      return {
        hash: hash.slice(0, 7),
        date,
        type: match[1],
        scope: match[2] || null,
        description: match[3],
      };
    }
    return {
      hash: hash.slice(0, 7),
      date,
      type: "chore",
      scope: null,
      description: message,
    };
  });

// ── 날짜별 그룹핑 ──────────────────────────────────────────
const grouped = {};
for (const commit of commits) {
  if (!grouped[commit.date]) {
    grouped[commit.date] = [];
  }
  grouped[commit.date].push({
    hash: commit.hash,
    type: commit.type,
    typeLabel: TYPE_LABELS[commit.type] || commit.type,
    scope: commit.scope,
    description: commit.description,
  });
}

// 날짜 내림차순 정렬
const changelog = Object.entries(grouped)
  .sort(([a], [b]) => b.localeCompare(a))
  .map(([date, entries]) => ({ date, entries }));

// ── 출력 ───────────────────────────────────────────────────
const outPath = resolve(ROOT, "content", "changelog.json");
writeFileSync(outPath, JSON.stringify(changelog, null, 2), "utf-8");

console.log(
  `changelog.json generated: ${changelog.length} days, ${commits.length} commits`,
);

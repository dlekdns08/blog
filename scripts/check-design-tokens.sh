#!/usr/bin/env bash
# 디자인 토큰을 우회하는 raw dark/light 페어를 차단한다.
# - 신규 코드/PR이 토큰 시스템(text-subtle, bg-surface 등)을 거치지 않고
#   직접 zinc-XXX dark:zinc-XXX 같은 페어를 도입하는 것을 막음.
# - 검출 시 비-제로 종료 → CI/pre-commit에서 실패하도록.
# - bash 3.2 호환 (macOS 기본).

set -e

cd "$(dirname "$0")/.."

# 패턴|권장토큰 — 한 줄에 |로 구분
MAPPINGS="\
text-zinc-400 dark:text-zinc-500|text-subtle
text-zinc-500 dark:text-zinc-400|text-muted
text-zinc-700 dark:text-zinc-300|text-body
text-zinc-800 dark:text-zinc-200|text-body
text-zinc-900 dark:text-zinc-100|text-foreground
border-black/8 dark:border-white/10|border-line
border-black/8 dark:border-white/8|border-line
border-black/10 dark:border-white/10|border-line
border-zinc-200 dark:border-zinc-800|border-divider
border-zinc-200 dark:border-zinc-700|border-divider
bg-white dark:bg-white/5|bg-surface
bg-white dark:bg-zinc-900|bg-panel
text-violet-600 dark:text-violet-400|text-accent"

found=0
while IFS='|' read -r pat suggest; do
  [ -z "$pat" ] && continue
  hits=$(grep -rEn -F "$pat" --include="*.tsx" src/ 2>/dev/null || true)
  if [ -n "$hits" ]; then
    found=1
    echo ""
    echo "✗  '$pat' 발견 → '$suggest' 사용 권장"
    echo "$hits" | sed 's/^/   /'
  fi
done <<< "$MAPPINGS"

if [ "$found" -eq 1 ]; then
  echo ""
  echo "디자인 토큰 우회 발견. globals.css의 토큰을 사용하세요."
  echo "전체 매핑은 scripts/check-design-tokens.sh 상단 MAPPINGS 참고."
  exit 1
fi

echo "✓  디자인 토큰 우회 없음."

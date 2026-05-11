#!/usr/bin/env bash
set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DST="${CODEX_HOME:-$HOME/.codex}/skills"

echo ""
echo "=== IELTS Skills V3 for Codex installer ==="
echo ""
echo "Source: $SRC"
echo "Target: $DST"
echo ""

mkdir -p "$DST"

skills=(ielts ielts-diagnose ielts-writing ielts-reading ielts-listening ielts-speaking ielts-vocab)

for skill in "${skills[@]}"; do
  mkdir -p "$DST/$skill"
  cp "$SRC/$skill/SKILL.md" "$DST/$skill/SKILL.md"
  echo "[OK] $skill"
done

mkdir -p "$DST/ielts-dashboard"
cp "$SRC/ielts-dashboard/SKILL.md" "$DST/ielts-dashboard/SKILL.md"
mkdir -p "$DST/ielts-dashboard/dashboard"

if command -v rsync >/dev/null 2>&1; then
  rsync -a \
    --exclude='node_modules/' \
    --exclude='dist/' \
    --exclude='.git/' \
    "$SRC/ielts-dashboard/dashboard/" \
    "$DST/ielts-dashboard/dashboard/"
else
  (
    cd "$SRC/ielts-dashboard/dashboard"
    find . \
      -path './node_modules' -prune -o \
      -path './dist' -prune -o \
      -path './.git' -prune -o \
      -type d -exec mkdir -p "$DST/ielts-dashboard/dashboard/{}" \; -o \
      -type f -exec cp "{}" "$DST/ielts-dashboard/dashboard/{}" \;
  )
fi
echo "[OK] ielts-dashboard"

cp "$SRC/SCHEMA.md" "$DST/SCHEMA.md"
echo "[OK] SCHEMA.md"

echo ""
echo "=== Install complete ==="
echo ""
echo "Restart Codex, then say: 我要备考雅思"
echo ""
echo "Dashboard:"
echo "  cd ~/.codex/skills/ielts-dashboard/dashboard"
echo "  npm install"
echo "  npm start"

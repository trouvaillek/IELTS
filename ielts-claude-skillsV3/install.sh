#!/usr/bin/env bash
# IELTS Skills V3.1 — Mac/Linux 安装脚本
# 用法：bash install.sh   （或 chmod +x install.sh && ./install.sh）
#
# 它做的事：
#   1. 把 7 个 skill 的 SKILL.md 复制到 ~/.claude/skills/
#   2. 把 ielts-dashboard 的 SKILL.md + dashboard 项目（不含 node_modules）复制过去
#   3. 复制 SCHEMA.md
#   4. 提示下一步

set -e

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DST="$HOME/.claude/skills"

echo ""
echo "=== 雅思 Skills V3.1 安装 ==="
echo ""
echo "源目录：$SRC"
echo "目标：  $DST"
echo ""

mkdir -p "$DST"

SKILLS=(ielts ielts-diagnose ielts-writing ielts-reading ielts-listening ielts-speaking ielts-vocab)

for s in "${SKILLS[@]}"; do
    mkdir -p "$DST/$s"
    if cp "$SRC/$s/SKILL.md" "$DST/$s/SKILL.md" 2>/dev/null; then
        echo "[完成] $s"
    else
        echo "[失败] $s"
    fi
done

# ielts-dashboard：复制 SKILL.md + 整个 dashboard 项目（排除 node_modules / dist 节省空间）
mkdir -p "$DST/ielts-dashboard"
cp "$SRC/ielts-dashboard/SKILL.md" "$DST/ielts-dashboard/SKILL.md"
mkdir -p "$DST/ielts-dashboard/dashboard"

if command -v rsync >/dev/null 2>&1; then
    # 优先用 rsync，可以排除 node_modules 同时保留用户已装的依赖
    rsync -a \
        --exclude='node_modules/' \
        --exclude='dist/' \
        --exclude='.git/' \
        "$SRC/ielts-dashboard/dashboard/" \
        "$DST/ielts-dashboard/dashboard/"
else
    # 没有 rsync 时退回 cp，源端不应包含 node_modules（构建包前请确认）
    cp -r "$SRC/ielts-dashboard/dashboard/." "$DST/ielts-dashboard/dashboard/"
fi
echo "[完成] ielts-dashboard（含 dashboard 项目，未覆盖你已装的 node_modules）"

# Schema
cp "$SRC/SCHEMA.md" "$DST/SCHEMA.md"
echo "[完成] SCHEMA.md"

echo ""
echo "=== 安装完成 ==="
echo ""
echo "接下来："
echo "  1. 确认 Node.js 18+ 已装：node --version"
echo "     （没有的话从 https://nodejs.org 下 LTS）"
echo ""
echo "  2. 第一次启动 Dashboard："
echo "       cd ~/.claude/skills/ielts-dashboard/dashboard"
echo "       npm install"
echo "       npm start"
echo "     浏览器会自动打开 http://localhost:5173"
echo ""
echo "  3. 在 Claude Code 里输入："
echo "       /ielts                  教练入口"
echo "       /ielts-dashboard        启动可视化仪表板（自动 npm install）"
echo ""
echo "  4. 状态栏（可选）：在 ~/.claude/settings.json 里加："
echo '     {'
echo '       "statusLine": {'
echo '         "type": "command",'
echo '         "command": "node ~/.claude/skills/ielts-dashboard/dashboard/scripts/statusline.js"'
echo '       }'
echo '     }'
echo ""

#!/bin/bash
# 一键推送 OpenLuck 到 GitHub
set -e

# Clash 代理（如需要可取消注释）
# git config http.proxy http://127.0.0.1:7890

cd "$(dirname "$0")"

# 提交信息：使用参数或默认时间戳
MSG="${1:-update $(date '+%Y-%m-%d %H:%M')}"

git add -A
git status

echo ""
read -p "确认推送？提交信息: \"$MSG\" [y/N] " confirm
[[ "$confirm" == [yY] ]] || { echo "已取消"; exit 0; }

git commit -m "$MSG" 2>/dev/null || echo "（无新变更，跳过 commit）"
git push origin main

echo "✓ 推送完成"

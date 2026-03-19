#!/bin/bash
echo "📦 检查大文件..."

large_files=$(find . -type f -size +1M -not -path "./.git/*" -not -path "./node_modules/*" 2>/dev/null | head -5)

if [ -n "$large_files" ]; then
  echo ""
  echo "❌ 发现大文件 (>1MB)，不允许提交:"
  echo "$large_files"
  echo ""
  echo "建议:"
  echo "  - 不要将二进制文件提交到Git"
  echo "  - 使用 Git LFS 管理大文件"
  exit 1
fi

echo "✅ 大文件检查通过"

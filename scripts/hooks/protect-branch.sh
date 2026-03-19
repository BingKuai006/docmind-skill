#!/bin/bash
# 分支保护脚本

branch=$(git symbolic-ref --short HEAD 2>/dev/null)

if [ "$branch" = "main" ] || [ "$branch" = "master" ]; then
  echo ""
  echo "❌ 禁止直接推送到 $branch 分支！"
  echo ""
  echo "请按照以下流程操作:"
  echo "  1. 创建功能分支: git checkout -b feature/your-feature"
  echo "  2. 提交代码: git commit -m 'feat: 描述'"
  echo "  3. 推送到远程: git push origin feature/your-feature"
  echo "  4. 在GitHub上创建 Pull Request"
  echo ""
  exit 1
fi

echo "✅ 分支检查通过: $branch"

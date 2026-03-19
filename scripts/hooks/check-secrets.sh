#!/bin/bash
# 敏感信息检测脚本

echo "🔍 检查敏感信息..."

# 检查是否包含敏感关键词
if git diff --cached --name-only | xargs grep -l -E "(password|passwd|pwd|secret|token|key|apikey|api_key)['\"\s]*[=:]+['\"\s]*[^'\"\s]+" 2>/dev/null | grep -v "node_modules" | grep -v ".git" | grep -v "example" | grep -v "scripts" | head -5; then
  echo ""
  echo "⚠️  警告: 发现可能的敏感信息！"
  echo "请检查提交内容，确保没有提交密码、API Key等敏感信息。"
  echo ""
  echo "如果确认安全，可以使用: git commit --no-verify 跳过检查"
  exit 1
fi

echo "✅ 敏感信息检查通过"

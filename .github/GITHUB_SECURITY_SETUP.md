# GitHub 安全配置指南

> 本指南帮助你配置 `docmind-skill` 项目的 GitHub 安全设置

## 一、分支保护设置（最重要！）

### 步骤 1：进入设置页面
1. 打开浏览器访问：https://github.com/BingKuai006/docmind-skill
2. 点击顶部菜单 **Settings**
3. 左侧导航选择 **Branches**

### 步骤 2：添加分支保护规则
点击 **Add rule** 按钮，创建以下规则：

**规则名称**: `main`

#### 必须启用的选项：

☑️ **Require a pull request before merging**（合并前需要Pull Request）
- ☑️ Require approvals: `1`（至少1人批准）
- ☑️ Dismiss stale PR approvals when new commits are pushed（推送新代码后取消旧批准）
- ☑️ Require review from CODEOWNERS（需要从CODEOWNERS文件指定的人审查）

☑️ **Require status checks to pass before merging**（状态检查通过才能合并）
- ☑️ Require branches to be up to date before merging（要求分支最新）
- 搜索并添加: `security-scan`、`lint`、`test`

☑️ **Require conversation resolution before merging**（解决所有对话才能合并）

☑️ **Include administrators**（管理员也遵守这些规则）

☑️ **Restrict pushes that create files larger than 100 MB**（限制大文件推送）

☑️ **Block force pushes**（禁止强制推送）
- 这是最关键的！防止 `git push -f` 覆盖历史

☑️ **Block deletions**（禁止删除分支）

---

## 二、环境变量保护（Secrets）

### 添加敏感信息到 GitHub Secrets

1. Settings → Secrets and variables → Actions
2. 点击 **New repository secret**

需要添加的 Secrets：

| Secret 名称 | 说明 | 值示例 |
|------------|------|--------|
| `AI_API_KEY` | AI API 密钥 | `sk-xxx...` |
| `AI_BASE_URL` | AI 服务地址 | `https://coding.dashscope.aliyuncs.com/apps/anthropic/v1` |
| `AI_MODEL` | AI 模型 | `qwen3.5-plus` |

**重要**: 这些值只在这里存储，永远不会暴露在代码中！

---

## 三、代码安全扫描（已配置）

本仓库已配置 `.github/workflows/security.yml`，会自动：

✅ 扫描敏感信息泄露（密码、API Key等）  
✅ 检查依赖漏洞（npm audit）  
✅ 验证代码规范（ESLint）  

每次提交 PR 时自动运行。

---

## 四、预提交钩子（已配置）

项目已配置 `lefthook`，在提交前自动：

✅ 检查是否有敏感信息（密码、token等）  
✅ 运行代码格式化（Prettier）  
✅ 运行代码检查（ESLint）  

安装方法：
```bash
npm install
npx lefthook install
```

---

## 五、推荐的开发流程

```bash
# 1. 获取最新代码
git checkout main
git pull origin main

# 2. 创建功能分支
git checkout -b feature/your-feature-name

# 3. 开发并提交（会自动运行钩子检查）
git add .
git commit -m "feat: 添加新功能"

# 4. 推送到远程
git push -u origin feature/your-feature-name

# 5. 在 GitHub 上创建 Pull Request
#    - 填写标题和描述
#    - 等待 CI 检查通过
#    - 请求代码审查

# 6. 审查通过后合并到 main
```

---

## 六、安全最佳实践

### ❌ 绝对不要做：
- `git push -f` 强制推送到 main
- 直接提交到 main 分支
- 在代码中硬编码密码、API Key
- 提交 `.env` 文件

### ✅ 一定要做：
- 所有变更通过 Pull Request
- 至少 1 人审查后再合并
- 定期更新依赖：`npm audit fix`
- 使用 `git diff` 检查提交内容

---

## 七、紧急处理

### 如果不小心提交了敏感信息：

1. **立即撤销提交**（如果还没 push）：
   ```bash
   git reset HEAD~1
   ```

2. **如果已经 push**，立即：
   - 撤销 GitHub 上的 API Key/密码
   - 联系管理员清理 Git 历史
   - 参考：https://docs.github.com/cn/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository

---

## 配置完成检查清单

- [ ] main 分支设置了保护规则
- [ ] 需要 PR 才能合并
- [ ] 需要 1 人审查批准
- [ ] 禁止强制推送
- [ ] 添加了 AI_API_KEY 到 Secrets
- [ ] 安装了 lefthook 预提交钩子

配置完成后，你的代码将受到全面保护！

# 贡献指南

> 感谢你为 docmind-skill 项目做出贡献！

## 开发流程

我们使用 **Git Flow** 工作流进行协作开发。

### 分支说明

- `main`: 生产环境代码，**受保护**
- `develop`: 开发分支，功能集成
- `feature/*`: 功能分支，从 develop 切出
- `hotfix/*`: 紧急修复，从 main 切出

### 提交代码步骤

#### 1. 准备工作

```bash
# 克隆仓库
git clone https://github.com/BingKuai006/docmind-skill.git
cd docmind-skill

# 安装依赖和钩子
npm install
npx lefthook install
```

#### 2. 创建功能分支

```bash
# 确保你在 main 分支

git checkout main
git pull origin main

# 创建并切换到功能分支
git checkout -b feature/your-feature-name

# 命名规范：
# feature/description - 新功能
# fix/description - 修复bug
# docs/description - 文档更新
# refactor/description - 重构
```

#### 3. 开发规范

**提交信息格式**（使用 Conventional Commits）：

```
<type>: <description>

[可选的详细描述]

[可选的脚注]
```

**类型说明**：
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式（不影响功能的修改）
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

**示例**：
```bash
git commit -m "feat: 添加文件分析缓存功能"
git commit -m "fix: 修复中文编码问题"
git commit -m "docs: 更新使用说明"
```

#### 4. 提交前检查

每次提交前会自动运行：
- ✅ 敏感信息扫描（防止提交密码、API Key）
- ✅ 代码格式化（Prettier）
- ✅ 代码检查（ESLint）

**手动检查**：
```bash
# 查看修改的文件
git status

# 查看具体修改内容（确保没有敏感信息）
git diff

# 添加文件
git add .

# 提交（会自动运行钩子）
git commit -m "feat: 你的描述"
```

#### 5. 推送到远程

```bash
# 推送分支到远程仓库
git push -u origin feature/your-feature-name
```

#### 6. 创建 Pull Request

1. 访问 https://github.com/BingKuai006/docmind-skill
2. 点击 "Compare & pull request"
3. 填写 PR 描述：
   ```markdown
   ## 描述
   [简要说明这个PR做了什么]

   ## 类型
   - [ ] 新功能
   - [ ] Bug修复
   - [ ] 文档更新
   - [ ] 重构

   ## 检查清单
   - [ ] 代码通过本地测试
   - [ ] 提交信息符合规范
   - [ ] 没有提交敏感信息
   - [ ] 文档已更新（如需要）
   ```
4. 请求审查（Request Review）

#### 7. 代码审查

- 至少需要 1 人批准才能合并
- 审查者可能会提出修改意见
- 修改后推送新提交，PR 会自动更新

#### 8. 合并到主分支

- 审查通过后，由维护者合并
- 合并后删除功能分支

---

## 代码规范

### TypeScript/JavaScript

- 使用 ESLint 和 Prettier 格式化
- 类型必须明确，避免 `any`
- 函数长度不超过 50 行
- 文件长度不超过 300 行

### 文件组织

```
src/
├── ai/          # AI 相关
├── analyzer/    # 分析器
├── generator/   # 生成器
├── scanner/     # 扫描器
├── commenter/   # 注释器
└── utils/       # 工具函数
```

### 注释规范

```typescript
/**
 * 函数描述
 * @param param1 参数1说明
 * @param param2 参数2说明
 * @returns 返回值说明
 */
function example(param1: string, param2: number): boolean {
  // 实现代码
}
```

---

## 安全规范

### ❌ 禁止行为

- 在代码中硬编码密码、API Key
- 提交 `.env` 文件
- 直接推送到 `main` 分支
- 使用 `git push -f` 强制推送

### ✅ 安全实践

- 敏感信息通过环境变量或 GitHub Secrets 管理
- 定期更新依赖：`npm audit fix`
- 审查 PR 时检查是否有敏感信息泄露

---

## 报告问题

如果你发现了 bug 或有功能建议：

1. 先搜索是否已有相关 Issue
2. 如果没有，创建新 Issue
3. 提供详细的信息：
   - 问题描述
   - 复现步骤
   - 期望行为
   - 实际行为
   - 环境信息（Node版本、操作系统等）

---

## 许可证

通过提交代码，你同意你的贡献将在项目许可证下发布。

---

## 需要帮助？

- 查看 [README.md](README.md)
- 阅读 [GitHub安全配置指南](.github/GITHUB_SECURITY_SETUP.md)
- 提交 Issue 获取帮助

感谢你的贡献！

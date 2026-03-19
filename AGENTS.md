# DocMind Skill - AI 智能文档生成器

> **版本**: 2.0  
> **架构**: 混合 AI (规则 + 云端 AI)  
> **目标**: 自动分析项目结构，为代码生成面向小白的说明文档

---

## 项目定位

DocMind 是一个智能文档生成工具，结合**规则匹配**和**AI 大模型分析**，为项目自动生成易于理解的文档。

### 核心能力

- **智能分析**: 使用阿里云通义千问 (qwen3.5-plus) AI 模型理解代码语义
- **混合架构**: AI 分析失败时自动降级到规则匹配，保证可用性
- **安全设计**: API Key 通过 .env 文件管理，不提交到版本控制
- **多级缓存**: 避免重复分析，提升性能

---

## 技术架构

### 架构图

```
┌─────────────────────────────────────────────────────────┐
│  DocMind Skill                                          │
│                                                          │
│  ┌──────────────┐     ┌──────────────────────────────┐ │
│  │ 项目扫描器   │────▶│ 分析引擎 (AnalysisService)   │ │
│  └──────────────┘     └──────────────┬───────────────┘ │
│                                       │                 │
│                    ┌──────────────────┼────────────────┐│
│                    ▼                  ▼                ││
│           ┌─────────────┐    ┌──────────────┐         ││
│           │ AI Provider │    │ RuleProvider │         ││
│           │ (Anthropic) │    │ (规则匹配)   │         ││
│           └──────┬──────┘    └──────┬───────┘         ││
│                  │                  │                  ││
│           ┌──────┴──────┐    ┌──────┴──────┐          ││
│           │ DashScope   │    │ 文件名规则  │          ││
│           │ qwen3.5-plus│    │ 内容分析    │          ││
│           └─────────────┘    └─────────────┘          ││
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │ 文档生成器      │
                   │ 项目总览.md     │
                   │ 说明.md         │
                   │ 文件关系图.md   │
                   └─────────────────┘
```

### 核心模块

| 模块 | 文件 | 职责 |
|------|------|------|
| **项目扫描器** | `scanner/project-scanner.ts` | 递归遍历目录，识别文件类型 |
| **AI 分析器** | `ai/providers/dashscope-provider.ts` | 调用通义千问 AI 分析代码 |
| **规则分析器** | `ai/providers/rule-provider.ts` | 基于文件名和内容规则分析 |
| **分析调度器** | `analyzer/analysis-service.ts` | 调度 AI/规则分析，管理降级 |
| **文档生成器** | `generator/doc-generator.ts` | 生成 Markdown 文档 |
| **代码注释器** | `commenter/code-commenter.ts` | 为代码添加头部注释 |
| **配置加载器** | `utils/config-loader.ts` | 加载 .env 和 skill.yaml |
| **缓存管理器** | `ai/cache/cache-manager.ts` | 缓存分析结果 |

---

## 配置管理

### 环境变量配置 (.env)

```bash
# AI 配置（必填）
AI_API_KEY=sk-your-api-key
AI_BASE_URL=https://coding.dashscope.aliyuncs.com/apps/anthropic/v1
AI_MODEL=qwen3.5-plus

# 可选配置
AI_TIMEOUT_MS=15000
AI_FALLBACK_RETRY_COUNT=1
```

**安全提示**: .env 文件已加入 .gitignore，不会提交到版本控制。

### Skill 配置 (skill.yaml)

```yaml
config:
  ai:
    enabled: true
    mode: hybrid  # hybrid | ai-only | rule-only
    
    cloud:
      provider: dashscope
      # api_key 从环境变量 AI_API_KEY 读取
      model: qwen3.5-plus
      
    cache:
      enabled: true
      ttl_hours: 24
      
    fallback:
      on_error: rule  # AI 失败时降级到规则
```

---

## 工作流程

```
1. 加载配置
   ├─ 读取 .env 环境变量
   ├─ 读取 skill.yaml 配置
   └─ 合并为最终配置

2. 扫描项目
   ├─ 递归遍历目录
   ├─ 识别文件类型 (代码/配置/文档)
   └─ 过滤排除文件 (.gitignore)

3. 分析文件
   ├─ 检查缓存 → 命中则返回
   ├─ 尝试 AI 分析 (hybrid/ai-only 模式)
   │   ├─ 调用 DashScope (qwen3.5-plus)
   │   ├─ 解析 JSON 响应
   │   └─ 成功则缓存结果
   └─ AI 失败则降级到规则分析
       ├─ 基于文件名推断
       └─ 基于内容特征匹配

4. 生成文档
   ├─ 项目总览.md (整体架构)
   ├─ 文件关系图.md (Mermaid 图表)
   └─ 各文件夹/说明.md

5. 添加注释
   └─ 为代码文件添加头部注释
```

---

## 设计原则

### 1. 小白友好
- 避免专业术语 (如 "依赖注入"、"中间件")
- 使用通俗语言 (如 "保存用户输入的信息")
- 提供具体使用场景

### 2. 智能优先
- 优先使用 AI 分析，理解代码语义
- AI 失败时无缝降级到规则匹配
- 缓存机制避免重复分析

### 3. 安全第一
- 敏感信息 (API Key) 不入版本控制
- 不修改原有代码逻辑
- 只添加注释和说明文档

### 4. 可扩展
- Provider 接口支持多种 AI 服务
- 策略模式支持不同分析方式
- 配置驱动，无需改代码

---

## 输出规范

### 1. 项目总览.md

```markdown
# 项目总览

## 项目简介
[一句话说明：这个项目用了什么技术？实现什么功能]

## 核心功能
- [功能1]
- [功能2]
- [功能3]

## 技术栈
- 编程语言：[如：TypeScript、Python、Java等]
- 核心依赖：[列出3-5个关键依赖包]

## 目录结构
- **[目录名]** - [目录用途说明]
- **[目录名]** - [目录用途说明]
- **[目录名]** - [目录用途说明]
- **[目录名]** - [目录用途说明]

## 配置文件

### 主要配置文件
| 文件 | 路径 | 作用 |
|-----|------|------|
| [文件名] | [路径] | [配置什么] |
| [文件名] | [路径] | [配置什么] |
| [文件名] | [路径] | [配置什么] |

### 环境配置
[说明项目使用的环境变量或环境配置文件]

## 入口文件
- **主入口**：[如：main.ts、app.js等] - [入口文件的作用]

```

### 2. 文件夹说明.md

```markdown
# [文件夹名称]

## 目录定位
### 核心职责
[AI生成：这个文件夹在整个项目中扮演什么角色？负责什么功能？]

### 所属模块
[这个文件夹属于哪个业务模块？]

## 文件清单

## 包含文件
- **file1.ts** - [文件的主要功能]
- **file2.ts** - [文件的主要功能]
- **file3.ts** - [文件的主要功能]

### ⚙️ 配置文件 ([X]个)
| 文件名 | 配置作用 | 关键配置项 |
|-------|---------|-----------|
| [文件名] | [配置什么] | [主要配置参数] |

### 📦 资源文件 ([X]个)
[存放的静态资源类型及用途]

## 依赖关系
### 外部依赖
[这个文件夹依赖项目中的哪些其他模块？]

### 被依赖
[项目中有哪些模块依赖这个文件夹？]

## 特别说明
[重要说明，如果没有就写"无"]
```

### 3. 代码文件头部注释

```typescript
/**
 * [文件名]
 * 
 * [AI 生成的用途描述]
 * 
 * 主要功能：
 * - [功能1]
 * - [功能2]
 * 
 * 什么时候会用到：
 * - [场景1]
 */
```

---

## 开发指南

### 添加新的 AI Provider

1. 实现 `AIProvider` 接口：
```typescript
export class NewProvider implements AIProvider {
  readonly name = 'new-provider';
  
  async analyzeFile(filePath: string, content: string): Promise<AIAnalysisResult> {
    // 调用 AI API
  }
  
  async isAvailable(): Promise<boolean> {
    // 检查服务可用性
  }
}
```

2. 在 `AnalysisService` 中注册：
```typescript
if (config.ai.cloud?.provider === 'new-provider') {
  this.aiProviders.push(new NewProvider(...));
}
```

### 调试技巧

```bash
# 查看环境变量加载
node -e "require('dotenv').config(); console.log(process.env.AI_API_KEY)"

# 测试 AI 分析
node test-ai-response.js

# 查看详细日志
DEBUG=docmind node dist/main.js
```

---

## 依赖列表

```json
{
  "dependencies": {
    "@ai-sdk/anthropic": "^1.0.0",  // AI SDK
    "ai": "^4.0.0",                  // Vercel AI SDK
    "js-yaml": "^4.1.0",             // YAML 解析
    "dotenv": "^16.0.0"              // 环境变量
  }
}
```

---

## 边界与限制

- **不修改代码逻辑** - 只添加注释，不改原有代码
- **不删除任何文件** - 安全操作，无副作用
- **尊重排除规则** - 遵守 .gitignore 和 skill.yaml 的 exclude_patterns
- **API 调用成本** - AI 分析按 token 计费，注意控制成本

---

## 版本历史

- **v2.0** (当前) - 混合 AI 架构，支持 Anthropic SDK，.env 配置管理
- **v1.0** - 基础版本，仅规则匹配

---

*由 AI 辅助生成，持续迭代优化*

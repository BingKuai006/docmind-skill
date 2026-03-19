# 阶段 2：云端 AI 集成计划

> **状态**: 准备开始  
> **预计时间**: 1 天  
> **目标**: 实现 DashScopeProvider，集成阿里云通义千问 AI 分析

---

## 前置条件

- ✅ 阶段 1 已完成（基础架构）
- ✅ 编译通过
- ✅ 功能测试通过

---

## 任务清单

### 1. 安装依赖 ✅ TODO

**命令**:
```bash
cd D:\AI_CEO\docmind-skill
npm install dashscope
npm install --save-dev @types/dashscope
```

**说明**:
- DashScope SDK 用于调用阿里云通义千问 API
- @types/dashscope 是 TypeScript 类型定义

---

### 2. 实现 DashScopeProvider ✅ TODO

**文件**: `src/ai/providers/dashscope-provider.ts`

**内容**:
```typescript
import { AIProvider, AIAnalysisResult } from './ai-provider';
import { DashScope } from 'dashscope';

export class DashScopeProvider implements AIProvider {
  readonly name = 'dashscope';
  private client: DashScope;
  private model: string;
  
  constructor(apiKey: string, model: string = 'qwen-turbo') {
    this.client = new DashScope({ apiKey });
    this.model = model;
  }
  
  async analyzeFile(filePath: string, content: string): Promise<AIAnalysisResult> {
    const prompt = this.buildPrompt(filePath, content);
    
    const response = await this.client.chat({
      model: this.model,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });
    
    return this.parseResponse(response.output.text);
  }
  
  private buildPrompt(filePath: string, content: string): string {
    return `你是一个专业的代码文档生成助手。请分析以下代码文件：

文件路径：${filePath}

代码内容（前 3000 字符）：
\`\`\`
${content.substring(0, 3000)}
\`\`\`

请用通俗易懂的中文（小白能理解）回答：
1. 这个文件是干什么的？（1 句话，不超过 30 字）
2. 主要功能有哪些？（列出 3-5 个核心功能）
3. 什么时候会用到这个文件？（1-2 个使用场景）

回答格式（JSON）：
{
  "purpose": "文件用途简述",
  "functions": [
    {"name": "函数名", "description": "功能描述"}
  ],
  "description": "详细的功能说明"
}`;
  }
  
  private parseResponse(text: string): AIAnalysisResult {
    try {
      // 提取 JSON 部分
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return {
          purpose: data.purpose || '代码文件，实现特定功能',
          enhancedPurpose: data.purpose,
          functions: data.functions || [],
          dependencies: [],
          description: data.description,
          complexity: 'medium',
          confidence: 0.85,
          analysisMethod: 'cloud-ai'
        };
      }
    } catch (error) {
      console.warn('AI 响应解析失败，使用原始文本');
    }
    
    // 降级处理
    return {
      purpose: text.substring(0, 50),
      functions: [],
      dependencies: [],
      complexity: 'medium',
      confidence: 0.5,
      analysisMethod: 'cloud-ai'
    };
  }
  
  async isAvailable(): Promise<boolean> {
    try {
      await this.client.chat({
        model: this.model,
        messages: [{ role: 'user', content: 'ping' }]
      });
      return true;
    } catch {
      return false;
    }
  }
}
```

**说明**:
- 实现 AIProvider 接口
- 使用阿里云 DashScope SDK 调用通义千问
- 支持 qwen-turbo、qwen-plus、qwen-max 等模型
- 解析 AI 返回的 JSON 格式结果

---

### 3. 更新 AnalysisService ✅ TODO

**文件**: `src/analyzer/analysis-service.ts`

**修改**:
```typescript
import { DashScopeProvider } from '../ai/providers/dashscope-provider';

// 在构造函数中初始化 AI Providers
constructor(
  ruleProvider: AIProvider,
  config: DocMindConfig,
  cacheManager: CacheManager
) {
  this.ruleProvider = ruleProvider;
  this.config = config;
  this.cacheManager = cacheManager;
  
  // 初始化 AI Providers
  this.aiProviders = [];
  
  // DashScope Provider
  if (config.ai?.cloud?.enabled && config.ai.cloud.api_key) {
    this.aiProviders.push(
      new DashScopeProvider(
        config.ai.cloud.api_key,
        config.ai.cloud.model || 'qwen-turbo'
      )
    );
  }
}

// 更新 analyze 方法
async analyze(file: FileInfo, content: string): Promise<AIAnalysisResult> {
  // 1. 检查缓存
  if (this.config.ai?.cache?.enabled) {
    const cached = await this.cacheManager.get(file.path, content);
    if (cached) {
      console.log(`  💾 缓存命中: ${file.name}`);
      return cached;
    }
  }
  
  // 2. 规则匹配模式
  if (this.config.ai?.mode === 'rule-only') {
    return this.ruleProvider.analyzeFile(file.path, content);
  }
  
  // 3. 尝试 AI 分析
  for (const provider of this.aiProviders) {
    if (await provider.isAvailable()) {
      try {
        console.log(`  🤖 AI 分析: ${file.name} (${provider.name})`);
        const result = await provider.analyzeFile(file.path, content);
        
        // 缓存结果
        if (this.config.ai?.cache?.enabled) {
          await this.cacheManager.set(file.path, content, result);
        }
        
        return result;
      } catch (error) {
        console.warn(`  ⚠️ ${provider.name} 分析失败:`, error);
      }
    }
  }
  
  // 4. 降级到规则匹配
  console.log(`  📋 规则分析: ${file.name}`);
  return this.ruleProvider.analyzeFile(file.path, content);
}
```

---

### 4. 配置 API Key ✅ TODO

**方法 1：环境变量（推荐）**
```bash
# Windows PowerShell
$env:DASHSCOPE_API_KEY="your-api-key-here"

# Windows CMD
set DASHSCOPE_API_KEY=your-api-key-here
```

**方法 2：.env 文件**
**文件**: `.env`（在项目根目录）
```
DASHSCOPE_API_KEY=your-api-key-here
```

**安装 dotenv**:
```bash
npm install dotenv
```

**修改 main.ts**:
```typescript
import * as dotenv from 'dotenv';
dotenv.config();
```

**方法 3：直接配置 skill.yaml**
```yaml
config:
  ai:
    cloud:
      api_key: "your-api-key-here"  # 不推荐，会提交到 git
```

---

### 5. 启用云端 AI ✅ TODO

**修改 skill.yaml**:
```yaml
config:
  ai:
    enabled: true
    mode: hybrid  # hybrid: 优先 AI，失败降级规则
    
    cloud:
      enabled: true
      provider: dashscope
      api_key: ${DASHSCOPE_API_KEY}  # 从环境变量读取
      model: qwen-turbo
      timeout_ms: 15000
```

---

### 6. 测试 AI 效果 ✅ TODO

**测试步骤**:
1. 设置 API Key
2. 启用 AI
3. 运行测试
4. 对比效果

**命令**:
```bash
# 设置 API Key
$env:DASHSCOPE_API_KEY="sk-xxx"

# 运行测试
cd examples/JDcapture
node ../../dist/main.js
```

**预期输出**:
```
🚀 DocMind: 开始分析项目...
📁 发现 2 个文件夹
📄 发现 12 个文件
  🤖 AI 分析: check_deps.py (dashscope)
  🤖 AI 分析: jd_batch_processor.py (dashscope)
  🤖 AI 分析: background.js (dashscope)
  ...
  ✓ 生成: 项目总览.md
  ✓ 生成: 文件关系图.md
  ✓ 生成: 说明.md
✅ DocMind: 文档生成完成！
```

**对比效果**:

| 文件 | 规则匹配 | AI 分析 |
|------|----------|---------|
| check_deps.py | 依赖检查脚本，验证环境配置 | ✅ 更准确的描述 |
| jd_batch_processor.py | 批处理脚本，批量处理数据 | ✅ 更详细的说明 |
| background.js | 后台脚本，在浏览器后台运行 | ✅ 更智能的推断 |

---

## 阶段 2 完成标准

- [ ] dashscope 包安装成功
- [ ] DashScopeProvider 实现完成
- [ ] AnalysisService 更新完成
- [ ] API Key 配置成功
- [ ] AI 在 skill.yaml 中启用
- [ ] 编译通过 (`npm run build`)
- [ ] AI 分析测试通过
- [ ] 降级到规则匹配测试通过
- [ ] 缓存功能测试通过

---

## 成本估算

**DashScope 价格**:
- qwen-turbo: ¥0.002-0.008 / 千 tokens
- qwen-plus: ¥0.01-0.04 / 千 tokens
- qwen-max: ¥0.04-0.12 / 千 tokens

**JDcapture 项目** (12 个文件):
- 预计消耗: ~10000 tokens
- 预计费用: ¥0.02-0.08

---

## 常见问题

### Q: 如何获取阿里云 API Key？
A: 访问 https://dashscope.console.aliyun.com/apiKey 创建

### Q: AI 分析失败怎么办？
A: 会自动降级到规则匹配，无需担心

### Q: 如何控制成本？
A: 
1. 使用 qwen-turbo 模型（最便宜）
2. 启用缓存（避免重复分析）
3. 限制分析文件数量（exclude_patterns）
4. 使用 hybrid 模式（只有复杂文件用 AI）

### Q: 支持其他 AI 吗？
A: 阶段 2 只实现 DashScope，阶段 3 可添加 OpenAI、Claude 等

---

## 下一步

阶段 2 完成后，进入**阶段 3：缓存机制优化**
- 实现磁盘缓存（持久化）
- 内容哈希算法优化
- TTL 过期策略
- 缓存统计和清理

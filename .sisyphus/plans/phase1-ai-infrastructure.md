# 阶段 1：基础架构实现计划

> **状态**: 准备开始  
> **预计时间**: 1-2 天  
> **目标**: 创建 AI 服务层和策略接口，实现规则匹配策略

---

## 任务清单

### 1. 创建 AI Provider 接口 ✅ TODO

**文件**: `src/ai/providers/ai-provider.ts`

**内容**:
```typescript
export interface AIAnalysisResult {
  purpose: string;
  enhancedPurpose?: string;
  functions: Array<{ name: string; description?: string }>;
  dependencies: string[];
  description?: string;
  complexity: 'simple' | 'medium' | 'complex';
  confidence?: number;
  analysisMethod: 'rule' | 'local-ai' | 'cloud-ai';
}

export interface AIProvider {
  readonly name: string;
  analyzeFile(filePath: string, content: string): Promise<AIAnalysisResult>;
  isAvailable(): Promise<boolean>;
}

export interface AnalysisStrategy {
  analyze(file: FileInfo, content: string): Promise<AIAnalysisResult>;
}
```

**说明**:
- 定义所有 AI Provider 必须实现的接口
- 支持规则、本地 AI、云端 AI 三种分析方式
- 添加 `analysisMethod` 字段追踪分析来源

---

### 2. 创建 AnalysisService 核心服务 ✅ TODO

**文件**: `src/analyzer/analysis-service.ts`

**内容**:
```typescript
export class AnalysisService implements AnalysisStrategy {
  constructor(
    private ruleProvider: RuleProvider,
    private aiProviders: AIProvider[],
    private config: DocMindConfig,
    private cacheManager: CacheManager
  ) {}
  
  async analyze(file: FileInfo, content: string): Promise<AIAnalysisResult> {
    // 1. 检查缓存
    if (this.config.ai?.cache?.enabled) {
      const cached = await this.cacheManager.get(file.path, content);
      if (cached) return cached;
    }
    
    // 2. 根据模式选择策略
    if (this.config.ai?.mode === 'rule-only') {
      return this.ruleProvider.analyzeFile(file.path, content);
    }
    
    // 3. 尝试 AI 分析（按优先级）
    for (const provider of this.aiProviders) {
      if (await provider.isAvailable()) {
        try {
          const result = await provider.analyzeFile(file.path, content);
          // 缓存结果
          if (this.config.ai?.cache?.enabled) {
            await this.cacheManager.set(file.path, content, result);
          }
          return { ...result, analysisMethod: provider.name.includes('local') ? 'local-ai' : 'cloud-ai' };
        } catch (error) {
          console.warn(`${provider.name} 分析失败，尝试下一个`);
        }
      }
    }
    
    // 4. 降级到规则匹配
    return this.ruleProvider.analyzeFile(file.path, content);
  }
}
```

**说明**:
- 统一调度规则匹配和 AI 分析
- 实现降级逻辑（AI 失败 → 规则匹配）
- 集成缓存机制

---

### 3. 实现 RuleProvider（提取现有逻辑） ✅ TODO

**文件**: `src/ai/providers\rule-provider.ts`

**内容**:
```typescript
import { AIProvider, AIAnalysisResult } from './ai-provider';

export class RuleProvider implements AIProvider {
  readonly name = 'rule';
  
  async analyzeFile(filePath: string, content: string): Promise<AIAnalysisResult> {
    const fileName = path.basename(filePath).toLowerCase();
    const ext = path.extname(filePath).toLowerCase();
    
    return {
      purpose: this.extractPurpose(fileName, ext, content),
      functions: this.extractFunctions(content).map(name => ({ name })),
      dependencies: this.extractDependencies(content),
      complexity: this.assessComplexity(content),
      analysisMethod: 'rule',
      confidence: 0.6 // 规则匹配置信度固定为 0.6
    };
  }
  
  private extractPurpose(fileName: string, ext: string, content: string): string {
    // 从 file-analyzer.ts 提取现有逻辑
    if (fileName.includes('main') || fileName.includes('index')) {
      return '程序入口，启动应用';
    }
    if (fileName.includes('config') || fileName.includes('setting')) {
      return '配置文件，存储应用设置';
    }
    // ... 更多规则
  }
  
  async isAvailable(): Promise<boolean> {
    return true; // 规则匹配总是可用
  }
}
```

**说明**:
- 提取 file-analyzer.ts 中的 `extractPurpose()` 等现有逻辑
- 实现 AIProvider 接口，保持向后兼容
- 规则匹配置信度固定为 0.6

---

### 4. 扩展配置接口 ✅ TODO

**文件**: `src/utils/config-loader.ts`

**修改**:
```typescript
export interface DocMindConfig {
  // 原有配置
  max_depth: number;
  exclude_patterns: string[];
  default_output_lang: string;
  
  // 新增 AI 配置
  ai?: {
    enabled: boolean;
    mode: 'rule-only' | 'ai-only' | 'hybrid';
    
    local?: {
      enabled: boolean;
      endpoint?: string;
      model?: string;
    };
    
    cloud?: {
      enabled: boolean;
      provider: 'dashscope' | 'openai' | 'custom';
      api_key?: string;
      model?: string;
      timeout_ms?: number;
    };
    
    fallback?: {
      on_error: 'rule' | 'cache' | 'fail';
      retry_count?: number;
    };
    
    cache?: {
      enabled: boolean;
      ttl_hours?: number;
      max_size?: number;
    };
  };
}
```

**说明**:
- 所有 AI 配置项设为可选（`?`）
- 保持向后兼容，不配置时默认规则匹配

---

### 5. 更新 skill.yaml ✅ TODO

**文件**: `skill.yaml`

**修改**:
```yaml
config:
  # 原有配置...
  max_depth: 5
  exclude_patterns: [...]
  
  # 新增 AI 配置
  ai:
    enabled: true
    mode: hybrid  # rule-only | ai-only | hybrid
    
    local:
      enabled: false
      endpoint: http://localhost:11434
      model: qwen:1.8b
    
    cloud:
      enabled: false  # 先禁用，后续阶段启用
      provider: dashscope
      api_key: ${DASHSCOPE_API_KEY}
      model: qwen-turbo
      timeout_ms: 15000
    
    fallback:
      on_error: rule
      retry_count: 1
    
    cache:
      enabled: true
      ttl_hours: 24
      max_size: 500
```

---

### 6. 集成到 FileAnalyzer ✅ TODO

**文件**: `src/analyzer/file-analyzer.ts`

**修改**:
```typescript
import { AnalysisService } from './analysis-service';
import { RuleProvider } from '../ai/providers/rule-provider';
import { CacheManager } from '../ai/cache/cache-manager';

export class FileAnalyzer {
  private analysisService: AnalysisService;
  
  constructor(config: DocMindConfig) {
    const ruleProvider = new RuleProvider();
    const cacheManager = new CacheManager(config.ai?.cache || {});
    
    // 初始阶段只使用规则匹配
    this.analysisService = new AnalysisService(
      ruleProvider,
      [], // AI Providers 在阶段 2 添加
      config,
      cacheManager
    );
  }
  
  private async analyzeFile(file: FileInfo): Promise<AnalyzedFile> {
    const content = await this.readFileContent(file.path);
    
    // 使用新的 AnalysisService
    const result = await this.analysisService.analyze(file, content);
    
    return {
      info: file,
      purpose: result.purpose,
      functions: result.functions.map(f => f.name),
      dependencies: result.dependencies,
      complexity: result.complexity
    };
  }
  
  // ... 其他方法保持不变
}
```

**说明**:
- 在构造函数中初始化 AnalysisService
- `analyzeFile()` 方法调用新的服务层
- 保持返回类型不变，向后兼容

---

## 阶段 1 完成标准

- [x] AI Provider 接口定义完成
- [ ] AnalysisService 实现完成
- [ ] RuleProvider 实现完成（提取现有逻辑）
- [ ] 配置接口扩展完成
- [ ] skill.yaml 更新完成
- [ ] FileAnalyzer 集成完成
- [ ] 编译通过 (`npm run build`)
- [ ] 基础测试通过（在 JDcapture 项目上测试）

---

## 执行命令

```bash
# 1. 安装依赖（阶段 1 不需要新依赖）
npm install

# 2. 编译 TypeScript
npm run build

# 3. 测试（在 JDcapture 项目）
cd examples/JDcapture
node ../../dist/main.js
```

---

## 预期输出

运行测试后应看到：
```
🚀 DocMind: 开始分析项目...
📁 发现 2 个文件夹
📄 发现 12 个文件
  ✓ 生成：项目总览.md
  ✓ 生成：文件关系图.md
  ✓ 生成：说明.md
  ✓ 生成：jd-screenshot-extension\说明.md
✅ DocMind: 文档生成完成！
```

功能应与当前版本完全一致（阶段 1 只重构，不添加新功能）。

---

## 下一步

阶段 1 完成后，进入**阶段 2：云端 AI 集成**
- 实现 DashScopeProvider
- 安装 dashscope 包
- 配置 API Key
- 测试 AI 分析效果

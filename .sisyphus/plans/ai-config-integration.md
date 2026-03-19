# AI 配置文件集成计划

> **状态**: 准备执行  
> **目标**: 创建独立的 ai.config.json 配置文件

---

## 任务清单

### 1. 创建 ai.config.json 配置文件 ✅ TODO

**文件**: `ai.config.json`

**内容**:
```json
{
  "ai": {
    "enabled": true,
    "mode": "hybrid",
    "provider": "dashscope",
    "model": "qwen-turbo",
    "apiKey": "sk-sp-bb86571730d642f094c5868a8577d8e0",
    "baseURL": "https://coding.dashscope.aliyuncs.com/apps/anthropic/v1",
    "timeout_ms": 15000,
    "cache": {
      "enabled": true,
      "ttl_hours": 24,
      "max_size": 500
    },
    "fallback": {
      "on_error": "rule",
      "retry_count": 1
    }
  }
}
```

### 2. 修改 ConfigLoader 支持 JSON 配置 ✅ TODO

**文件**: `src/utils/config-loader.ts`

**修改**:
```typescript
static async load(configPath?: string): Promise<DocMindConfig> {
  const config = await this.loadFromAIConfig();
  
  const skillYamlPath = configPath || path.join(process.cwd(), 'skill.yaml');
  
  try {
    const content = await fs.readFile(skillYamlPath, 'utf-8');
    const parsed = yaml.load(content) as any;
    
    if (parsed && parsed.config) {
      return {
        ...DEFAULT_CONFIG,
        ...parsed.config,
        ai: config.ai
      };
    }
  } catch (error) {
    console.log('⚠️ 使用默认配置（未找到 skill.yaml）');
  }
  
  return DEFAULT_CONFIG;
}

private static async loadFromAIConfig(): Promise<DocMindConfig> {
  const aiConfigPath = path.join(process.cwd(), 'ai.config.json');
  
  try {
    const content = await fs.readFile(aiConfigPath, 'utf-8');
    const aiConfig = JSON.parse(content);
    return {
      ...DEFAULT_CONFIG,
      ai: {
        ...DEFAULT_CONFIG.ai,
        ...aiConfig.ai,
        cloud: {
          enabled: aiConfig.ai.enabled,
          provider: aiConfig.ai.provider,
          api_key: aiConfig.ai.apiKey,
          endpoint: aiConfig.ai.baseURL,
          model: aiConfig.ai.model,
          timeout_ms: aiConfig.ai.timeout_ms
        },
        cache: aiConfig.ai.cache,
        fallback: aiConfig.ai.fallback
      }
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}
```

### 3. 更新 DashScopeProvider 使用 baseURL ✅ TODO

**文件**: `src/ai/providers/dashscope-provider.ts`

**修改**:
```typescript
constructor(
  apiKey: string, 
  model: string = 'qwen-turbo', 
  timeoutMs: number = 15000,
  baseURL?: string
) {
  this.apiKey = apiKey;
  this.model = model;
  this.timeoutMs = timeoutMs;
  this.baseURL = baseURL || 'https://dashscope.aliyuncs.com/api/v1';
}
```

### 4. 更新 skill.yaml ✅ TODO

**修改**: 移除环境变量引用，改为固定配置

### 5. 测试验证 ✅ TODO

---

## 执行步骤

```bash
# 1. 创建 ai.config.json
# 2. 修改 ConfigLoader
# 3. 更新 DashScopeProvider
# 4. 编译测试
npm run build

# 5. 运行测试
cd examples/JDcapture
node ../../dist/main.js
```

import { FileInfo } from '../scanner/project-scanner';
import { AIProvider, AIAnalysisResult, AnalysisStrategy } from '../ai/providers/ai-provider';
import { DocMindConfig } from '../utils/config-loader';
import { CacheManager } from '../ai/cache/cache-manager';
import { DashScopeProvider } from '../ai/providers/dashscope-provider';

export class AnalysisService implements AnalysisStrategy {
  private ruleProvider: AIProvider;
  private aiProviders: AIProvider[];
  private config: DocMindConfig;
  private cacheManager: CacheManager;
  
  constructor(
    ruleProvider: AIProvider,
    aiProviders: AIProvider[],
    config: DocMindConfig,
    cacheManager: CacheManager
  ) {
    this.ruleProvider = ruleProvider;
    this.aiProviders = aiProviders || [];
    this.config = config;
    this.cacheManager = cacheManager;
    
    this.initializeAIProviders();
  }
  
  private initializeAIProviders(): void {
    const aiConfig = this.config.ai;
    
    console.log('   [AnalysisService] Initializing AI providers...');
    console.log('   [AnalysisService] AI enabled:', aiConfig?.enabled);
    console.log('   [AnalysisService] Cloud enabled:', aiConfig?.cloud?.enabled);
    console.log('   [AnalysisService] API Key:', aiConfig?.cloud?.api_key ? '已设置' : '未设置');
    console.log('   [AnalysisService] Endpoint:', aiConfig?.cloud?.endpoint);
    
    if (!aiConfig || !aiConfig.enabled) {
      console.log('   [AnalysisService] AI not enabled, skipping...');
      return;
    }
    
    if (aiConfig.cloud?.enabled && aiConfig.cloud.api_key) {
      console.log('   [AnalysisService] Creating DashScopeProvider...');
      this.aiProviders.push(
        new DashScopeProvider(
          aiConfig.cloud.api_key,
          aiConfig.cloud.model || 'qwen3.5-plus',
          aiConfig.cloud.endpoint
        )
      );
      console.log('   [AnalysisService] DashScopeProvider created');
    }
  }
  
  async analyze(file: FileInfo, content: string): Promise<AIAnalysisResult> {
    const aiConfig = this.config.ai;
    
    if (aiConfig?.cache?.enabled) {
      const cached = await this.cacheManager.get(file.path, content);
      if (cached) {
        return cached;
      }
    }
    
    if (!aiConfig?.enabled || aiConfig.mode === 'rule-only') {
      return this.analyzeWithRule(file, content);
    }
    
    if (aiConfig.mode === 'ai-only' || aiConfig.mode === 'hybrid') {
      const result = await this.analyzeWithAI(file, content);
      if (result) {
        if (aiConfig.cache?.enabled) {
          await this.cacheManager.set(file.path, content, result);
        }
        return result;
      }
    }
    
    return this.analyzeWithRule(file, content);
  }
  
  private async analyzeWithRule(file: FileInfo, content: string): Promise<AIAnalysisResult> {
    return this.ruleProvider.analyzeFile(file.path, content);
  }
  
  private async analyzeWithAI(file: FileInfo, content: string): Promise<AIAnalysisResult | null> {
    for (const provider of this.aiProviders) {
      if (await provider.isAvailable()) {
        try {
          const result = await provider.analyzeFile(file.path, content);
          return result;
        } catch (error) {
          const fallbackConfig = this.config.ai?.fallback;
          if (fallbackConfig?.on_error !== 'fail') {
            continue;
          }
        }
      }
    }
    
    return null;
  }
}

import { AIAnalysisResult } from '../providers/ai-provider';

export class CacheManager {
  private cache = new Map<string, AIAnalysisResult>();
  
  async get(filePath: string, content: string): Promise<AIAnalysisResult | null> {
    const key = this.generateKey(filePath, content);
    return this.cache.get(key) || null;
  }
  
  async set(filePath: string, content: string, result: AIAnalysisResult): Promise<void> {
    const key = this.generateKey(filePath, content);
    this.cache.set(key, result);
  }
  
  private generateKey(filePath: string, content: string): string {
    const hash = this.simpleHash(content.substring(0, 1000));
    return `${filePath}:${hash}`;
  }
  
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }
}

import { AIProvider, AIAnalysisResult } from './ai-provider';
import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

export class DashScopeProvider implements AIProvider {
  readonly name = 'dashscope';
  private apiKey: string;
  private model: string;
  private baseURL: string;
  
  constructor(
    apiKey: string, 
    model: string = 'qwen3.5-plus', 
    baseURL: string = 'https://coding.dashscope.aliyuncs.com/apps/anthropic/v1'
  ) {
    this.apiKey = apiKey;
    this.model = model;
    this.baseURL = baseURL;
  }
  
  async analyzeFile(filePath: string, content: string): Promise<AIAnalysisResult> {
    const prompt = this.buildPrompt(filePath, content);
    
    try {
      const anthropic = createAnthropic({
        apiKey: this.apiKey,
        baseURL: this.baseURL
      });
      
      const { text } = await generateText({
        model: anthropic(this.model),
        messages: [{
          role: 'user',
          content: prompt
        }]
      });
      
      return this.parseResponse(text, filePath);
    } catch (error) {
      console.error(`AI 调用失败: ${error}`);
      throw error;
    }
  }
  
  private buildPrompt(filePath: string, content: string): string {
    const fileName = filePath.split('/').pop() || filePath;
    
    return `分析以下代码文件并生成文档：

文件路径：${filePath}
文件名：${fileName}

代码内容：
\`\`\`
${content.substring(0, 3000)}
\`\`\`

请用通俗易懂的中文回答以下问题：

1. 这个文件是干什么的？（一句话概括，30字以内）
2. 主要功能有哪些？（列出3-5个核心功能，每个功能简单描述）
3. 详细说明（包括使用场景和注意事项）

回答格式必须是JSON：
{
  "purpose": "文件用途简述",
  "functions": [
    {"name": "功能名称", "description": "功能描述"}
  ],
  "description": "详细说明"
}`;
  }
  
  private parseResponse(text: string, filePath: string): AIAnalysisResult {
    try {
      // 尝试提取 Markdown 代码块中的 JSON
      const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonText = codeBlockMatch ? codeBlockMatch[1].trim() : text;
      
      // 查找 JSON 对象
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        
        return {
          purpose: data.purpose || this.fallbackPurpose(filePath),
          enhancedPurpose: data.purpose,
          functions: Array.isArray(data.functions) ? data.functions : [],
          dependencies: [],
          description: data.description || data.purpose,
          complexity: 'medium',
          confidence: 0.85,
          analysisMethod: 'cloud-ai'
        };
      }
    } catch (error) {
      console.warn('AI 响应解析失败，使用原始文本');
    }
    
    return {
      purpose: text.substring(0, 100) || this.fallbackPurpose(filePath),
      functions: [],
      dependencies: [],
      complexity: 'medium',
      confidence: 0.5,
      analysisMethod: 'cloud-ai'
    };
  }
  
  private fallbackPurpose(filePath: string): string {
    const fileName = filePath.split('/').pop() || filePath;
    const ext = filePath.split('.').pop()?.toLowerCase() || '';
    
    if (ext === 'ts' || ext === 'js') {
      return `${fileName} 文件，实现程序功能`;
    }
    if (ext === 'py') {
      return `${fileName} 脚本，处理自动化任务`;
    }
    if (ext === 'json') {
      return `${fileName} 配置文件，存储设置信息`;
    }
    
    return `${fileName} 文件，包含程序代码`;
  }
  
  async isAvailable(): Promise<boolean> {
    if (!this.apiKey || this.apiKey.length < 10) {
      return false;
    }
    
    return true;
  }
}

import * as path from 'path';
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
      confidence: 0.6
    };
  }
  
  private extractPurpose(fileName: string, ext: string, content: string): string {
    if (fileName.includes('main') || fileName.includes('index')) {
      return '程序入口，启动应用';
    }
    if (fileName.includes('config') || fileName.includes('setting')) {
      return '配置文件，存储应用设置';
    }
    if (fileName.includes('util') || fileName.includes('helper')) {
      return '工具函数，提供常用功能';
    }
    if (fileName.includes('test') || fileName.includes('spec')) {
      return '测试文件，验证代码正确性';
    }
    if (fileName.includes('api') || fileName.includes('service')) {
      return '接口服务，处理数据请求';
    }
    if (fileName.includes('batch') || fileName.includes('processor')) {
      return '批处理脚本，批量处理数据';
    }
    if (fileName.includes('check') || fileName.includes('deps')) {
      return '依赖检查脚本，验证环境配置';
    }
    if (fileName.includes('background')) {
      return '后台脚本，在浏览器后台运行';
    }
    if (fileName.includes('content')) {
      return '内容脚本，操作网页内容';
    }
    if (fileName.includes('popup')) {
      return '弹出窗口脚本，处理扩展弹窗交互';
    }
    if (fileName.includes('manifest')) {
      return '扩展清单文件，配置浏览器扩展';
    }
    if (fileName.includes('readme')) {
      return '项目说明文档，介绍项目用途';
    }
    if (fileName.includes('example') || fileName.includes('demo')) {
      return '示例代码，演示功能用法';
    }
    
    if (ext === '.py') {
      return 'Python 脚本，实现自动化功能';
    }
    if (ext === '.js' || ext === '.ts') {
      return 'JavaScript 代码，实现交互功能';
    }
    if (ext === '.json') {
      return 'JSON 配置文件，存储数据';
    }
    if (ext === '.md') {
      return 'Markdown 文档，记录说明信息';
    }
    
    if (content.includes('chrome') || content.includes('browser')) {
      return '浏览器扩展脚本，操作浏览器功能';
    }
    if (content.includes('def ') && content.includes('import ')) {
      return 'Python 脚本，定义处理函数';
    }
    if (content.includes('function') || content.includes('const ') || content.includes('let ')) {
      return 'JavaScript 代码，实现交互功能';
    }
    
    return '代码文件，实现特定功能';
  }
  
  private extractFunctions(content: string): string[] {
    const functions: string[] = [];
    
    const patterns = [
      /function\s+(\w+)/g,
      /(?:export\s+)?(?:async\s+)?function\s+(\w+)/g,
      /const\s+(\w+)\s*=\s*(?:async\s+)?\(/g,
      /(\w+)\([^)]*\)\s*{/g
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (!functions.includes(match[1])) {
          functions.push(match[1]);
        }
      }
    }
    
    return functions.slice(0, 10);
  }
  
  private extractDependencies(content: string): string[] {
    const deps: string[] = [];
    
    const importPattern = /import\s+(?:{[^}]+}|\w+)\s+from\s+['"]([^'"]+)['"];?/g;
    let match;
    while ((match = importPattern.exec(content)) !== null) {
      deps.push(match[1]);
    }
    
    const requirePattern = /require\(['"]([^'"]+)['"]\)/g;
    while ((match = requirePattern.exec(content)) !== null) {
      deps.push(match[1]);
    }
    
    return deps.filter(d => !d.startsWith('.'));
  }
  
  private assessComplexity(content: string): 'simple' | 'medium' | 'complex' {
    const lines = content.split('\n').length;
    
    if (lines < 50) return 'simple';
    if (lines < 200) return 'medium';
    return 'complex';
  }
  
  async isAvailable(): Promise<boolean> {
    return true;
  }
}

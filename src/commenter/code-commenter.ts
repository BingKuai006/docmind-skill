/**
 * 代码注释模块
 * 
 * 这个文件负责为代码文件添加头部注释，
 * 用通俗的语言说明文件用途。
 * 
 * 主要功能：
 * 1. 读取代码文件
 * 2. 生成小白友好的注释
 * 3. 添加到文件开头
 * 
 * 什么时候会用到：
 * 文档生成完成后，为代码文件添加注释
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { AnalyzedProject, AnalyzedFile } from '../analyzer/file-analyzer';

export class CodeCommenter {
  private config: any;
  
  constructor(config: any) {
    this.config = config;
  }
  
  async addComments(project: AnalyzedProject): Promise<void> {
    const codeFiles = project.files.filter(f => f.info.type === 'code');
    
    console.log(`📝 正在为 ${codeFiles.length} 个代码文件添加注释...`);
    
    for (const file of codeFiles) {
      await this.addCommentToFile(file);
    }
  }
  
  private async addCommentToFile(file: AnalyzedFile): Promise<void> {
    try {
      const content = await fs.readFile(file.info.path, 'utf-8');
      
      // 检查是否已有注释
      if (this.hasExistingComment(content, file.info.extension)) {
        console.log(`  ⏭️ 跳过（已有注释）: ${file.info.name}`);
        return;
      }
      
      // 生成注释
      const comment = this.generateComment(file);
      
      // 添加注释到文件开头
      const newContent = comment + '\n' + content;
      await fs.writeFile(file.info.path, newContent, 'utf-8');
      
      console.log(`  ✓ 已添加注释: ${file.info.name}`);
    } catch (error) {
      console.error(`  ✗ 添加注释失败: ${file.info.name}`, error);
    }
  }
  
  private hasExistingComment(content: string, extension: string): boolean {
    const trimmed = content.trim();
    
    // 检查是否已有文档注释
    if (extension === '.ts' || extension === '.tsx' || extension === '.js' || extension === '.jsx') {
      return trimmed.startsWith('/**') || trimmed.startsWith('/*');
    }
    
    if (extension === '.py') {
      return trimmed.startsWith('"""') || trimmed.startsWith("'''");
    }
    
    if (extension === '.java' || extension === '.cs' || extension === '.cpp' || extension === '.c') {
      return trimmed.startsWith('/**') || trimmed.startsWith('/*');
    }
    
    return false;
  }
  
  private generateComment(file: AnalyzedFile): string {
    const ext = file.info.extension.toLowerCase();
    
    // 根据文件类型选择注释格式
    switch (ext) {
      case '.ts':
      case '.tsx':
      case '.js':
      case '.jsx':
        return this.generateJSComment(file);
      case '.py':
        return this.generatePythonComment(file);
      case '.java':
      case '.cs':
        return this.generateJavaComment(file);
      default:
        return this.generateGenericComment(file);
    }
  }
  
  private generateJSComment(file: AnalyzedFile): string {
    const functions = file.functions.slice(0, 5);
    const deps = file.dependencies.slice(0, 3);
    
    let comment = `/**
 * ${file.info.name}
 * 
 * ${file.purpose}
 * 
 * 主要功能：
`;
    
    if (functions.length > 0) {
      for (const func of functions) {
        comment += ` * - ${func}()
`;
      }
    } else {
      comment += ` * - 实现核心逻辑
`;
    }
    
    comment += ` * 
 * 什么时候会用到：
`;
    
    if (file.info.name.toLowerCase().includes('main') || file.info.name.toLowerCase().includes('index')) {
      comment += ` * - 程序启动时执行
`;
    } else if (file.info.name.toLowerCase().includes('util') || file.info.name.toLowerCase().includes('helper')) {
      comment += ` * - 需要辅助功能时调用
`;
    } else if (deps.length > 0) {
      comment += ` * - 需要${deps[0].split('/').pop()}功能时
`;
    } else {
      comment += ` * - ${file.purpose.replace('这个文件', '').replace('。', '时')}
`;
    }
    
    comment += ` */`;
    
    return comment;
  }
  
  private generatePythonComment(file: AnalyzedFile): string {
    const functions = file.functions.slice(0, 5);
    
    let comment = `"""${file.info.name}

${file.purpose}

主要功能：`;
    
    if (functions.length > 0) {
      for (const func of functions) {
        comment += `\n- ${func}()`;
      }
    } else {
      comment += '\n- 实现核心逻辑';
    }
    
    comment += `\n\n什么时候会用到：\n- ${file.purpose.replace('这个文件', '').replace('。', '时')}\n"""`;
    
    return comment;
  }
  
  private generateJavaComment(file: AnalyzedFile): string {
    const functions = file.functions.slice(0, 5);
    
    let comment = `/**
 * ${file.info.name}
 * 
 * ${file.purpose}
 * 
 * 主要方法：`;
    
    if (functions.length > 0) {
      for (const func of functions) {
        comment += `\n * - ${func}()`;
      }
    } else {
      comment += `\n * - 实现核心逻辑`;
    }
    
    comment += `\n * \n * @author DocMind\n */`;
    
    return comment;
  }
  
  private generateGenericComment(file: AnalyzedFile): string {
    return `/**
 * ${file.info.name}
 * 
 * ${file.purpose}
 * 
 * 主要功能：实现特定功能
 * 什么时候会用到：${file.purpose.replace('这个文件', '').replace('。', '时')}
 */`;
  }
}

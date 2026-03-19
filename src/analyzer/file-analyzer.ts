/**
 * 文件分析器模块
 * 
 * 这个文件负责分析扫描到的文件内容，
 * 理解每个文件的功能和用途。
 * 
 * 主要功能：
 * 1. 分析代码文件的功能
 * 2. 识别文件间的关系
 * 3. 提取关键信息
 * 
 * 什么时候会用到：
 * 扫描完成后，生成文档之前
 */

import * as fs from 'fs/promises';
import { ProjectStructure, FileInfo, FolderInfo } from '../scanner/project-scanner';
import { AnalysisService } from './analysis-service';
import { RuleProvider } from '../ai/providers/rule-provider';
import { CacheManager } from '../ai/cache/cache-manager';
import { DocMindConfig } from '../utils/config-loader';

export interface AnalyzedFile {
  info: FileInfo;
  purpose: string;
  functions: string[];
  dependencies: string[];
  complexity: 'simple' | 'medium' | 'complex';
}

export interface AnalyzedFolder {
  info: FolderInfo;
  purpose: string;
  mainFiles: string[];
  importance: 'core' | 'supporting' | 'optional';
}

export interface AnalyzedProject {
  rootPath: string;
  folders: AnalyzedFolder[];
  files: AnalyzedFile[];
  relationships: FileRelationship[];
}

export interface FileRelationship {
  from: string;
  to: string;
  type: 'import' | 'reference' | 'dependency' | 'config';
}

export class FileAnalyzer {
  private analysisService: AnalysisService;
  
  constructor(config: DocMindConfig) {
    const ruleProvider = new RuleProvider();
    const cacheManager = new CacheManager();
    
    this.analysisService = new AnalysisService(
      ruleProvider,
      [],
      config,
      cacheManager
    );
  }
  
  async analyze(structure: ProjectStructure): Promise<AnalyzedProject> {
    const analyzed: AnalyzedProject = {
      rootPath: structure.rootPath,
      folders: [],
      files: [],
      relationships: []
    };
    
    // 分析每个文件
    for (const file of structure.files) {
      const analyzedFile = await this.analyzeFile(file);
      analyzed.files.push(analyzedFile);
    }
    
    // 分析每个文件夹
    for (const folder of structure.folders) {
      const analyzedFolder = await this.analyzeFolder(folder, analyzed.files);
      analyzed.folders.push(analyzedFolder);
    }
    
    // 分析文件间关系
    analyzed.relationships = await this.analyzeRelationships(analyzed.files);
    
    return analyzed;
  }
  
  private async analyzeFile(file: FileInfo): Promise<AnalyzedFile> {
    const content = await this.readFileContent(file.path);
    
    const result = await this.analysisService.analyze(file, content);
    
    return {
      info: file,
      purpose: result.purpose,
      functions: result.functions.map(f => f.name),
      dependencies: result.dependencies,
      complexity: result.complexity
    };
  }
  
  private async analyzeFolder(
    folder: FolderInfo, 
    analyzedFiles: AnalyzedFile[]
  ): Promise<AnalyzedFolder> {
    const folderFiles = analyzedFiles.filter(f => 
      f.info.path.startsWith(folder.path)
    );
    
    const mainFiles = folderFiles
      .filter(f => f.complexity !== 'simple' || f.info.type === 'config')
      .map(f => f.info.name)
      .slice(0, 5); // 最多取5个主要文件
    
    return {
      info: folder,
      purpose: this.inferFolderPurpose(folder, folderFiles),
      mainFiles,
      importance: this.assessFolderImportance(folder, folderFiles)
    };
  }
  
  private async readFileContent(filePath: string): Promise<string> {
    try {
      // 只读取前100KB，避免大文件
      const buffer = await fs.readFile(filePath);
      return buffer.toString('utf-8', 0, Math.min(buffer.length, 102400));
    } catch {
      return '';
    }
  }
  
  private extractPurpose(file: FileInfo, content: string): string {
    const nameLower = file.name.toLowerCase();
    const ext = file.extension.toLowerCase();
    
    if (nameLower.includes('main') || nameLower.includes('index')) {
      return '程序入口，启动应用';
    }
    if (nameLower.includes('config') || nameLower.includes('setting')) {
      return '配置文件，存储应用设置';
    }
    if (nameLower.includes('util') || nameLower.includes('helper')) {
      return '工具函数，提供常用功能';
    }
    if (nameLower.includes('test') || nameLower.includes('spec')) {
      return '测试文件，验证代码正确性';
    }
    if (nameLower.includes('api') || nameLower.includes('service')) {
      return '接口服务，处理数据请求';
    }
    if (nameLower.includes('batch') || nameLower.includes('processor')) {
      return '批处理脚本，批量处理数据';
    }
    if (nameLower.includes('check') || nameLower.includes('deps')) {
      return '依赖检查脚本，验证环境配置';
    }
    if (nameLower.includes('background')) {
      return '后台脚本，在浏览器后台运行';
    }
    if (nameLower.includes('content')) {
      return '内容脚本，操作网页内容';
    }
    if (nameLower.includes('popup')) {
      return '弹出窗口脚本，处理扩展弹窗交互';
    }
    if (nameLower.includes('manifest')) {
      return '扩展清单文件，配置浏览器扩展';
    }
    if (nameLower.includes('readme')) {
      return '项目说明文档，介绍项目用途';
    }
    if (nameLower.includes('example') || nameLower.includes('demo')) {
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
  
  private extractFunctions(file: FileInfo, content: string): string[] {
    const functions: string[] = [];
    
    // 简单提取函数名（基于常见模式）
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
    
    return functions.slice(0, 10); // 最多返回10个
  }
  
  private extractDependencies(content: string): string[] {
    const deps: string[] = [];
    
    // 提取 import 语句
    const importPattern = /import\s+(?:{[^}]+}|\w+)\s+from\s+['"]([^'"]+)['"];?/g;
    let match;
    while ((match = importPattern.exec(content)) !== null) {
      deps.push(match[1]);
    }
    
    // 提取 require
    const requirePattern = /require\(['"]([^'"]+)['"]\)/g;
    while ((match = requirePattern.exec(content)) !== null) {
      deps.push(match[1]);
    }
    
    return deps.filter(d => !d.startsWith('.')); // 只保留外部依赖
  }
  
  private assessComplexity(file: FileInfo, content: string): 'simple' | 'medium' | 'complex' {
    const lines = content.split('\n').length;
    
    if (lines < 50) return 'simple';
    if (lines < 200) return 'medium';
    return 'complex';
  }
  
  private inferFolderPurpose(
    folder: FolderInfo, 
    files: AnalyzedFile[]
  ): string {
    const nameLower = folder.name.toLowerCase();
    
    if (nameLower.includes('src') || nameLower.includes('source')) {
      return '源代码目录，存放主要程序代码';
    }
    if (nameLower.includes('extension') || nameLower.includes('plugin')) {
      return '浏览器扩展目录，包含扩展相关代码';
    }
    if (nameLower.includes('test') || nameLower.includes('spec')) {
      return '测试目录，存放测试代码';
    }
    if (nameLower.includes('doc') || nameLower.includes('docs')) {
      return '文档目录，存放项目说明文档';
    }
    if (nameLower.includes('config') || nameLower.includes('conf')) {
      return '配置目录，存放各种配置文件';
    }
    if (nameLower.includes('asset') || nameLower.includes('resource') || nameLower.includes('public')) {
      return '资源目录，存放图片、样式等资源文件';
    }
    if (nameLower.includes('component') || nameLower.includes('components')) {
      return '组件目录，存放可复用的UI组件';
    }
    if (nameLower.includes('util') || nameLower.includes('utils') || nameLower.includes('helper')) {
      return '工具目录，存放辅助函数和工具类';
    }
    
    // 基于文件类型推断
    const codeFiles = files.filter(f => f.info.type === 'code').length;
    const configFiles = files.filter(f => f.info.type === 'config').length;
    
    if (codeFiles > configFiles) {
      return '代码目录，包含程序实现文件';
    }
    if (configFiles > codeFiles) {
      return '配置目录，包含各种设置文件';
    }
    
    return '项目目录，存放相关文件';
  }
  
  private assessFolderImportance(
    folder: FolderInfo, 
    files: AnalyzedFile[]
  ): 'core' | 'supporting' | 'optional' {
    const codeFiles = files.filter(f => f.info.type === 'code').length;
    const hasMainFile = files.some(f => 
      f.info.name.toLowerCase().includes('main') ||
      f.info.name.toLowerCase().includes('index')
    );
    
    if (hasMainFile || codeFiles > 5) {
      return 'core';
    }
    if (codeFiles > 0) {
      return 'supporting';
    }
    return 'optional';
  }
  
  private async analyzeRelationships(files: AnalyzedFile[]): Promise<FileRelationship[]> {
    const relationships: FileRelationship[] = [];
    
    // 简单示例：基于共同依赖分析关系
    const fileMap = new Map(files.map(f => [f.info.path, f]));
    
    for (const file of files) {
      for (const dep of file.dependencies) {
        // 查找哪些其他文件也依赖这个
        const relatedFiles = files.filter(f => 
          f !== file && f.dependencies.includes(dep)
        );
        
        for (const related of relatedFiles) {
          relationships.push({
            from: file.info.path,
            to: related.info.path,
            type: 'dependency'
          });
        }
      }
    }
    
    return relationships;
  }
}

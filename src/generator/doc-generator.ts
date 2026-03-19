/**
 * 文档生成器模块
 * 
 * 这个文件负责根据分析结果生成各类说明文档。
 * 
 * 主要功能：
 * 1. 生成项目总览文档
 * 2. 生成文件夹说明文档
 * 3. 生成文件关系图
 * 
 * 什么时候会用到：
 * 文件分析完成后，输出文档到各个目录
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { AnalyzedProject, AnalyzedFolder, AnalyzedFile } from '../analyzer/file-analyzer';

export class DocGenerator {
  private config: any;
  
  constructor(config: any) {
    this.config = config;
  }
  
  async generate(project: AnalyzedProject): Promise<void> {
    // 1. 生成项目总览
    await this.generateProjectOverview(project);
    
    // 2. 生成文件关系图
    await this.generateRelationshipDiagram(project);
    
    // 3. 为每个文件夹生成说明
    for (const folder of project.folders) {
      await this.generateFolderDoc(folder, project);
    }
  }
  
  private async generateProjectOverview(project: AnalyzedProject): Promise<void> {
    const content = await this.buildOverviewContent(project);
    const outputPath = path.join(project.rootPath, '项目总览.md');
    await fs.writeFile(outputPath, content, 'utf-8');
    console.log(`  ✓ 生成: 项目总览.md`);
  }
  
  private async generateRelationshipDiagram(project: AnalyzedProject): Promise<void> {
    const content = this.buildDiagramContent(project);
    const outputPath = path.join(project.rootPath, '文件关系图.md');
    await fs.writeFile(outputPath, content, 'utf-8');
    console.log(`  ✓ 生成: 文件关系图.md`);
  }
  
  private async generateFolderDoc(
    folder: AnalyzedFolder, 
    project: AnalyzedProject
  ): Promise<void> {
    const content = this.buildFolderContent(folder, project);
    const outputPath = path.join(folder.info.path, '说明.md');
    await fs.writeFile(outputPath, content, 'utf-8');
    console.log(`  ✓ 生成: ${path.relative(project.rootPath, outputPath)}`);
  }
  
  private async buildOverviewContent(project: AnalyzedProject): Promise<string> {
    const coreFolders = project.folders.filter(f => f.importance === 'core');
    const codeFiles = project.files.filter(f => f.info.type === 'code');
    const mainFiles = project.files.filter(f => 
      f.info.name.toLowerCase().includes('main') ||
      f.info.name.toLowerCase().includes('index') ||
      f.info.name.toLowerCase().includes('jd_batch_processor') ||
      f.info.name.toLowerCase().includes('app') ||
      f.info.name.toLowerCase().includes('server')
    );
    
    // 尝试从 README.md 提取项目描述
    const projectDescription = await this.extractProjectDescription(project.rootPath);
    
    return `# 项目总览

## 这个项目是干什么的？

${projectDescription}

## 项目结构概览

### 核心目录

${coreFolders.map(f => `- **${f.info.name}/** - ${f.purpose}`).join('\n') || '（正在分析中...）'}

### 主要文件

${mainFiles.map(f => `- **${f.info.name}** - ${f.purpose}`).join('\n') || '（正在分析中...）'}

## 代码统计

- 总文件夹数：${project.folders.length}
- 总文件数：${project.files.length}
- 代码文件数：${codeFiles.length}
- 配置文件数：${project.files.filter(f => f.info.type === 'config').length}
- 文档文件数：${project.files.filter(f => f.info.type === 'document').length}

## 如何开始？

1. 先查看 [文件关系图.md](文件关系图.md) 了解文件之间的联系
2. 然后查看各文件夹中的 [说明.md](说明.md) 了解具体内容
3. 从主要文件开始阅读代码

---
*由 DocMind 自动生成*
`;
  }
  
  private buildDiagramContent(project: AnalyzedProject): string {
    // 生成 Mermaid 图表
    const folderTree = this.buildFolderTree(project);
    const relationshipGraph = this.buildRelationshipGraph(project);
    
    return `# 文件关系图

## 目录结构

\`\`\`mermaid
graph TD
${folderTree}
\`\`\`

## 文件依赖关系

\`\`\`mermaid
graph LR
${relationshipGraph}
\`\`\`

## 核心模块关系

以下展示了项目中主要模块之间的依赖关系：

${this.buildModuleDescription(project)}

---
*由 DocMind 自动生成*
`;
  }
  
  private buildFolderTree(project: AnalyzedProject): string {
    const lines: string[] = [];
    const sorted = project.folders.sort((a, b) => a.info.depth - b.info.depth);
    
    for (const folder of sorted) {
      if (folder.info.depth === 0) continue;
      
      const indent = '  '.repeat(folder.info.depth - 1);
      const sanitizedName = folder.info.name.replace(/[^a-zA-Z0-9_]/g, '_');
      
      if (folder.info.depth === 1) {
        lines.push(`${indent}Root --- ${sanitizedName}[${folder.info.name}/]`);
      } else {
        const parentName = path.basename(path.dirname(folder.info.path)).replace(/[^a-zA-Z0-9_]/g, '_');
        lines.push(`${indent}${parentName} --- ${sanitizedName}[${folder.info.name}/]`);
      }
    }
    
    return lines.join('\n');
  }
  
  private buildRelationshipGraph(project: AnalyzedProject): string {
    const lines: string[] = [];
    const added = new Set<string>();
    
    // 取前20个关系避免图表太复杂
    for (const rel of project.relationships.slice(0, 20)) {
      const from = path.basename(rel.from).replace(/[^a-zA-Z0-9_]/g, '_');
      const to = path.basename(rel.to).replace(/[^a-zA-Z0-9_]/g, '_');
      const key = `${from}-${to}`;
      
      if (!added.has(key)) {
        lines.push(`  ${from}[${path.basename(rel.from)}] --> ${to}[${path.basename(rel.to)}]`);
        added.add(key);
      }
    }
    
    return lines.join('\n') || '  Root[项目根目录]';
  }
  
  private buildModuleDescription(project: AnalyzedProject): string {
    const descriptions: string[] = [];
    const coreFiles = project.files.filter(f => f.complexity === 'complex').slice(0, 5);
    
    for (const file of coreFiles) {
      const deps = file.dependencies.slice(0, 3).join(', ') || '无外部依赖';
      descriptions.push(`### ${file.info.name}\n\n${file.purpose}\n\n**依赖**: ${deps}\n`);
    }
    
    return descriptions.join('\n') || '（正在分析模块关系...）';
  }
  
  private buildFolderContent(folder: AnalyzedFolder, project: AnalyzedProject): string {
    const folderFiles = project.files.filter(f => 
      path.dirname(f.info.path) === folder.info.path
    );
    
    const codeFiles = folderFiles.filter(f => f.info.type === 'code');
    const configFiles = folderFiles.filter(f => f.info.type === 'config');
    const otherFiles = folderFiles.filter(f => 
      f.info.type !== 'code' && f.info.type !== 'config'
    );
    
    return `# ${folder.info.name}

## 这个文件夹是干什么的？

${folder.purpose}

## 里面有什么？

### 代码文件 (${codeFiles.length}个)

${codeFiles.map(f => `- **${f.info.name}** - ${f.purpose}`).join('\n') || '（无代码文件）'}

### 配置文件 (${configFiles.length}个)

${configFiles.map(f => `- **${f.info.name}** - 配置文件`).join('\n') || '（无配置文件）'}

### 其他文件 (${otherFiles.length}个)

${otherFiles.map(f => `- **${f.info.name}** - ${f.info.type === 'document' ? '文档' : '资源'}文件`).join('\n') || '（无其他文件）'}

## 子文件夹

${folder.info.subfolders.filter(sf => !path.basename(sf).startsWith('.')).map(sf => `- ${path.basename(sf)}/`).join('\n') || '（无子文件夹）'}

## 重要说明

${folder.importance === 'core' ? '- ⚠️ **核心目录**：这个文件夹包含重要的代码文件' : ''}
${folder.importance === 'supporting' ? '- ℹ️ **辅助目录**：提供辅助功能支持' : ''}
${folder.mainFiles.length > 0 ? `- 📌 **主要文件**：${folder.mainFiles.join(', ')}` : ''}

---
*由 DocMind 自动生成*
`;
  }
  
  private async extractProjectDescription(rootPath: string): Promise<string> {
    const readmePaths = [
      path.join(rootPath, 'README.md'),
      path.join(rootPath, 'readme.md'),
      path.join(rootPath, 'README.MD')
    ];
    
    for (const readmePath of readmePaths) {
      try {
        const content = await fs.readFile(readmePath, 'utf-8');
        
        const lines = content.split('\n').filter(line => line.trim());
        let inCodeBlock = false;
        let firstH1Title = '';
        
        for (const line of lines) {
          const trimmed = line.trim();
          
          // 记录第一个一级标题
          if (trimmed.startsWith('# ') && !firstH1Title) {
            firstH1Title = trimmed.replace(/^#\s*/, '').trim();
          }
          
          // 跳过代码块标记
          if (trimmed.startsWith('```')) {
            inCodeBlock = !inCodeBlock;
            continue;
          }
          
          // 在代码块内，跳过
          if (inCodeBlock) {
            continue;
          }
          
          // 跳过分隔线
          if (trimmed === '---' || trimmed === '***') {
            continue;
          }
          
          // 跳过二级及以下标题
          if (trimmed.startsWith('##')) {
            continue;
          }
          
          // 跳过目录结构行（包含树形符号）
          if (trimmed.includes('├──') || trimmed.includes('│') || trimmed.includes('└──')) {
            continue;
          }
          
          // 跳过 Markdown 表格行
          if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
            continue;
          }
          
          // 跳过纯链接
          if (trimmed.startsWith('[') && trimmed.includes('](')) {
            continue;
          }
          
          // 跳过图片
          if (trimmed.startsWith('![')) {
            continue;
          }
          
          // 跳过 Markdown 列表项（包括数字列表）
          if (/^\d+\./.test(trimmed) || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            continue;
          }
          
          // 跳过以冒号结尾的行（通常是引导语）
          if (trimmed.endsWith(':') || trimmed.endsWith('：')) {
            continue;
          }
          
          // 返回第一个有效描述行
          if (trimmed.length > 10) {
            return trimmed;
          }
        }
        
        // 如果没有找到描述，使用一级标题
        if (firstH1Title) {
          return firstH1Title;
        }
        
        return '这是一个代码项目，包含各种程序文件。';
      } catch {
        continue;
      }
    }
    
    return '这是一个代码项目，包含各种程序文件。';
  }
}

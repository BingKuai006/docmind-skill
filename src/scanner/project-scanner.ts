/**
 * 项目扫描器模块
 * 
 * 这个文件负责扫描整个项目的目录结构，
 * 收集所有文件夹和文件的信息。
 * 
 * 主要功能：
 * 1. 递归遍历目录
 * 2. 识别文件类型
 * 3. 过滤排除的文件
 * 
 * 什么时候会用到：
 * 文档生成流程的第一步
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface FileInfo {
  path: string;
  name: string;
  extension: string;
  type: 'code' | 'config' | 'document' | 'asset' | 'other';
  size: number;
}

export interface FolderInfo {
  path: string;
  name: string;
  depth: number;
  files: FileInfo[];
  subfolders: string[];
}

export interface ProjectStructure {
  rootPath: string;
  folders: FolderInfo[];
  files: FileInfo[];
}

export class ProjectScanner {
  private config: any;
  
  constructor(config: any) {
    this.config = config;
  }
  
  async scan(projectPath: string = process.cwd()): Promise<ProjectStructure> {
    const structure: ProjectStructure = {
      rootPath: projectPath,
      folders: [],
      files: []
    };
    
    await this.scanDirectory(projectPath, structure, 0);
    
    return structure;
  }
  
  private async scanDirectory(
    dirPath: string, 
    structure: ProjectStructure, 
    depth: number
  ): Promise<void> {
    // 检查深度限制
    if (depth >= this.config.max_depth) {
      return;
    }
    
    // 检查是否应该排除此目录
    if (this.shouldExclude(dirPath)) {
      return;
    }
    
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    const folderInfo: FolderInfo = {
      path: dirPath,
      name: path.basename(dirPath),
      depth,
      files: [],
      subfolders: []
    };
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        // 递归扫描子目录
        folderInfo.subfolders.push(fullPath);
        await this.scanDirectory(fullPath, structure, depth + 1);
      } else if (entry.isFile()) {
        // 处理文件
        if (!this.shouldExclude(fullPath)) {
          const fileInfo = await this.getFileInfo(fullPath);
          folderInfo.files.push(fileInfo);
          structure.files.push(fileInfo);
        }
      }
    }
    
    structure.folders.push(folderInfo);
  }
  
  private shouldExclude(filePath: string): boolean {
    const relativePath = path.relative(process.cwd(), filePath);
    const fileName = path.basename(filePath);
    const dirName = path.basename(path.dirname(filePath));
    
    for (const pattern of this.config.exclude_patterns) {
      if (this.matchPattern(relativePath, pattern)) {
        return true;
      }
      if (this.matchPattern(fileName, pattern)) {
        return true;
      }
      if (this.matchPattern(dirName, pattern)) {
        return true;
      }
    }
    
    return false;
  }
  
  private matchPattern(filePath: string, pattern: string): boolean {
    const cleanPattern = pattern.replace(/\/$/, '');
    const cleanPath = filePath.replace(/\/$/, '');
    
    if (cleanPath === cleanPattern) {
      return true;
    }
    
    if (cleanPath.includes('/' + cleanPattern + '/') || 
        cleanPath.startsWith(cleanPattern + '/') ||
        cleanPath.endsWith('/' + cleanPattern)) {
      return true;
    }
    
    const regexPattern = cleanPattern
      .replace(/\*\*/g, '<<<DOUBLESTAR>>>')
      .replace(/\*/g, '[^/]*')
      .replace(/<<<DOUBLESTAR>>>/g, '.*')
      .replace(/\?/g, '.');
    
    const regex = new RegExp(regexPattern);
    return regex.test(cleanPath) || regex.test(path.basename(cleanPath));
  }
  
  private async getFileInfo(filePath: string): Promise<FileInfo> {
    const stats = await fs.stat(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    return {
      path: filePath,
      name: path.basename(filePath),
      extension: ext,
      type: this.getFileType(ext),
      size: stats.size
    };
  }
  
  private getFileType(extension: string): FileInfo['type'] {
    const codeExts = ['.ts', '.js', '.tsx', '.jsx', '.py', '.java', '.go', '.rs', '.c', '.cpp', '.cs', '.php', '.rb'];
    const configExts = ['.json', '.yaml', '.yml', '.toml', '.ini', '.config'];
    const docExts = ['.md', '.txt', '.doc', '.docx', '.pdf'];
    
    if (codeExts.includes(extension)) return 'code';
    if (configExts.includes(extension)) return 'config';
    if (docExts.includes(extension)) return 'document';
    
    return 'other';
  }
}

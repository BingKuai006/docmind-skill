/**
 * 主入口文件
 * 
 * 这个文件是 DocMind Skill 的启动入口，
 * 负责协调各个模块完成项目文档生成任务。
 * 
 * 主要流程：
 * 1. 读取配置
 * 2. 扫描项目结构
 * 3. 分析文件内容
 * 4. 生成说明文档
 * 5. 添加代码注释
 * 
 * 什么时候会用到：
 * 用户执行 /docmind 命令时自动调用
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// 显式加载 .env 文件
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import { ProjectScanner } from './scanner/project-scanner';
import { FileAnalyzer } from './analyzer/file-analyzer';
import { DocGenerator } from './generator/doc-generator';
import { CodeCommenter } from './commenter/code-commenter';
import { ConfigLoader } from './utils/config-loader';

async function main(): Promise<void> {
  console.log('🚀 DocMind: 开始分析项目...');
  
  try {
    // 1. 加载配置
    const skillYamlPath = path.join(__dirname, '..', 'skill.yaml');
    const config = await ConfigLoader.load(skillYamlPath);
    
    // 2. 扫描项目
    const scanner = new ProjectScanner(config);
    const projectStructure = await scanner.scan();
    
    console.log(`📁 发现 ${projectStructure.folders.length} 个文件夹`);
    console.log(`📄 发现 ${projectStructure.files.length} 个文件`);
    
    // 3. 分析文件
    const analyzer = new FileAnalyzer(config);
    const analyzedData = await analyzer.analyze(projectStructure);
    
    // 4. 生成文档
    const generator = new DocGenerator(config);
    await generator.generate(analyzedData);
    
    // 5. 添加注释
    const commenter = new CodeCommenter(config);
    await commenter.addComments(analyzedData);
    
    console.log('✅ DocMind: 文档生成完成！');
    console.log('');
    console.log('📖 生成的文件：');
    console.log('   - 项目总览.md');
    console.log('   - 文件关系图.md');
    console.log('   - 各个文件夹中的 说明.md');
    
  } catch (error) {
    console.error('❌ DocMind 执行失败:', error);
    process.exit(1);
  }
}

main();

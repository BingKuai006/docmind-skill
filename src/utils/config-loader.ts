/**
 * 配置加载工具
 * 
 * 这个文件负责加载和解析 Skill 的配置文件。
 * 
 * 主要功能：
 * 1. 读取 skill.yaml 配置文件
 * 2. 提供默认配置
 * 3. 合并用户配置
 * 
 * 什么时候会用到：
 * Skill 启动时加载配置
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'js-yaml';

export interface DocMindConfig {
  max_depth: number;
  exclude_patterns: string[];
  default_output_lang: string;
  
  ai?: {
    enabled: boolean;
    mode: 'rule-only' | 'ai-only' | 'hybrid';
    
    local?: {
      enabled: boolean;
      endpoint?: string;
      model?: string;
    };
    
    cloud?: {
      enabled: boolean;
      provider: 'dashscope' | 'openai' | 'custom';
      api_key?: string;
      endpoint?: string;
      model?: string;
      timeout_ms?: number;
    };
    
    fallback?: {
      on_error: 'rule' | 'cache' | 'fail';
      retry_count?: number;
    };
    
    cache?: {
      enabled: boolean;
      ttl_hours?: number;
      max_size?: number;
    };
  };
}

const DEFAULT_CONFIG: DocMindConfig = {
  max_depth: 5,
  exclude_patterns: [
    'node_modules',
    '.git',
    '.sisyphus',
    'dist',
    'build',
    'coverage',
    '.vscode',
    '.idea',
    '*.log',
    '*.tmp',
    '.DS_Store',
    'package-lock.json',
    'yarn.lock',
    '*.backup',
    '说明.md',
    '项目总览.md',
    '文件关系图.md'
  ],
  default_output_lang: 'zh-CN',
  
  ai: {
    enabled: false,
    mode: 'rule-only',
    local: {
      enabled: false,
      endpoint: 'http://localhost:11434',
      model: 'qwen:1.8b'
    },
    cloud: {
      enabled: false,
      provider: 'dashscope',
      model: 'qwen3.5-plus',
      timeout_ms: 15000
    },
    fallback: {
      on_error: 'rule',
      retry_count: 1
    },
    cache: {
      enabled: true,
      ttl_hours: 24,
      max_size: 500
    }
  }
};

export class ConfigLoader {
  static async load(configPath?: string): Promise<DocMindConfig> {
    const skillYamlPath = configPath || path.join(process.cwd(), 'skill.yaml');
    
    try {
      const content = await fs.readFile(skillYamlPath, 'utf-8');
      const processedContent = ConfigLoader.replaceEnvVars(content);
      const parsed = yaml.load(processedContent) as any;
      
      if (parsed && parsed.config) {
        // 合并配置，并从环境变量覆盖 AI 配置
        const config = {
          ...DEFAULT_CONFIG,
          ...parsed.config
        };
        
        // 从环境变量覆盖 AI 配置
        if (process.env.AI_API_KEY) {
          config.ai = config.ai || DEFAULT_CONFIG.ai;
          config.ai.cloud = config.ai.cloud || {};
          config.ai.cloud.api_key = process.env.AI_API_KEY;
          config.ai.cloud.enabled = true;
        }
        
        if (process.env.AI_BASE_URL) {
          config.ai = config.ai || DEFAULT_CONFIG.ai;
          config.ai.cloud = config.ai.cloud || {};
          config.ai.cloud.endpoint = process.env.AI_BASE_URL;
        }
        
        if (process.env.AI_MODEL) {
          config.ai = config.ai || DEFAULT_CONFIG.ai;
          config.ai.cloud = config.ai.cloud || {};
          config.ai.cloud.model = process.env.AI_MODEL;
        }
        
        return config;
      }
    } catch (error) {
      console.log('⚠️ 使用默认配置（未找到 skill.yaml）');
    }
    
    return DEFAULT_CONFIG;
  }
  
  private static replaceEnvVars(content: string): string {
    return content.replace(/\$\{([^}]+)\}/g, (match, envVar) => {
      return process.env[envVar] || match;
    });
  }
  
  static async loadFromProject(projectPath: string): Promise<DocMindConfig> {
    // 尝试从项目中加载 .docmindrc 或类似配置文件
    const rcPath = path.join(projectPath, '.docmindrc');
    
    try {
      const content = await fs.readFile(rcPath, 'utf-8');
      const userConfig = yaml.load(content) as DocMindConfig;
      return {
        ...DEFAULT_CONFIG,
        ...userConfig
      };
    } catch {
      return DEFAULT_CONFIG;
    }
  }
}

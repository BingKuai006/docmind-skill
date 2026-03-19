/**
 * 文件类型判断工具
 * 
 * 根据文件扩展名判断文件类型
 */

export const fileTypeMap: Record<string, string> = {
  // 代码文件
  '.ts': 'TypeScript 代码',
  '.tsx': 'TypeScript React 组件',
  '.js': 'JavaScript 代码',
  '.jsx': 'JavaScript React 组件',
  '.py': 'Python 代码',
  '.java': 'Java 代码',
  '.go': 'Go 代码',
  '.rs': 'Rust 代码',
  '.cpp': 'C++ 代码',
  '.c': 'C 代码',
  '.cs': 'C# 代码',
  '.php': 'PHP 代码',
  '.rb': 'Ruby 代码',
  '.swift': 'Swift 代码',
  '.kt': 'Kotlin 代码',
  '.scala': 'Scala 代码',
  '.r': 'R 代码',
  '.m': 'Objective-C 代码',
  
  // 样式文件
  '.css': 'CSS 样式',
  '.scss': 'SCSS 样式',
  '.sass': 'Sass 样式',
  '.less': 'Less 样式',
  '.styl': 'Stylus 样式',
  
  // 配置文件
  '.json': 'JSON 配置',
  '.yaml': 'YAML 配置',
  '.yml': 'YAML 配置',
  '.toml': 'TOML 配置',
  '.ini': 'INI 配置',
  '.conf': '配置文件',
  '.config': '配置文件',
  '.env': '环境变量配置',
  
  // 文档文件
  '.md': 'Markdown 文档',
  '.txt': '文本文件',
  '.doc': 'Word 文档',
  '.docx': 'Word 文档',
  '.pdf': 'PDF 文档',
  '.rst': 'reStructuredText 文档',
  
  // 模板文件
  '.html': 'HTML 模板',
  '.htm': 'HTML 模板',
  '.vue': 'Vue 组件',
  '.svelte': 'Svelte 组件',
  '.hbs': 'Handlebars 模板',
  '.ejs': 'EJS 模板',
  '.pug': 'Pug 模板',
  '.njk': 'Nunjucks 模板',
  
  // 数据文件
  '.sql': 'SQL 数据库脚本',
  '.csv': 'CSV 数据',
  '.xml': 'XML 数据',
  
  // 其他
  '.sh': 'Shell 脚本',
  '.bash': 'Bash 脚本',
  '.zsh': 'Zsh 脚本',
  '.ps1': 'PowerShell 脚本',
  '.bat': '批处理脚本',
  '.cmd': '命令脚本'
};

/**
 * 根据扩展名获取文件类型的中文描述
 */
export function getFileTypeDescription(extension: string): string {
  const ext = extension.toLowerCase();
  return fileTypeMap[ext] || `${ext.replace('.', '').toUpperCase()} 文件`;
}

/**
 * 判断文件是否为代码文件
 */
export function isCodeFile(extension: string): boolean {
  const codeExtensions = [
    '.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.go', '.rs',
    '.cpp', '.c', '.cs', '.php', '.rb', '.swift', '.kt', '.scala'
  ];
  return codeExtensions.includes(extension.toLowerCase());
}

/**
 * 判断文件是否为配置文件
 */
export function isConfigFile(extension: string): boolean {
  const configExtensions = [
    '.json', '.yaml', '.yml', '.toml', '.ini', '.conf', '.config'
  ];
  return configExtensions.includes(extension.toLowerCase());
}

/**
 * 判断文件是否为文档文件
 */
export function isDocFile(extension: string): boolean {
  const docExtensions = ['.md', '.txt', '.doc', '.docx', '.pdf'];
  return docExtensions.includes(extension.toLowerCase());
}

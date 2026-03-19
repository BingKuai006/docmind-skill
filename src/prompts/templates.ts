/**
 * 文件夹说明模板
 * 
 * 这个文件定义了生成文件夹说明文档时使用的模板。
 * 
 * 什么时候会用到：
 * DocGenerator 生成文件夹说明.md 时
 */

export const folderDocTemplate = {
  header: (folderName: string) => `# ${folderName}`,
  
  purpose: (description: string) => `
## 这个文件夹是干什么的？

${description}
`,
  
  contents: (files: string[]) => `
## 里面有什么？

${files.map(f => `- ${f}`).join('\n')}
`,
  
  notes: (notes: string[]) => `
## 相关说明

${notes.map(n => `- ${n}`).join('\n')}
`,
  
  footer: () => `
---
*由 DocMind 自动生成*
`
};

export const projectOverviewTemplate = {
  header: () => `# 项目总览`,
  
  description: (desc: string) => `
## 这个项目是干什么的？

${desc}
`,
  
  structure: (folders: {name: string, purpose: string}[]) => `
## 项目结构

### 主要目录

${folders.map(f => `- **${f.name}/** - ${f.purpose}`).join('\n')}
`,
  
  stats: (folderCount: number, fileCount: number) => `
## 统计信息

- 文件夹数量：${folderCount}
- 文件数量：${fileCount}
`,
  
  footer: () => `
---
*由 DocMind 自动生成*
`
};

export const relationshipDiagramTemplate = {
  header: () => `# 文件关系图`,
  
  folderTree: (tree: string) => `
## 目录结构

\`\`\`mermaid
${tree}
\`\`\`
`,
  
  dependencies: (deps: string) => `
## 文件依赖关系

\`\`\`mermaid
${deps}
\`\`\`
`,
  
  footer: () => `
---
*由 DocMind 自动生成*
`
};

export const codeCommentTemplate = {
  javascript: (fileName: string, purpose: string, functions: string[]) => `/**
 * ${fileName}
 * 
 * ${purpose}
 * 
 * 主要功能：
${functions.map(f => ` * - ${f}`).join('\n')}
 * 
 * 什么时候会用到：
 * - ${purpose.replace('这个文件', '').replace('。', '时')}
 */`,

  python: (fileName: string, purpose: string, functions: string[]) => `"""${fileName}

${purpose}

主要功能：
${functions.map(f => `- ${f}`).join('\n')}

什么时候会用到：
- ${purpose.replace('这个文件', '').replace('。', '时')}
"""`,

  java: (fileName: string, purpose: string, functions: string[]) => `/**
 * ${fileName}
 * 
 * ${purpose}
 * 
 * 主要方法：
${functions.map(f => ` * - ${f}`).join('\n')}
 * 
 * @author DocMind
 */`
};

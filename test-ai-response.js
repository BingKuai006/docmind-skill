require('dotenv').config({ path: '../../.env' });

const { createAnthropic } = require('@ai-sdk/anthropic');
const { generateText } = require('ai');

async function test() {
  console.log('Testing AI...');
  
  const anthropic = createAnthropic({
    apiKey: process.env.AI_API_KEY,
    baseURL: process.env.AI_BASE_URL
  });
  
  try {
    const { text } = await generateText({
      model: anthropic(process.env.AI_MODEL || 'qwen3.5-plus'),
      messages: [{
        role: 'user',
        content: `分析这个 Python 文件：

文件：check_deps.py
内容：
\`\`\`
import sys

def check_dependencies():
    print("Checking dependencies...")
\`\`\`

请用 JSON 格式回答：
{
  "purpose": "文件用途",
  "functions": [{"name": "函数名", "description": "描述"}],
  "description": "详细说明"
}`
      }]
    });
    
    console.log('AI Response:');
    console.log(text);
  } catch (error) {
    console.error('Error:', error);
  }
}

test();

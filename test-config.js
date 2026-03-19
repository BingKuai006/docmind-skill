const path = require('path');

// 手动加载 dotenv
require('dotenv').config();

console.log('环境变量检查:');
console.log('AI_API_KEY:', process.env.AI_API_KEY ? '已设置' : '未设置');
console.log('AI_BASE_URL:', process.env.AI_BASE_URL);

// 加载 ConfigLoader
const { ConfigLoader } = require('./dist/utils/config-loader');

ConfigLoader.load().then(config => {
  console.log('\n配置检查:');
  console.log('ai.enabled:', config.ai?.enabled);
  console.log('ai.cloud.enabled:', config.ai?.cloud?.enabled);
  console.log('ai.cloud.api_key:', config.ai?.cloud?.api_key ? '已设置' : '未设置');
  console.log('ai.cloud.endpoint:', config.ai?.cloud?.endpoint);
});

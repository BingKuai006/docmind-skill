require('dotenv').config();

const { ConfigLoader } = require('./dist/utils/config-loader');

console.log('Environment variables:');
console.log('DASHSCOPE_API_KEY:', process.env.DASHSCOPE_API_KEY);
console.log('DASHSCOPE_ENDPOINT:', process.env.DASHSCOPE_ENDPOINT);

ConfigLoader.load().then(config => {
  console.log('\nLoaded config:');
  console.log('AI Enabled:', config.ai?.enabled);
  console.log('AI Mode:', config.ai?.mode);
  console.log('Cloud API Key:', config.ai?.cloud?.api_key);
  console.log('Cloud Endpoint:', config.ai?.cloud?.endpoint);
});

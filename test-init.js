require('dotenv').config();

const { ConfigLoader } = require('./dist/utils/config-loader');
const { FileAnalyzer } = require('./dist/analyzer/file-analyzer');

async function test() {
  console.log('1. Loading config...');
  const config = await ConfigLoader.load();
  
  console.log('2. Config loaded:');
  console.log('   ai.enabled:', config.ai?.enabled);
  console.log('   ai.mode:', config.ai?.mode);
  console.log('   ai.cloud.api_key:', config.ai?.cloud?.api_key);
  console.log('   ai.cloud.endpoint:', config.ai?.cloud?.endpoint);
  
  console.log('\n3. Creating FileAnalyzer...');
  const analyzer = new FileAnalyzer(config);
  
  console.log('\n4. FileAnalyzer created successfully');
}

test().catch(console.error);

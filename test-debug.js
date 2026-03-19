require('dotenv').config();

console.log('1. Environment variables loaded:');
console.log('   DASHSCOPE_API_KEY:', process.env.DASHSCOPE_API_KEY);
console.log('   DASHSCOPE_ENDPOINT:', process.env.DASHSCOPE_ENDPOINT);

const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

const skillYamlPath = path.join(__dirname, 'skill.yaml');
const content = fs.readFileSync(skillYamlPath, 'utf-8');

console.log('\n2. skill.yaml content (first 500 chars):');
console.log(content.substring(0, 500));

const processedContent = content.replace(/\$\{([^}]+)\}/g, (match, envVar) => {
  console.log(`   Replacing ${match} with:`, process.env[envVar] || match);
  return process.env[envVar] || match;
});

console.log('\n3. Processed content (first 500 chars):');
console.log(processedContent.substring(0, 500));

const parsed = yaml.load(processedContent);
console.log('\n4. Parsed config:');
console.log('   ai.cloud.api_key:', parsed.config.ai.cloud.api_key);
console.log('   ai.cloud.endpoint:', parsed.config.ai.cloud.endpoint);

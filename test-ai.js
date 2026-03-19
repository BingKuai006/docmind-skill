require('dotenv').config();

const { ConfigLoader } = require('./dist/utils/config-loader');
const { FileAnalyzer } = require('./dist/analyzer/file-analyzer');

async function test() {
  const config = await ConfigLoader.load();
  console.log('Config loaded:', {
    enabled: config.ai?.enabled,
    mode: config.ai?.mode,
    api_key: config.ai?.cloud?.api_key?.substring(0, 20) + '...',
    endpoint: config.ai?.cloud?.endpoint
  });
  
  const analyzer = new FileAnalyzer(config);
  console.log('Analyzer created');
  
  // Test with a simple file
  const fs = require('fs');
  const path = require('path');
  
  const testFile = path.join(__dirname, 'examples', 'JDcapture', 'check_deps.py');
  if (fs.existsSync(testFile)) {
    console.log('Testing with:', testFile);
    const content = fs.readFileSync(testFile, 'utf-8');
    console.log('File content length:', content.length);
  }
}

test().catch(console.error);

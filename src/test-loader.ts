import * as dotenv from 'dotenv';
dotenv.config();

import { ConfigLoader } from './utils/config-loader';

async function test() {
  console.log('Testing ConfigLoader...');
  console.log('process.env.DASHSCOPE_ENDPOINT:', process.env.DASHSCOPE_ENDPOINT);
  
  const config = await ConfigLoader.load();
  console.log('Loaded endpoint:', config.ai?.cloud?.endpoint);
}

test();

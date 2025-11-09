#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const whisperCppPath = path.join(__dirname, '..', 'lib', 'whisper.cpp');

console.log('[whisper-node] Post-install: Checking whisper.cpp submodule...');

try {
  // Check if whisper.cpp directory exists and is not empty
  if (!fs.existsSync(whisperCppPath)) {
    console.log('[whisper-node] Creating lib directory...');
    fs.mkdirSync(whisperCppPath, { recursive: true });
  }
  
  const files = fs.readdirSync(whisperCppPath).filter(f => f !== '.gitkeep');
  
  if (files.length === 0) {
    console.log('[whisper-node] Cloning whisper.cpp from ggml-org...');
    console.log('[whisper-node] This may take a minute...');
    
    execSync(
      'git clone --depth=1 https://github.com/ggml-org/whisper.cpp lib/whisper.cpp',
      {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit'
      }
    );
    
    console.log('[whisper-node] ✓ whisper.cpp cloned successfully');
  } else {
    console.log('[whisper-node] ✓ whisper.cpp already exists');
  }
  
  console.log('[whisper-node] ✓ whisper.cpp repository ready\n');
  
  // Installation complete - user needs to build manually
  console.log('[whisper-node] ⚠️  Installation complete! But you need to build the package:');
  console.log('[whisper-node]');
  console.log('[whisper-node] Please run the following in node_modules/whisper-node:');
  console.log('[whisper-node]   1. npm run build    (Compile TypeScript + whisper.cpp)');
  console.log('[whisper-node]   or separately:');
  console.log('[whisper-node]   - npx tsc          (Compile TypeScript only)');
  console.log('[whisper-node]   - cd lib/whisper.cpp && make  (Compile whisper.cpp only)');
  console.log('[whisper-node]');
  
} catch (error) {
  console.error('[whisper-node] Failed to clone whisper.cpp:', error.message);
  console.error('[whisper-node] You can manually clone it with:');
  console.error('[whisper-node]   git clone https://github.com/ggml-org/whisper.cpp lib/whisper.cpp');
  process.exit(1);
}
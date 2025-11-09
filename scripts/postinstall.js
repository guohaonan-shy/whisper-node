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
  
  console.log('[whisper-node] ✓ whisper.cpp repository ready');
  
  // Now compile whisper.cpp
  console.log('\n[whisper-node] Compiling whisper.cpp...');
  const buildScript = path.join(__dirname, 'build-whisper.js');
  
  try {
    execSync(`node "${buildScript}"`, {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });
  } catch (buildError) {
    console.error('\n[whisper-node] Warning: Failed to compile whisper.cpp automatically');
    console.error('[whisper-node] You can manually compile it with:');
    console.error('[whisper-node]   npm run build');
    console.error('[whisper-node]   or: cd lib/whisper.cpp && make\n');
    // Don't exit with error, let user compile manually if needed
  }
  
} catch (error) {
  console.error('[whisper-node] Failed to clone whisper.cpp:', error.message);
  console.error('[whisper-node] You can manually clone it with:');
  console.error('[whisper-node]   git clone https://github.com/ggml-org/whisper.cpp lib/whisper.cpp');
  process.exit(1);
}
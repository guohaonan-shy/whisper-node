#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('[whisper-node] Running prepare script...');

try {
  // Build TypeScript
  console.log('[whisper-node] Building TypeScript...');
  execSync('tsc', { stdio: 'inherit' });
  
  // Build whisper.cpp
  console.log('[whisper-node] Building whisper.cpp...');
  execSync('node scripts/build-whisper.js', { stdio: 'inherit' });
  
  console.log('[whisper-node] ✓ Prepare complete!');
} catch (error) {
  console.error('[whisper-node] Prepare failed:', error.message);
  process.exit(1);
}
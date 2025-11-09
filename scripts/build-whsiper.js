#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const whisperCppPath = path.join(__dirname, '..', 'lib', 'whisper.cpp');
const mainPath = path.join(whisperCppPath, 'main');

console.log('[whisper-node] Building whisper.cpp...');

// Check if whisper.cpp exists
if (!fs.existsSync(whisperCppPath)) {
  console.error('[whisper-node] Error: lib/whisper.cpp not found!');
  console.error('[whisper-node] Please run "npm install" first.');
  process.exit(1);
}

// Check if already built
const whisperCli = path.join(whisperCppPath, 'build', 'bin', 'whisper-cli');
const oldMain = path.join(whisperCppPath, 'build', 'bin', 'main');

if ((fs.existsSync(whisperCli) || fs.existsSync(oldMain)) && fs.existsSync(mainPath)) {
  console.log('[whisper-node] ✓ whisper.cpp already built');
  process.exit(0);
}

// Compile
try {
  console.log('[whisper-node] Compiling whisper.cpp...');
  console.log('[whisper-node] This may take 2-5 minutes...');
  
  const cpuCount = os.cpus().length;
  const jobs = Math.max(2, Math.floor(cpuCount * 0.75));
  
  execSync(`make -j${jobs}`, {
    cwd: whisperCppPath,
    stdio: 'inherit'
  });
  
  console.log('[whisper-node] ✓ Compilation successful');
  
  // Create symlink
  if (fs.existsSync(mainPath) && fs.lstatSync(mainPath).isSymbolicLink()) {
    fs.unlinkSync(mainPath);
  }
  
  if (!fs.existsSync(mainPath)) {
    const target = fs.existsSync(whisperCli) ? 'build/bin/whisper-cli' : 'build/bin/main';
    fs.symlinkSync(target, mainPath);
    console.log(`[whisper-node] ✓ Created symlink: main -> ${target}`);
  }
  
  console.log('[whisper-node] Build complete!');
  
} catch (error) {
  console.error('[whisper-node] Build failed:', error.message);
  console.error('[whisper-node] Try manually: cd lib/whisper.cpp && make');
  process.exit(1);
}
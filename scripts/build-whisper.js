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
  console.error('[whisper-node] Error: whisper.cpp directory not found!');
  console.error('[whisper-node] Please run "npm install" first to clone the submodule.');
  process.exit(1);
}

const whisperFiles = fs.readdirSync(whisperCppPath).filter(f => f !== '.git' && f !== '.gitkeep');
if (whisperFiles.length === 0) {
  console.error('[whisper-node] Error: whisper.cpp directory is empty!');
  console.error('[whisper-node] Please run "npm install" first to clone the submodule.');
  process.exit(1);
}

// Check if already compiled
const whisperCliPath = path.join(whisperCppPath, 'build', 'bin', 'whisper-cli');
const oldMainPath = path.join(whisperCppPath, 'build', 'bin', 'main');

if (fs.existsSync(whisperCliPath) || fs.existsSync(oldMainPath)) {
  console.log('[whisper-node] whisper.cpp is already compiled');
  
  // Create symlink if needed
  createSymlink();
  
  console.log('[whisper-node] Build complete! ✓');
  process.exit(0);
}

// Check if make command exists
try {
  execSync('which make || where make', { 
    encoding: 'utf-8',
    stdio: 'ignore'
  });
} catch (error) {
  console.error('\n[whisper-node] ERROR: "make" command not found!');
  console.error('[whisper-node] Please install build tools:');
  console.error('[whisper-node]   - macOS: xcode-select --install');
  console.error('[whisper-node]   - Linux: sudo apt-get install build-essential');
  console.error('[whisper-node]   - Windows: https://gnuwin32.sourceforge.net/packages/make.htm');
  process.exit(1);
}

// Compile whisper.cpp
try {
  console.log('[whisper-node] Compiling whisper.cpp (this may take 2-5 minutes)...');
  
  // Determine number of parallel jobs
  const cpuCount = os.cpus().length;
  const jobs = Math.max(1, Math.floor(cpuCount * 0.75));
  
  console.log(`[whisper-node] Using ${jobs} parallel jobs...`);
  
  execSync(`make -j${jobs}`, {
    cwd: whisperCppPath,
    stdio: 'inherit'
  });
  
  console.log('[whisper-node] ✓ whisper.cpp compiled successfully');
  
  // Create symlink
  createSymlink();
  
  console.log('[whisper-node] Build complete! ✓');
  
} catch (error) {
  console.error('[whisper-node] Compilation failed:', error.message);
  console.error('[whisper-node] Please try running manually:');
  console.error(`[whisper-node]   cd ${whisperCppPath} && make`);
  process.exit(1);
}

function createSymlink() {
  try {
    // Remove old symlink if exists
    if (fs.existsSync(mainPath)) {
      const stats = fs.lstatSync(mainPath);
      if (stats.isSymbolicLink() || stats.isFile()) {
        fs.unlinkSync(mainPath);
        console.log('[whisper-node] Removed old main file/symlink');
      } else {
        console.log('[whisper-node] main executable already exists');
        return;
      }
    }
    
    // Prefer whisper-cli over deprecated main
    const whisperCliPath = path.join(whisperCppPath, 'build', 'bin', 'whisper-cli');
    const oldMainPath = path.join(whisperCppPath, 'build', 'bin', 'main');
    
    let targetPath = null;
    let targetRelPath = null;
    
    if (fs.existsSync(whisperCliPath)) {
      targetPath = whisperCliPath;
      targetRelPath = 'build/bin/whisper-cli';
    } else if (fs.existsSync(oldMainPath)) {
      targetPath = oldMainPath;
      targetRelPath = 'build/bin/main';
    } else {
      console.warn('[whisper-node] Warning: Could not find whisper executable');
      return;
    }
    
    // Try to create symlink first (Unix/macOS), fallback to copy on Windows
    const isWindows = process.platform === 'win32';
    
    try {
      if (!isWindows) {
        fs.symlinkSync(targetRelPath, mainPath);
        console.log(`[whisper-node] ✓ Created symlink: main -> ${targetRelPath}`);
      } else {
        // On Windows, copy the file instead of creating symlink
        fs.copyFileSync(targetPath, mainPath);
        console.log(`[whisper-node] ✓ Copied: ${targetRelPath} -> main`);
      }
    } catch (symlinkError) {
      // Fallback to copy if symlink fails
      console.log('[whisper-node] Symlink failed, copying file instead...');
      fs.copyFileSync(targetPath, mainPath);
      console.log(`[whisper-node] ✓ Copied: ${targetRelPath} -> main`);
    }
    
  } catch (error) {
    console.warn('[whisper-node] Warning: Could not create main executable:', error.message);
    console.warn('[whisper-node] You may need to manually copy the whisper-cli binary');
  }
}
#!/usr/bin/env node

/**
 * Enhanced build script with detailed logging
 */

import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';

const projectRoot = process.cwd();
const distDir = join(projectRoot, 'dist');

console.log('🚀 Starting Orchestrator MCP Server build process...');
console.log(`📁 Project root: ${projectRoot}`);
console.log(`📦 Output directory: ${distDir}`);

try {
  // Clean existing dist directory
  if (existsSync(distDir)) {
    console.log('🧹 Cleaning existing dist directory...');
    rmSync(distDir, { recursive: true, force: true });
    console.log('✅ Dist directory cleaned');
  }

  // Run TypeScript compilation
  console.log('🔨 Starting TypeScript compilation...');
  console.log('⏳ This may take a moment...');
  
  const startTime = Date.now();
  
  execSync('npx tsc', { 
    stdio: 'inherit',
    cwd: projectRoot 
  });
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log(`✅ TypeScript compilation completed in ${duration}s`);
  
  // Verify output
  if (existsSync(distDir)) {
    console.log('✅ Dist directory created successfully');
    
    // Check for main entry point
    const mainFile = join(distDir, 'index.js');
    if (existsSync(mainFile)) {
      console.log('✅ Main entry point (index.js) generated');
    } else {
      console.log('⚠️  Warning: Main entry point not found');
    }
  } else {
    console.log('❌ Error: Dist directory not created');
    process.exit(1);
  }
  
  console.log('🎉 Build process completed successfully!');
  console.log('💡 You can now run: npm start');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

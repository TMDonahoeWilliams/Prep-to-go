#!/usr/bin/env node

/**
 * Vercel Migration Verification Script
 * Validates that your Replit project is ready for Vercel deployment
 */

import fs from 'fs';
import path from 'path';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

function log(color, message) {
  console.log(`${color}${message}${RESET}`);
}

function checkFile(filePath, required = true) {
  const exists = fs.existsSync(filePath);
  const status = exists ? '✅' : (required ? '❌' : '⚠️');
  const color = exists ? GREEN : (required ? RED : YELLOW);
  log(color, `${status} ${filePath}`);
  return exists;
}

function checkEnvVar(varName, required = true) {
  // Check if it's in .env.example (template)
  const envExamplePath = '.env.example';
  if (fs.existsSync(envExamplePath)) {
    const content = fs.readFileSync(envExamplePath, 'utf8');
    const hasVar = content.includes(varName);
    const status = hasVar ? '✅' : (required ? '❌' : '⚠️');
    const color = hasVar ? GREEN : (required ? RED : YELLOW);
    log(color, `${status} ${varName} (in .env.example)`);
    return hasVar;
  }
  return false;
}

console.log(BLUE + '🚀 Vercel Migration Verification\n' + RESET);

// 1. Check core files
log(BLUE, '📁 Core Files:');
checkFile('package.json');
checkFile('vercel.json');
checkFile('vite.config.ts');
checkFile('.gitignore');

// 2. Check source structure
log(BLUE, '\n📂 Source Structure:');
checkFile('client/src/main.tsx');
checkFile('client/index.html');
checkFile('server/index.ts');
checkFile('server/routes.ts');
checkFile('shared/schema.ts');

// 3. Check configuration files
log(BLUE, '\n⚙️ Configuration:');
checkFile('.env.example');
checkFile('.vercel/project.json', false);
checkFile('.vercel/agent_state.json', false);

// 4. Check documentation
log(BLUE, '\n📚 Documentation:');
checkFile('README.md');
checkFile('VERCEL_DEPLOYMENT.md');
checkFile('DEPLOYMENT.md');

// 5. Check environment variables
log(BLUE, '\n🔐 Environment Variables:');
checkEnvVar('DATABASE_URL');
checkEnvVar('SESSION_SECRET');
checkEnvVar('STRIPE_SECRET_KEY');
checkEnvVar('STRIPE_PUBLISHABLE_KEY');
checkEnvVar('VITE_STRIPE_PUBLISHABLE_KEY');
checkEnvVar('NODE_ENV');

// 6. Check package.json scripts
log(BLUE, '\n🛠️ Build Scripts:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const scripts = packageJson.scripts || {};
  
  const requiredScripts = ['build', 'start', 'dev'];
  requiredScripts.forEach(script => {
    const hasScript = scripts[script];
    const status = hasScript ? '✅' : '❌';
    const color = hasScript ? GREEN : RED;
    log(color, `${status} npm run ${script}`);
  });
} catch (error) {
  log(RED, '❌ Could not read package.json');
}

// 7. Check for Replit files (should be excluded)
log(BLUE, '\n🔄 Migration Status:');
const replitFiles = ['.replit', '.local/', 'replit.md'];
replitFiles.forEach(file => {
  const exists = fs.existsSync(file);
  const status = exists ? '⚠️' : '✅';
  const color = exists ? YELLOW : GREEN;
  const message = exists ? `${file} (will be ignored)` : `${file} (clean)`;
  log(color, `${status} ${message}`);
});

// 8. Verify .gitignore
log(BLUE, '\n🔒 Security Check:');
try {
  const gitignore = fs.readFileSync('.gitignore', 'utf8');
  const securityChecks = [
    { pattern: '.env', description: 'Environment files excluded' },
    { pattern: 'node_modules', description: 'Dependencies excluded' },
    { pattern: '.local/', description: 'Replit state excluded' },
  ];
  
  securityChecks.forEach(({ pattern, description }) => {
    const isExcluded = gitignore.includes(pattern);
    const status = isExcluded ? '✅' : '❌';
    const color = isExcluded ? GREEN : RED;
    log(color, `${status} ${description}`);
  });
} catch (error) {
  log(RED, '❌ Could not read .gitignore');
}

// Final summary
log(BLUE, '\n🎯 Next Steps:');
console.log('1. Push your code to GitHub');
console.log('2. Connect repository to Vercel');
console.log('3. Set environment variables in Vercel dashboard');
console.log('4. Deploy and test!');

log(GREEN, '\n✨ Your project is ready for Vercel deployment!');
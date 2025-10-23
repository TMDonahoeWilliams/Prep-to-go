#!/usr/bin/env node

// Generate a secure session secret for production
import crypto from 'crypto';

const sessionSecret = crypto.randomBytes(32).toString('hex');

console.log('='.repeat(60));
console.log('🔐 PRODUCTION SESSION SECRET');
console.log('='.repeat(60));
console.log();
console.log('Copy this value to your production environment:');
console.log();
console.log(`SESSION_SECRET=${sessionSecret}`);
console.log();
console.log('⚠️  IMPORTANT: Keep this secret secure!');
console.log('   - Never commit this to version control');
console.log('   - Store it securely in your hosting platform');
console.log('   - Use different secrets for different environments');
console.log();
console.log('='.repeat(60));
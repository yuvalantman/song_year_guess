#!/usr/bin/env node

/**
 * Setup validation script
 * Checks if all prerequisites are configured correctly
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const checks = {
  passed: [],
  failed: [],
  warnings: [],
}

console.log('🔍 Checking Spotify Guess the Song setup...\n')

// Check Node version
const nodeVersion = process.versions.node.split('.')[0]
if (parseInt(nodeVersion) >= 18) {
  checks.passed.push(`✓ Node.js v${process.versions.node} (required: 18+)`)
} else {
  checks.failed.push(`✗ Node.js ${process.versions.node} is too old (required: 18+)`)
}

// Check if node_modules exists
if (fs.existsSync(path.join(__dirname, 'node_modules'))) {
  checks.passed.push('✓ node_modules found (dependencies installed)')
} else {
  checks.failed.push('✗ node_modules not found - run: npm install')
}

// Check if .env or .env.local exists
const envExists = fs.existsSync(path.join(__dirname, '.env.local')) ||
                  fs.existsSync(path.join(__dirname, '.env'))
if (envExists) {
  const envFile = fs.existsSync(path.join(__dirname, '.env.local')) ? '.env.local' : '.env'
  checks.passed.push(`✓ Environment file found (${envFile})`)

  // Check if Client ID is set
  const envPath = path.join(__dirname, fs.existsSync(path.join(__dirname, '.env.local')) ? '.env.local' : '.env')
  const envContent = fs.readFileSync(envPath, 'utf-8')

  if (envContent.includes('VITE_SPOTIFY_CLIENT_ID=your_client_id_here') ||
      !envContent.includes('VITE_SPOTIFY_CLIENT_ID=')) {
    checks.warnings.push('⚠️  VITE_SPOTIFY_CLIENT_ID not configured - see QUICKSTART.md')
  } else if (envContent.match(/VITE_SPOTIFY_CLIENT_ID=[a-zA-Z0-9]+/)) {
    checks.passed.push('✓ VITE_SPOTIFY_CLIENT_ID is set')
  }

  // Check if Redirect URI is set
  if (envContent.includes('VITE_SPOTIFY_REDIRECT_URI=http://localhost:3000/callback') ||
      envContent.includes('VITE_SPOTIFY_REDIRECT_URI=https://')) {
    checks.passed.push('✓ VITE_SPOTIFY_REDIRECT_URI is configured')
  } else {
    checks.warnings.push('⚠️  VITE_SPOTIFY_REDIRECT_URI may not be set correctly')
  }
} else {
  checks.warnings.push('⚠️  No .env or .env.local file found - create one from .env.example')
}

// Check if required files exist
const requiredFiles = [
  'src/App.tsx',
  'src/main.tsx',
  'src/pages/SettingsPage.tsx',
  'src/pages/GamePage.tsx',
  'src/services/spotifyAuth.ts',
  'src/services/spotifyPlayer.ts',
  'src/services/spotifyAPI.ts',
  'index.html',
]

requiredFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    checks.passed.push(`✓ ${file}`)
  } else {
    checks.failed.push(`✗ Missing: ${file}`)
  }
})

// Print results
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('\n📋 SETUP STATUS:\n')
checks.passed.forEach(msg => console.log(`  ${msg}`))

if (checks.warnings.length > 0) {
  console.log('\n⚠️  WARNINGS:\n')
  checks.warnings.forEach(msg => console.log(`  ${msg}`))
}

if (checks.failed.length > 0) {
  console.log('\n❌ ISSUES:\n')
  checks.failed.forEach(msg => console.log(`  ${msg}`))
  console.log('\n📖 See QUICKSTART.md for setup instructions\n')
  process.exit(1)
} else {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n✅ Setup looks good!\n')
}

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting APK build process...');

// Step 1: Export the app
console.log('Step 1: Exporting the app...');
execSync('npx expo export', { stdio: 'inherit' });

// Step 2: Create android folder if it doesn't exist
const androidFolder = path.join(__dirname, 'android');
if (!fs.existsSync(androidFolder)) {
  console.log('Step 2: Generating Android project...');
  execSync('npx expo prebuild --platform android --clean', { stdio: 'inherit' });
} else {
  console.log('Step 2: Android project already exists.');
}

// Step 3: Build the APK
console.log('Step 3: Building the APK...');
try {
  process.chdir(androidFolder);
  console.log('Changed directory to:', process.cwd());
  
  // Clean previous builds
  execSync('.\\gradlew clean', { stdio: 'inherit' });
  
  // Build debug APK
  execSync('.\\gradlew assembleDebug', { stdio: 'inherit' });
  
  // Locate the APK
  const apkPath = path.join(androidFolder, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
  if (fs.existsSync(apkPath)) {
    console.log('✅ APK successfully built!');
    console.log('APK location:', apkPath);
  } else {
    console.log('❌ APK not found at expected location:', apkPath);
  }
} catch (error) {
  console.error('Error building APK:', error.message);
} 
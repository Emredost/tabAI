const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// Banner
console.log(`${colors.cyan}${colors.bright}
╔════════════════════════════════════════════════╗
║                                                ║
║         TabAI Deployment Script                ║
║                                                ║
║        SafeAI Solutions by Emre Dost           ║
║                                                ║
╚════════════════════════════════════════════════╝
${colors.reset}`);

// Check if we have electron-builder installed
try {
  execSync('npx electron-builder --version', { stdio: 'ignore' });
  console.log(`${colors.green}✓ electron-builder is installed${colors.reset}`);
} catch (error) {
  console.log(`${colors.red}✗ electron-builder is not installed${colors.reset}`);
  console.log(`${colors.yellow}Installing electron-builder...${colors.reset}`);
  try {
    execSync('npm install --save-dev electron-builder', { stdio: 'inherit' });
    console.log(`${colors.green}✓ electron-builder installed successfully${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Failed to install electron-builder. Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Ensure package.json has build configuration
const packageJsonPath = path.join(__dirname, 'package.json');
let packageJson;

try {
  packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  console.log(`${colors.green}✓ package.json found${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Failed to read package.json. Error: ${error.message}${colors.reset}`);
  process.exit(1);
}

// Check for electron-builder.yml
const configPath = path.join(__dirname, 'electron-builder.yml');
if (!fs.existsSync(configPath)) {
  console.error(`${colors.red}✗ electron-builder.yml not found${colors.reset}`);
  process.exit(1);
} else {
  console.log(`${colors.green}✓ electron-builder.yml found${colors.reset}`);
}

// Check if logo exists and prepare icons
const logoPath = path.join(__dirname, 'logo.png');
const buildIconsPath = path.join(__dirname, 'build', 'icons');

if (!fs.existsSync(logoPath)) {
  console.log(`${colors.yellow}⚠ logo.png not found. The app will be built without a custom icon.${colors.reset}`);
} else {
  console.log(`${colors.green}✓ logo.png found${colors.reset}`);
  
  // Ensure build/icons directory exists
  if (!fs.existsSync(buildIconsPath)) {
    try {
      fs.mkdirSync(buildIconsPath, { recursive: true });
      console.log(`${colors.green}✓ Created build/icons directory${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}Failed to create build/icons directory. Error: ${error.message}${colors.reset}`);
      process.exit(1);
    }
  }
  
  // Copy logo.png to build/icons/512x512.png
  try {
    fs.copyFileSync(logoPath, path.join(buildIconsPath, '512x512.png'));
    console.log(`${colors.green}✓ Copied logo to build/icons/512x512.png${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Failed to copy logo. Error: ${error.message}${colors.reset}`);
  }
  
  // Generate platform-specific icons
  console.log(`${colors.yellow}Note: For production builds, you should convert logo.png to platform-specific formats:${colors.reset}`);
  console.log(`  - Windows: build/icons/icon.ico`);
  console.log(`  - macOS: build/icons/icon.icns`);
  console.log(`  - Linux: build/icons/16x16.png, 32x32.png, 48x48.png, 64x64.png, 128x128.png, 256x256.png, 512x512.png`);
}

// Determine platform
const platform = os.platform();
let buildCommand;

switch (platform) {
  case 'win32':
    buildCommand = 'npm run build:win';
    break;
  case 'darwin':
    buildCommand = 'npm run build:mac';
    break;
  case 'linux':
    buildCommand = 'npm run build:linux';
    break;
  default:
    buildCommand = 'npm run build';
}

// Final confirmation
console.log(`${colors.yellow}${colors.bright}
Ready to build TabAI for ${platform}
${colors.reset}`);

console.log(`${colors.cyan}Building TabAI...${colors.reset}`);

try {
  execSync(buildCommand, { stdio: 'inherit' });
  console.log(`${colors.green}${colors.bright}
╔════════════════════════════════════════════════╗
║                                                ║
║         TabAI Built Successfully!              ║
║                                                ║
║      Check the /dist directory for the         ║
║      installable application package.          ║
║                                                ║
╚════════════════════════════════════════════════╝
${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Failed to build TabAI. Error: ${error.message}${colors.reset}`);
  process.exit(1);
} 
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

// Check if logo exists
const logoPath = path.join(__dirname, 'logo.png');
if (!fs.existsSync(logoPath)) {
  console.log(`${colors.yellow}⚠ logo.png not found. The app will be built without a custom icon.${colors.reset}`);
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
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
║         TabAI Simple Windows Build             ║
║                                                ║
║        SafeAI Solutions by Emre Dost           ║
║                                                ║
╚════════════════════════════════════════════════╝
${colors.reset}`);

// Create dist folder if it doesn't exist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Create temp folder for app packaging
const tempDir = path.join(__dirname, 'temp_build');
if (fs.existsSync(tempDir)) {
  // Delete temp dir if it exists
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch (err) {
    console.error(`${colors.red}Failed to clean temp directory:${colors.reset}`, err);
  }
}
fs.mkdirSync(tempDir, { recursive: true });

console.log(`${colors.yellow}Building TabAI for Windows...${colors.reset}`);

try {
  // 1. Copy all necessary app files
  console.log(`${colors.yellow}Copying application files...${colors.reset}`);
  
  // Copy main files
  const filesToCopy = [
    'main.js',
    'renderer.js',
    'preload.js',
    'index.html',
    'styles.css',
    'logo.png',
    'package.json'
  ];
  
  for (const file of filesToCopy) {
    if (fs.existsSync(path.join(__dirname, file))) {
      fs.copyFileSync(path.join(__dirname, file), path.join(tempDir, file));
      console.log(`${colors.green}✓ Copied ${file}${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⚠ File not found: ${file}${colors.reset}`);
      
      // If index.html is missing, create a basic one
      if (file === 'index.html') {
        const basicHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TabAI - Multiple AI Assistants</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body data-app-init="pending">
  <div class="app-container">
    <!-- Header with app info -->
    <header class="app-header">
      <div class="logo">
        <h1>TabAI</h1>
      </div>
      <div class="header-controls">
        <button id="minimize-btn" class="window-control" title="Minimize">−</button>
        <button id="maximize-btn" class="window-control" title="Maximize">◻</button>
        <button id="close-btn" class="window-control close" title="Close">✕</button>
      </div>
    </header>

    <!-- Tab Bar -->
    <div class="tab-bar" id="tab-bar">
      <div class="tabs" id="tabs">
        <!-- Tabs will be added here -->
      </div>
      <button class="new-tab-button" id="add-tab-button" title="New Tab or Search">+</button>
    </div>
    
    <!-- Navigation Bar (visible only when an AI tab is active) -->
    <div class="nav-bar" id="nav-bar">
      <div class="nav-controls">
        <button id="back-btn" class="nav-btn" title="Go Back">←</button>
        <button id="forward-btn" class="nav-btn" title="Go Forward">→</button>
        <button id="refresh-btn" class="nav-btn" title="Refresh">↻</button>
      </div>
      <div class="tab-selector">
        <select id="quick-tab-switcher">
          <!-- Options will be populated dynamically -->
        </select>
      </div>
    </div>

    <!-- Tab Content Area -->
    <div class="tab-content" id="tab-content">
      <!-- Home Tab - Initial View -->
      <div class="tab-pane active" data-id="home">
        <div class="home-container">
          <div class="home-hero">
            <div class="app-logo">
              <span class="logo-icon">🧠</span>
              <h1 class="logo-text">TabAI</h1>
            </div>
            <p class="tagline">Your AI Assistant Command Center</p>
            
            <div class="ai-quick-launch">
              <div class="launch-button-row" id="quick-launch-buttons">
                <!-- Quick launch buttons will be added here -->
              </div>
            </div>
          </div>
          
          <!-- Hidden data container - not visible to user -->
          <div id="assistants-container" style="display:none; position:absolute; visibility:hidden;"></div>
          
          <footer class="home-footer">
            <div class="branding">
              <p>TabAI</p>
              <p class="copyright">© 2025</p>
          </div>
          </footer>
        </div>
      </div>

      <!-- Other tab panes will be added dynamically -->
    </div>

    <!-- Status Bar -->
    <footer class="status-bar">
      <span id="status-message">Ready</span>
      <span id="tab-count">1 Tab</span>
    </footer>
  </div>

  <script src="renderer.js"></script>
</body>
</html>`;
        
        fs.writeFileSync(path.join(tempDir, file), basicHtml);
        console.log(`${colors.green}✓ Created basic ${file}${colors.reset}`);
      }
    }
  }
  
  // Create resources directory
  const resourcesDir = path.join(tempDir, 'resources');
  fs.mkdirSync(resourcesDir, { recursive: true });
  
  // Create a modified package.json for the build
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  
  // Remove development dependencies and scripts
  delete packageJson.devDependencies;
  delete packageJson.scripts;
  delete packageJson.build;
  
  // Make sure electron is not a direct dependency
  if (packageJson.dependencies && packageJson.dependencies.electron) {
    delete packageJson.dependencies.electron;
  }
  
  // Save the simplified package.json
  fs.writeFileSync(
    path.join(tempDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  
  // Create an installer batch file
  const installerContent = `@echo off
echo Installing TabAI...
mkdir "%USERPROFILE%\\AppData\\Local\\Programs\\TabAI" 2>nul
xcopy /E /I /Y "%~dp0*.*" "%USERPROFILE%\\AppData\\Local\\Programs\\TabAI\\"
echo Creating shortcut...
powershell "$s=(New-Object -COM WScript.Shell).CreateShortcut('%USERPROFILE%\\Desktop\\TabAI.lnk');$s.TargetPath='%USERPROFILE%\\AppData\\Local\\Programs\\TabAI\\TabAI.exe';$s.Save()"
echo TabAI has been installed!
pause
`;
  
  fs.writeFileSync(path.join(tempDir, 'install.bat'), installerContent);
  
  // Create an executable batch file
  const exeContent = `@echo off
start electron .
`;
  
  fs.writeFileSync(path.join(tempDir, 'TabAI.bat'), exeContent);
  
  // Create a README.txt
  const readmeContent = `TabAI - Multiple AI Assistants

INSTALLATION
-----------------------
1. Run install.bat to install TabAI to your local app folder
2. A shortcut will be created on your desktop

MANUAL RUNNING
-----------------------
If you have Node.js and Electron installed, you can run:
- npm install
- npm start

REQUIREMENTS
-----------------------
- Node.js 16 or later
- Electron

Copyright © 2025 SafeAI Solutions by Emre Dost
`;
  
  fs.writeFileSync(path.join(tempDir, 'README.txt'), readmeContent);
  
  // Copy files to dist folder
  console.log(`${colors.yellow}Creating distribution package...${colors.reset}`);
  
  // Create a zip file
  const archiver = require('archiver');
  const zipOutput = fs.createWriteStream(path.join(distDir, 'TabAI-Windows.zip'));
  const archive = archiver('zip', {
    zlib: { level: 9 } // Compression level
  });
  
  // Listen for errors
  archive.on('error', (err) => {
    throw err;
  });
  
  // Pipe the archive to the file
  archive.pipe(zipOutput);
  
  // Add the temp dir contents to the archive
  archive.directory(tempDir, false);
  
  // Finalize the archive
  archive.finalize();
  
  zipOutput.on('close', () => {
    const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
    console.log(`${colors.green}${colors.bright}
╔════════════════════════════════════════════════╗
║                                                ║
║         TabAI Built Successfully!              ║
║                                                ║
║      Package size: ${sizeInMB} MB                      ║
║      Location: dist/TabAI-Windows.zip          ║
║                                                ║
╚════════════════════════════════════════════════╝
${colors.reset}`);
    
    // Clean up temp directory
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (err) {
      console.error(`${colors.yellow}Warning: Failed to clean up temp directory: ${err.message}${colors.reset}`);
    }
  });
  
} catch (error) {
  console.error(`${colors.red}Build failed:${colors.reset}`, error);
  process.exit(1);
} 
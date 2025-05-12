# TabAI Installation Guide

This guide provides instructions for installing TabAI on different operating systems.

## Prerequisites

Before installing TabAI, ensure you have the following:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

## Installation Methods

### Method 1: Using Pre-built Binaries (Recommended)

1. Download the appropriate installer for your operating system from the [Releases](https://github.com/your-username/tabai/releases) page:
   - Windows: `TabAI-Setup.exe`
   - macOS: `TabAI.dmg`
   - Linux: `TabAI.AppImage`

2. Run the installer and follow the on-screen instructions.

3. Launch TabAI from your applications menu or desktop shortcut.

### Method 2: Building from Source

#### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/tabai.git
cd tabai/tabai-electron
```

#### Step 2: Install Dependencies

```bash
npm install
```

#### Step 3: Run the Application (Development Mode)

```bash
npm start
```

#### Step 4: Build the Application (For Distribution)

The easiest way to build TabAI is to use the included build script:

```bash
npm run package
```

This will create distribution packages in the `dist` directory.

Alternatively, you can build for a specific platform:

- For Windows:
  ```bash
  npm run build:win
  ```

- For macOS:
  ```bash
  npm run build:mac
  ```

- For Linux:
  ```bash
  npm run build:linux
  ```

## Platform-Specific Instructions

### Windows

1. Run the installer (`TabAI-Setup.exe`).
2. Choose the installation directory.
3. Select whether to create desktop and Start Menu shortcuts.
4. Complete the installation.

### macOS

1. Open the `.dmg` file.
2. Drag TabAI to the Applications folder.
3. Eject the disk image.
4. Launch TabAI from the Applications folder.

### Linux

1. Make the AppImage executable:
   ```bash
   chmod +x TabAI.AppImage
   ```
2. Run the AppImage:
   ```bash
   ./TabAI.AppImage
   ```

## Troubleshooting

### Common Installation Issues

1. **Dependency Errors**: If you encounter errors about missing dependencies when building from source, run:
   ```bash
   npm install --save-dev electron-builder
   ```

2. **Permission Issues**: If you encounter permission errors, try:
   - Windows: Run the installer as Administrator
   - macOS/Linux: Run installation commands with `sudo`

3. **App Won't Start**: Ensure you have the latest version of all dependencies and that your system meets the minimum requirements.

### Getting Help

If you encounter any issues not covered in this guide, please:

1. Check the [README.md](README.md) and [USER_GUIDE.md](USER_GUIDE.md) files for additional information.
2. Contact support at [your-email@example.com].

---

© 2025 SafeAI Solutions by Emre Dost. All rights reserved. 
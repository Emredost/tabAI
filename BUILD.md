# TabAI Building Instructions

This document provides detailed instructions for packaging TabAI for different platforms.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later recommended)
- npm (comes with Node.js)
- For macOS builds on non-macOS platforms: not possible (Apple requires macOS for building macOS apps)
- For Windows builds on non-Windows platforms: Wine 2.0+ (optional)
- For Linux builds: Docker (optional, for multi-platform builds)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tabai.git
   cd tabai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Building the Application

### Simple Build for Windows

If you're having issues with symlinks or permissions when building on Windows, we provide a simple build script that creates a basic distributable package:

```bash
npm run simple-build
```

This will:
1. Create a zip file with all necessary app files
2. Include a batch file installer for easy deployment
3. Avoid the symlink issues that can occur with electron-builder

The output will be available at `dist/TabAI-Windows.zip`.

### Quick Build (Current Platform)

To build the application for your current platform using electron-builder:

```bash
npm run package
```

This will automatically detect your platform and build the appropriate package.

### Platform-Specific Builds

To build for a specific platform:

- **Windows**:
  ```bash
  npm run build:win
  ```
  
- **macOS** (only works on macOS):
  ```bash
  npm run build:mac
  ```
  
- **Linux**:
  ```bash
  npm run build:linux
  ```

### Build for All Platforms

To build for all platforms (where technically possible):

```bash
npm run build:all
```

**Note**: You can only build for macOS on a macOS system due to Apple's requirements.

## Windows Build Troubleshooting

When building for Windows, you may encounter symlink-related errors like:

```
ERROR: Cannot create symbolic link : A required privilege is not held by the client.
```

Solutions:
1. Use the `simple-build` script: `npm run simple-build`
2. Run PowerShell/Command Prompt as Administrator
3. Enable Developer Mode in Windows Settings
4. Modify Windows policy to allow symlinks for non-admins:
   ```
   Local Security Policy → Security Settings → Local Policies → User Rights Assignment → Create symbolic links
   ```

## Output Files

After building, the packaged applications will be available in the `dist` folder:

- **Windows**: 
  - `dist/TabAI-Setup-1.0.0.exe` (installer with electron-builder)
  - `dist/TabAI-Windows.zip` (simple build package)
- **macOS**: `dist/TabAI-1.0.0-Mac.dmg` (disk image) and `dist/TabAI-1.0.0-Mac.zip` (zip archive)
- **Linux**: `dist/TabAI-1.0.0-Linux.AppImage`, `dist/tabai_1.0.0_amd64.deb`, and `dist/tabai-1.0.0.x86_64.rpm`

## Customizing the Build

You can customize the build configuration by modifying the `electron-builder.yml` file.

### Application Icons

For production builds, place your icons in the appropriate format:

1. **Windows**: 
   - Create an `.ico` file and place it at `build/icons/icon.ico`
   
2. **macOS**:
   - Create an `.icns` file and place it at `build/icons/icon.icns`
   
3. **Linux**:
   - Create PNG files at various sizes and place them at:
     - `build/icons/16x16.png`
     - `build/icons/32x32.png`
     - `build/icons/48x48.png`
     - `build/icons/64x64.png`
     - `build/icons/128x128.png`
     - `build/icons/256x256.png`
     - `build/icons/512x512.png`

You can use online tools to convert your logo.png to these formats, or use:
- For Windows `.ico`: [icoconvert.com](https://icoconvert.com)
- For macOS `.icns`: [img2icnsapp.com](https://img2icnsapp.com) or use the macOS `iconutil` command
- For Linux: resize your PNG to the required dimensions

## Code Signing

For production releases, you should sign your application:

### Windows Code Signing

1. Obtain a code signing certificate from a trusted certificate authority
2. Add these to your `electron-builder.yml`:
   ```yaml
   win:
     certificateFile: path/to/certificate.pfx
     certificatePassword: YOUR_PASSWORD
   ```

### macOS Code Signing

1. Obtain an Apple Developer ID certificate
2. Add these to your `electron-builder.yml`:
   ```yaml
   mac:
     identity: Your Apple Developer ID Application
   ```

## Troubleshooting

### Common Issues

1. **Error: Cannot find module 'electron'**
   - Solution: Run `npm install electron --save-dev`

2. **Error during packaging**
   - Solution: Ensure you have all dependencies installed: `npm install`

3. **Icon issues**
   - Solution: Make sure your icons are in the correct format and location

4. **Symlink errors on Windows**
   - Solution: Use the `simple-build` script or run as Administrator

### Getting Help

If you encounter problems with the build process, check:
- The [electron-builder documentation](https://www.electron.build/)
- Open an issue on the TabAI repository

## Advanced Configuration

For advanced configuration options, refer to the [electron-builder documentation](https://www.electron.build/configuration/configuration). 
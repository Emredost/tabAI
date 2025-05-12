# GitHub Repository Setup Guide

This guide will help you set up a GitHub repository for TabAI and configure it for releases.

## Initial Setup

### 1. Create a GitHub Account
If you don't already have one, create an account at [GitHub](https://github.com/).

### 2. Create a New Repository
1. Log in to GitHub
2. Click the "+" button in the top right corner and select "New repository"
3. Repository name: `tabai` (or your preferred name)
4. Description: "Desktop application for accessing multiple AI assistants in one place"
5. Choose "Public" (or "Private" if you prefer)
6. Check "Add a README file"
7. Select "MIT License" from the "Add a license" dropdown
8. Click "Create repository"

### 3. Push Your Code to GitHub
From your local TabAI-Desktop directory, run:

```bash
# Initialize Git (if not already done)
git init

# Add the GitHub repository as the remote origin
git remote add origin https://github.com/your-username/tabai.git

# Add all files
git add .

# Commit the files
git commit -m "Initial commit"

# Push to GitHub
git push -u origin main
```

## Setting Up GitHub Releases

### 1. Create a Release Workflow

Create a GitHub Actions workflow file to automatically build and release your app:

1. Create a directory structure in your repository: `.github/workflows/`
2. Create a file named `build.yml` in this directory with the following content:

```yaml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ${{ matrix.os }}
    
    strategy:
      matrix:
        os: [macos-latest, ubuntu-latest, windows-latest]
        
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 16
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build and package
        run: npm run build
        
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.os }}-build
          path: dist
          
      - name: Create Release
        uses: softprops/action-gh-release@v1
        if: startsWith(github.ref, 'refs/tags/')
        with:
          files: |
            dist/**/*.exe
            dist/**/*.dmg
            dist/**/*.AppImage
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 2. Creating a Release

1. Tag your release:
   ```bash
   git tag -a v1.0.0 -m "First release"
   git push origin v1.0.0
   ```

2. This will trigger the GitHub Actions workflow which will:
   - Build your application for Windows, macOS, and Linux
   - Create a release on GitHub
   - Attach the build artifacts to the release

### 3. Manually Creating a Release (Alternative)

If you prefer to create releases manually:

1. Build your application locally for all platforms:
   ```bash
   npm run build:win
   npm run build:mac
   npm run build:linux
   ```

2. On GitHub, go to your repository
3. Click on "Releases" in the right sidebar
4. Click "Create a new release"
5. Tag version: "v1.0.0"
6. Release title: "TabAI v1.0.0"
7. Description: Add release notes and instructions
8. Drag and drop your built files from the `dist` directory
9. Click "Publish release"

## Updating Your Repository

```bash
# Make changes to your code
git add .
git commit -m "Description of changes"
git push origin main

# For a new release
git tag -a v1.0.1 -m "Version 1.0.1"
git push origin v1.0.1
```

## GitHub Pages (Optional)

You can use GitHub Pages to create a landing page for your application:

1. Go to your repository settings
2. Scroll down to the GitHub Pages section
3. Select "main" branch and "/docs" folder
4. Create a `docs` folder in your repository with website files
5. Push the changes to GitHub 
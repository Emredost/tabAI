# TabAI - All Your AI Assistants in One Place

TabAI is a desktop application that provides a unified interface for accessing multiple AI chatbot services (Claude, ChatGPT, Gemini, DeepSeek, and Mistral) in a single window with tabbed navigation.

![TabAI Logo](./logo.png)

## Features

- **Unified Interface**: Access multiple AI assistants from a single application
- **Tabbed Navigation**: Switch between different AI services using tabs
- **Navigation Controls**: Back, forward, and refresh buttons for each AI service
- **Keyboard Shortcuts**: Quickly switch between tabs using keyboard shortcuts
- **Modern UI**: Clean, intuitive interface with dark mode support

## Quick Installation

### Windows
1. Download the latest [Windows installer](https://github.com/emredost/tabai/releases/latest/download/TabAI-Setup.exe)
2. Run the installer and follow the on-screen instructions
3. Launch TabAI from your Start menu or desktop shortcut

### macOS
1. Download the latest [macOS DMG](https://github.com/emredost/tabai/releases/latest/download/TabAI.dmg)
2. Open the DMG file and drag TabAI to your Applications folder
3. Launch TabAI from your Applications folder

### Linux
1. Download the latest [Linux AppImage](https://github.com/emredost/tabai/releases/latest/download/TabAI.AppImage)
2. Make the AppImage executable: `chmod +x TabAI.AppImage`
3. Run the application: `./TabAI.AppImage`

## Building from Source

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- Git (optional)

### Development Setup

1. Clone the repository or download the source code:
   ```
   git clone https://github.com/emredost/tabai.git
   cd tabai
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development version:
   ```
   npm start
   ```

### Building for Production

To build the application for your platform:

```
npm run package
```

This will create distributable packages in the `dist` directory.

To build for a specific platform:
- Windows: `npm run build:win`
- macOS: `npm run build:mac`
- Linux: `npm run build:linux`

## Usage

### Starting the Application

Launch TabAI from your applications menu/dock or by running:

```
npm start
```

### Opening AI Assistants

1. From the home screen, click on any AI assistant button to open it in a new tab
2. Alternatively, click the "+" button in the tab bar to select an AI assistant

### Navigating Between Tabs

- Click on any tab to switch to it
- Use **Ctrl+Tab** to cycle to the next tab
- Use **Ctrl+Shift+Tab** to cycle to the previous tab
- Use **Ctrl+Number** to switch to a specific tab (e.g., Ctrl+1 for the first tab)

## Security Note

TabAI embeds AI services directly in the application. Some services have security restrictions that may prevent embedding. The application attempts to handle these cases gracefully.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License © 2025 SafeAI Solutions by Emre Dost

## Contact

For questions or support, please create an issue on the GitHub repository. 
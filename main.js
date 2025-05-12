const { app, BrowserWindow, session, ipcMain, Menu } = require('electron');
const path = require('path');
const url = require('url');

// Keep a global reference of the main window
let mainWindow;

// AI assistants configuration
const aiAssistants = [
  { 
    id: 'claude',
    name: 'Claude',
    url: 'https://claude.ai/',
    icon: '🧠'
  },
  { 
    id: 'chatgpt',
    name: 'ChatGPT',
    url: 'https://chat.openai.com/',
    icon: '💬'
  },
  { 
    id: 'gemini',
    name: 'Gemini',
    url: 'https://gemini.google.com/',
    icon: '🔍'
  },
  { 
    id: 'deepseek',
    name: 'DeepSeek',
    url: 'https://chat.deepseek.com/',
    icon: '🧩'
  },
  { 
    id: 'mistral',
    name: 'Mistral',
    url: 'https://chat.mistral.ai/',
    icon: '✨'
  },
];

// Set up window management
function createWindow() {
  // Set up session and modify headers for all requests
  const sess = session.defaultSession;

  // Set up to handle response headers for all requests
  sess.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = details.responseHeaders || {};
    
    // Remove security headers that would prevent embedding
    delete responseHeaders['x-frame-options'];
    delete responseHeaders['X-Frame-Options'];
    delete responseHeaders['content-security-policy'];
    delete responseHeaders['Content-Security-Policy'];
    
    // Add permissive CORS headers
    responseHeaders['Access-Control-Allow-Origin'] = ['*'];
    responseHeaders['Access-Control-Allow-Methods'] = ['*'];
    responseHeaders['Access-Control-Allow-Headers'] = ['*'];
    
    callback({ responseHeaders });
  });

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      // Allow mixed content and disable security restrictions
      webSecurity: false,
      allowRunningInsecureContent: true,
    },
    title: 'TabAI - Multiple AI Assistants'
  });

  // Load the index.html file
  mainWindow.loadFile('index.html');

  // Hide default menu
  Menu.setApplicationMenu(null);

  // Only open DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed
  mainWindow.on('closed', function () {
    // Dereference the window object
    mainWindow = null;
  });
  
  // Expose window control APIs to the renderer
  global.minimizeWindow = () => mainWindow && mainWindow.minimize();
  global.maximizeWindow = () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  };
  global.closeWindow = () => mainWindow && mainWindow.close();
}

// Disable all security warnings in console (useful for development)
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  // Create custom protocol to handle requests
  const protocol = require('electron').protocol;
  protocol.registerFileProtocol('file', (request, callback) => {
    const url = request.url.substr(7); // Strip "file://" from URL
    callback({ path: path.normalize(`${__dirname}/${url}`) });
  });
  
  // Set default permissions for media devices
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    // Allow all permission requests from our app
    callback(true);
  });
  
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Get all AI assistants
ipcMain.handle('get-ai-assistants', () => {
  return aiAssistants;
});

// Window control handlers
ipcMain.handle('minimize-window', () => {
  if (mainWindow) mainWindow.minimize();
  return true;
});

ipcMain.handle('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
  return true;
});

ipcMain.handle('close-window', () => {
  if (mainWindow) mainWindow.close();
  return true;
});

// Quit when all windows are closed
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
}); 
const { app, BrowserWindow, BrowserView, session, ipcMain, Menu, shell } = require('electron');
const path = require('path');
const url = require('url');

// Keep a global reference of the main window
let mainWindow;
// Keep track of tabs/views
let activeViews = new Map();

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
    title: 'TabAI - Multiple AI Assistants',
    icon: path.join(__dirname, 'logo.png')
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
    // Clear all views
    activeViews.clear();
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

// Function to create or show a tab with an AI service
function createOrShowAITab(aiId, aiName, aiUrl) {
  if (!mainWindow) return false;

  // If view already exists, show it
  if (activeViews.has(aiId)) {
    showAITab(aiId);
    return true;
  }

  // Create a new BrowserView for this tab
  const view = new BrowserView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      allowRunningInsecureContent: true
    }
  });

  // Add to main window
  mainWindow.addBrowserView(view);
  
  // Set view bounds (leaving space for UI at top)
  const contentBounds = mainWindow.getContentBounds();
  // Adjust top position to leave room for tab bar and navigation bar
  const TAB_BAR_HEIGHT = 40;
  const NAV_BAR_HEIGHT = 40;
  const TOTAL_TOP_OFFSET = TAB_BAR_HEIGHT + NAV_BAR_HEIGHT;
  
  view.setBounds({ 
    x: 0, 
    y: TOTAL_TOP_OFFSET, 
    width: contentBounds.width, 
    height: contentBounds.height - TOTAL_TOP_OFFSET 
  });
  
  // Set view to auto-resize when window is resized
  view.setAutoResize({
    width: true,
    height: true,
    horizontal: false,
    vertical: false
  });
  
  // Load the URL
  view.webContents.loadURL(aiUrl);
  
  // Hide the view initially (will be shown when tab is selected)
  view.webContents.on('did-finish-load', () => {
    // Hide all other views
    for (const [id, otherView] of activeViews) {
      otherView.setAutoResize({ width: true, height: true });
      mainWindow.removeBrowserView(otherView);
    }
    // Show this view and notify UI
    mainWindow.addBrowserView(view);
    mainWindow.webContents.send('ai-tab-loaded', { id: aiId, title: aiName });
  });
  
  // Handle errors
  view.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error(`Failed to load ${aiUrl}: ${errorDescription}`);
    mainWindow.webContents.send('ai-tab-error', { 
      id: aiId, 
      title: aiName,
      error: errorDescription 
    });
  });
  
  // Store the view
  activeViews.set(aiId, view);
  
  // Notify UI that we're creating a tab
  mainWindow.webContents.send('ai-tab-created', { id: aiId, title: aiName });
  
  return true;
}

function showAITab(tabId) {
  if (!mainWindow || !activeViews.has(tabId)) return false;
  
  console.log('Main process: Showing tab', tabId);
  
  try {
    // Hide all views
    for (const [id, view] of activeViews) {
      mainWindow.removeBrowserView(view);
    }
    
    // Show the selected view
    const view = activeViews.get(tabId);
    mainWindow.addBrowserView(view);
    
    // Update bounds in case window size changed
    const contentBounds = mainWindow.getContentBounds();
    const TAB_BAR_HEIGHT = 40;
    const NAV_BAR_HEIGHT = 40;
    const TOTAL_TOP_OFFSET = TAB_BAR_HEIGHT + NAV_BAR_HEIGHT;
    
    view.setBounds({ 
      x: 0, 
      y: TOTAL_TOP_OFFSET, 
      width: contentBounds.width, 
      height: contentBounds.height - TOTAL_TOP_OFFSET 
    });
    
    // Force focus on the view to ensure it can receive keyboard events
    view.webContents.focus();
    
    // Notify UI that tab is active
    mainWindow.webContents.send('ai-tab-activated', { id: tabId });
    
    return true;
  } catch (error) {
    console.error('Error showing tab:', error);
    return false;
  }
}

function closeAITab(tabId) {
  if (!activeViews.has(tabId)) return false;
  
  const view = activeViews.get(tabId);
  mainWindow.removeBrowserView(view);
  view.webContents.destroy();
  activeViews.delete(tabId);
  
  // Notify UI that tab is closed
  mainWindow.webContents.send('ai-tab-closed', { id: tabId });
  
  return true;
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

// Handle opening AI in tab
ipcMain.handle('open-ai-tab', (event, assistant) => {
  return createOrShowAITab(assistant.id, assistant.name, assistant.url);
});

// Handle showing an existing tab
ipcMain.handle('show-ai-tab', (event, tabId) => {
  return showAITab(tabId);
});

// Handle closing a tab
ipcMain.handle('close-ai-tab', (event, tabId) => {
  return closeAITab(tabId);
});

// Add handler for opening external links (fallback)
ipcMain.handle('open-external-link', (event, url) => {
  shell.openExternal(url);
  return true;
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

// Handle navigation controls
ipcMain.handle('go-back', (event, tabId) => {
  if (!activeViews.has(tabId)) return false;
  const view = activeViews.get(tabId);
  
  console.log('Main process: Going back on tab', tabId);
  
  try {
    // Use the newer API if available, otherwise fall back to the older one
    if (view.webContents.navigationHistory?.canGoBack()) {
      view.webContents.navigationHistory.goBack();
    } else if (view.webContents.canGoBack()) {
      view.webContents.goBack();
    } else {
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error going back:', error);
    return false;
  }
});

ipcMain.handle('go-forward', (event, tabId) => {
  if (!activeViews.has(tabId)) return false;
  const view = activeViews.get(tabId);
  
  console.log('Main process: Going forward on tab', tabId);
  
  try {
    // Use the newer API if available, otherwise fall back to the older one
    if (view.webContents.navigationHistory?.canGoForward()) {
      view.webContents.navigationHistory.goForward();
    } else if (view.webContents.canGoForward()) {
      view.webContents.goForward();
    } else {
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error going forward:', error);
    return false;
  }
});

ipcMain.handle('refresh-tab', (event, tabId) => {
  if (!activeViews.has(tabId)) return false;
  const view = activeViews.get(tabId);
  view.webContents.reload();
  return true;
});

// Add navigation state checks
ipcMain.handle('can-go-back', (event, tabId) => {
  if (!activeViews.has(tabId)) return false;
  const view = activeViews.get(tabId);
  // Use the newer API to avoid deprecation warnings
  return view.webContents.navigationHistory?.canGoBack() ?? view.webContents.canGoBack();
});

ipcMain.handle('can-go-forward', (event, tabId) => {
  if (!activeViews.has(tabId)) return false;
  const view = activeViews.get(tabId);
  // Use the newer API to avoid deprecation warnings
  return view.webContents.navigationHistory?.canGoForward() ?? view.webContents.canGoForward();
});

// Add this new function to handle closing all tabs
function hideAllViews() {
  console.log('Main process: Hiding all views');
  
  if (!mainWindow) return false;
  
  try {
    // Remove all views from the window
    for (const [id, view] of activeViews) {
      mainWindow.removeBrowserView(view);
    }
    
    return true;
  } catch (error) {
    console.error('Error hiding views:', error);
    return false;
  }
}

// Add an IPC handler for it
ipcMain.handle('close-all-tabs', () => {
  return hideAllViews();
});

// Quit when all windows are closed
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
}); 
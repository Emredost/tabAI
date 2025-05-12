const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', {
    // Get all AI assistants
    getAIAssistants: () => ipcRenderer.invoke('get-ai-assistants'),
    
    // Window controls
    minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
    maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
    closeWindow: () => ipcRenderer.invoke('close-window'),
    
    // AI tab management
    openAITab: (assistant) => ipcRenderer.invoke('open-ai-tab', assistant),
    showAITab: (tabId) => ipcRenderer.invoke('show-ai-tab', tabId),
    closeAITab: (tabId) => ipcRenderer.invoke('close-ai-tab', tabId),
    closeAllTabs: () => ipcRenderer.invoke('close-all-tabs'),
    
    // Navigation controls
    goBack: (tabId) => ipcRenderer.invoke('go-back', tabId),
    goForward: (tabId) => ipcRenderer.invoke('go-forward', tabId),
    refreshTab: (tabId) => ipcRenderer.invoke('refresh-tab', tabId),
    canGoBack: (tabId) => ipcRenderer.invoke('can-go-back', tabId),
    canGoForward: (tabId) => ipcRenderer.invoke('can-go-forward', tabId),
    
    // Open URL in default browser (fallback)
    openExternalLink: (url) => ipcRenderer.invoke('open-external-link', url),
    
    // Tab event listeners
    onTabCreated: (callback) => ipcRenderer.on('ai-tab-created', (_, data) => callback(data)),
    onTabLoaded: (callback) => ipcRenderer.on('ai-tab-loaded', (_, data) => callback(data)),
    onTabActivated: (callback) => ipcRenderer.on('ai-tab-activated', (_, data) => callback(data)),
    onTabClosed: (callback) => ipcRenderer.on('ai-tab-closed', (_, data) => callback(data)),
    onTabError: (callback) => ipcRenderer.on('ai-tab-error', (_, data) => callback(data))
  }
);

// Also expose as global for direct access
contextBridge.exposeInMainWorld('electron', {
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window')
}); 
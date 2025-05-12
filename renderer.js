// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM content loaded, initializing app');
  
  // Mark initialization as in-progress
  document.body.dataset.appInit = 'in-progress';
  
  // DOM Elements
  const assistantsContainer = document.getElementById('assistants-container');
  const tabsContainer = document.getElementById('tabs');
  const tabContentContainer = document.getElementById('tab-content');
  const newTabButton = document.getElementById('add-tab-button');
  const tabCountDisplay = document.getElementById('tab-count');
  const statusMessage = document.getElementById('status-message');
  
  // Navigation elements
  const navBar = document.getElementById('nav-bar');
  const backBtn = document.getElementById('back-btn');
  const forwardBtn = document.getElementById('forward-btn');
  const refreshBtn = document.getElementById('refresh-btn');
  const quickTabSwitcher = document.getElementById('quick-tab-switcher');
  
  // Window controls
  const minimizeBtn = document.getElementById('minimize-btn');
  const maximizeBtn = document.getElementById('maximize-btn');
  const closeBtn = document.getElementById('close-btn');
  
  // Data
  let aiAssistants = [];
  let tabs = [{ id: 'home', title: 'Home', type: 'home' }];
  let activeTabId = 'home';
  
  // Check if the API is available
  if (!window.api) {
    showError('API not available. Make sure preload.js is correctly configured.');
    return;
  }
  
  // Initialize app
  try {
    // Get AI assistants from the main process
    aiAssistants = await window.api.getAIAssistants();
    
    if (!aiAssistants || !Array.isArray(aiAssistants) || aiAssistants.length === 0) {
      throw new Error('No AI assistants found or invalid data returned');
    }
    
    // Create quick launch buttons
    const quickLaunchContainer = document.getElementById('quick-launch-buttons');
    if (quickLaunchContainer) {
      quickLaunchContainer.innerHTML = '';
      aiAssistants.forEach(assistant => {
        const button = createQuickLaunchButton(assistant);
        quickLaunchContainer.appendChild(button);
      });
      
      // Add "Clear All Sessions" button at the end
      const clearButton = document.createElement('button');
      clearButton.className = 'quick-launch-btn clear-sessions-btn';
      clearButton.innerHTML = `
        <span class="icon">🔄</span>
        <span class="name">Clear All Logins</span>
      `;
      
      clearButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all saved login sessions? You will need to log in again for each AI service.')) {
          window.api.clearAllSessions()
            .then(() => {
              updateStatusMessage('All login sessions cleared successfully');
              showNotification('Sessions Cleared', 'All login sessions have been cleared. You will need to log in again the next time you open each AI service.');
            })
            .catch(err => {
              console.error('Error clearing sessions:', err);
              showNotification('Error', 'Failed to clear sessions. Please try restarting the app.');
            });
        }
      });
      
      quickLaunchContainer.appendChild(clearButton);
    }
    
    // Store assistant data but don't display it
    // We'll still create the cards but keep them hidden in memory
    // This is a minimal change to maintain compatibility with other code
    const assistantsData = document.createElement('div');
    assistantsData.style.display = 'none';
    assistantsData.id = 'assistants-data';
    
    aiAssistants.forEach(assistant => {
      const card = createAssistantCard(assistant);
      assistantsData.appendChild(card);
    });
    
    // Replace the old container with our hidden one
    if (assistantsContainer) {
      assistantsContainer.innerHTML = '';
      assistantsContainer.appendChild(assistantsData);
    }
    
    // Initialize window controls
    initWindowControls();
    
    // Initialize tab events
    initTabEvents();
    
    // Initialize tab event listeners
    initTabEventListeners();
    
    // Initialize navigation controls
    initNavigationControls();
    
    // Update status
    updateStatusMessage('Ready');
    
    // Render initial tabs
    renderTabs();
    
    // Show/hide navigation bar based on active tab
    toggleNavigationBar();
    
    // Ensure tab bar is ready
    renderTabs();
    
    // Add double-click handler for tabs to refresh pages
    if (tabsContainer) {
      tabsContainer.addEventListener('dblclick', (e) => {
        const tabEl = e.target.closest('.tab');
        if (tabEl && tabEl.dataset.tabId && tabEl.dataset.tabId !== 'home') {
          // Refresh the tab content
          window.api.refreshTab(tabEl.dataset.tabId);
          updateStatusMessage(`Refreshing ${tabEl.textContent.trim()}...`);
        }
      });
    }
    
    // Make sure navigation buttons are visible by adding this explicit check
    setTimeout(() => {
      toggleNavigationBar();
      if (activeTabId !== 'home' && navBar) {
        navBar.style.display = 'flex';
        navBar.style.zIndex = '1999';
        updateNavigationState();
      }
    }, 500);
    
  } catch (error) {
    showError(`Error loading AI assistants: ${error.message || 'Unknown error'}`);
    console.error('Failed to load AI assistants:', error);
  }
  
  // Initialize window controls
  function initWindowControls() {
    if (minimizeBtn) {
      minimizeBtn.addEventListener('click', () => {
        window.api.minimizeWindow();
      });
    }
    
    if (maximizeBtn) {
      maximizeBtn.addEventListener('click', () => {
        window.api.maximizeWindow();
      });
    }
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        window.api.closeWindow();
      });
    }
  }
  
  // Initialize tab events
  function initTabEvents() {
    console.log('Initializing tab events');
    
    // New tab button - add direct event listener and log for debugging
    if (newTabButton) {
      console.log('Setting up new tab button');
      // Remove any existing event listeners
      newTabButton.replaceWith(newTabButton.cloneNode(true));
      
      // Get the new reference after replacing
      const newButton = document.getElementById('add-tab-button');
      
      if (newButton) {
        console.log('Adding click listener to new tab button');
        newButton.addEventListener('click', (e) => {
          console.log('New tab button clicked');
          e.stopPropagation();
        showAISelector();
        });
      }
    }
    
    // We don't need tab click handler here anymore since we add them directly in renderTabs
    // But we'll keep the close button handler
    if (tabsContainer) {
      tabsContainer.addEventListener('click', (e) => {
        // Handle tab close button
        const closeBtn = e.target.closest('.tab-close');
        if (closeBtn) {
          e.stopPropagation();
          const tabEl = closeBtn.closest('.tab');
          if (tabEl && tabEl.dataset.tabId && tabEl.dataset.tabId !== 'home') {
            closeTab(tabEl.dataset.tabId);
          }
        }
      });
    }
    
    // Add a dedicated Home button click handler
    const homeTab = document.querySelector('.tab[data-tab-id="home"]');
    if (homeTab) {
      console.log('Found home tab, adding direct click handler');
      homeTab.addEventListener('click', (e) => {
        console.log('Home tab clicked directly');
        e.stopPropagation();
        goHome();
      });
    }
  }
  
  // Initialize navigation controls
  function initNavigationControls() {
    // Back button
    if (backBtn) {
      backBtn.addEventListener('click', async () => {
        if (activeTabId !== 'home') {
          console.log('Attempting to go back on tab:', activeTabId);
          try {
            const canGoBack = await window.api.canGoBack(activeTabId);
            console.log('Can go back:', canGoBack);
            if (canGoBack) {
              await window.api.goBack(activeTabId);
              updateStatusMessage(`Navigated back`);
            }
          } catch (error) {
            console.error('Error going back:', error);
          }
        }
      });
    }
    
    // Forward button
    if (forwardBtn) {
      forwardBtn.addEventListener('click', async () => {
        if (activeTabId !== 'home') {
          console.log('Attempting to go forward on tab:', activeTabId);
          try {
            const canGoForward = await window.api.canGoForward(activeTabId);
            console.log('Can go forward:', canGoForward);
            if (canGoForward) {
              await window.api.goForward(activeTabId);
              updateStatusMessage(`Navigated forward`);
            }
          } catch (error) {
            console.error('Error going forward:', error);
          }
        }
      });
    }
    
    // Refresh button
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        if (activeTabId !== 'home') {
          console.log('Refreshing tab:', activeTabId);
          window.api.refreshTab(activeTabId);
          updateStatusMessage(`Refreshing...`);
        }
      });
    }
    
    // Quick tab switcher
    if (quickTabSwitcher) {
      quickTabSwitcher.addEventListener('change', (e) => {
        const tabId = e.target.value;
        console.log('Switching to tab:', tabId);
        if (tabId) {
          activateTab(tabId);
        }
      });
    }
  }
  
  // Toggle navigation bar visibility
  function toggleNavigationBar() {
    if (navBar) {
      // Make sure nav bar is only shown for non-home tabs
      if (activeTabId === 'home') {
        navBar.style.display = 'none';
      } else {
        navBar.style.display = 'flex';
        // Make sure it's visible by setting a clear z-index
        navBar.style.zIndex = '1000';
        navBar.style.position = 'relative';
        
        // Update navigation button states
        updateNavigationState();
      }
    }
  }
  
  // Update navigation controls state
  async function updateNavigationState() {
    if (activeTabId === 'home') return;
    
    const canGoBack = await window.api.canGoBack(activeTabId);
    const canGoForward = await window.api.canGoForward(activeTabId);
    
    if (backBtn) {
      backBtn.disabled = !canGoBack;
    }
    
    if (forwardBtn) {
      forwardBtn.disabled = !canGoForward;
    }
  }
  
  // Initialize tab event listeners from main process
  function initTabEventListeners() {
    // Tab created
    window.api.onTabCreated((data) => {
      const { id, title } = data;
      
      // Add to tabs list if not exists
      if (!tabs.find(tab => tab.id === id)) {
        tabs.push({ id, title, type: 'ai' });
        renderTabs();
        updateQuickTabSwitcher();
      }
      
      // Update tab count
      updateTabCount();
    });
    
    // Tab loaded
    window.api.onTabLoaded((data) => {
      const { id, title } = data;
      activateTab(id);
      updateStatusMessage(`Loaded ${title}`);
      updateNavigationState();
    });
    
    // Tab activated
    window.api.onTabActivated((data) => {
      const { id } = data;
      activeTabId = id;
      renderTabs();
      toggleNavigationBar();
      updateNavigationState();
      updateQuickTabSwitcher();
    });
    
    // Tab closed
    window.api.onTabClosed((data) => {
      const { id } = data;
      // Remove from tabs
      tabs = tabs.filter(tab => tab.id !== id);
      
      // If active tab was closed, switch to home
      if (activeTabId === id) {
        activeTabId = 'home';
        activateTab('home');
      }
      
      renderTabs();
      updateTabCount();
      updateQuickTabSwitcher();
    });
    
    // Tab error
    window.api.onTabError((data) => {
      const { id, title, error } = data;
      showError(`Failed to load ${title}: ${error}`);
    });
  }
  
  // Update the quick tab switcher
  function updateQuickTabSwitcher() {
    if (!quickTabSwitcher) return;
    
    // Clear existing options
    quickTabSwitcher.innerHTML = '';
    
    // Add option for each tab
    tabs.forEach(tab => {
      const option = document.createElement('option');
      option.value = tab.id;
      option.text = tab.title;
      option.selected = tab.id === activeTabId;
      quickTabSwitcher.appendChild(option);
    });
  }
  
  // Render tabs in the tab bar
  function renderTabs() {
    if (!tabsContainer) return;
    
    console.log('Rendering tabs, active tab ID:', activeTabId);
    
    // Clear tabs container
    tabsContainer.innerHTML = '';
    
    // Add tabs
    tabs.forEach(tab => {
      const tabEl = document.createElement('div');
      tabEl.className = `tab ${tab.id === activeTabId ? 'active' : ''}`;
      tabEl.dataset.tabId = tab.id;
      
      const isHome = tab.id === 'home';
      const icon = isHome ? '🏠' : getTabIcon(tab.id);
      
      tabEl.innerHTML = `
        <span class="tab-icon">${icon}</span>
        <span class="tab-title">${tab.title}</span>
        ${!isHome ? '<span class="tab-close">×</span>' : ''}
      `;
      
      // Add a specific click handler for each tab
      tabEl.addEventListener('click', (e) => {
        // Ignore if they clicked close button
        if (e.target.closest('.tab-close')) return;
        
        console.log('Tab clicked:', tab.id);
        
        if (tab.id === 'home') {
          goHome();
        } else {
          activateTab(tab.id);
        }
      });
      
      tabsContainer.appendChild(tabEl);
    });
    
    // Update tab content visibility
    if (tabContentContainer) {
      tabContentContainer.style.display = activeTabId === 'home' ? 'block' : 'none';
    }
    
    // Update tab count
    updateTabCount();
  }
  
  // Get icon for tab
  function getTabIcon(tabId) {
    const assistant = aiAssistants.find(a => a.id === tabId);
    return assistant ? assistant.icon : '🤖';
  }
  
  // Activate a tab
  function activateTab(tabId) {
    if (tabId === activeTabId) return;
    
    console.log('Activating tab:', tabId);
    
    activeTabId = tabId;
    
    if (tabId === 'home') {
      // Hide all views and show home content
      console.log('Activating Home tab - showing home content');
      if (window.api && window.api.closeAllTabs) {
        window.api.closeAllTabs(); // This is a new function we'll add
      }
      
      if (tabContentContainer) {
        tabContentContainer.style.display = 'block';
      }
      
      // Make sure the home page is visible
      document.querySelector('.home-container')?.classList.add('visible');
    } else {
      // Show AI service
      console.log('Activating AI tab - showing AI content');
      if (tabContentContainer) {
        tabContentContainer.style.display = 'none';
      }
      
      // Show the AI tab via main process
      window.api.showAITab(tabId)
        .then(() => {
          console.log('Tab shown successfully:', tabId);
          updateNavigationState();
        })
        .catch(err => {
          console.error('Error showing tab:', err);
        });
        
      // Make sure the home page is hidden
      document.querySelector('.home-container')?.classList.remove('visible');
    }
    
    renderTabs();
    toggleNavigationBar();
    
    // Update status
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      updateStatusMessage(`Switched to ${tab.title}`);
    }
  }
  
  // Close a tab
  function closeTab(tabId) {
    if (tabId === 'home') return;
    
    // Close the tab via main process
    window.api.closeAITab(tabId);
  }
  
  // Create a card for an AI assistant
  function createAssistantCard(assistant) {
    const card = document.createElement('div');
    card.className = 'assistant-card';
    
    // Ensure the assistant has all required properties
    const name = assistant.name || 'Unknown Assistant';
    const icon = assistant.icon || '🤖';
    const id = assistant.id || 'unknown';
    
    card.innerHTML = `
      <div class="assistant-header">
        <div class="assistant-icon">${icon}</div>
        <div class="assistant-name">${name}</div>
      </div>
      <div class="assistant-body">
        <p class="assistant-description">${getAssistantDescription(id)}</p>
      </div>
      <div class="assistant-footer">
        <button class="open-button" data-ai-id="${id}">Open ${name}</button>
      </div>
    `;
    
    // Add click event to the button
    const button = card.querySelector('.open-button');
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      openAITab(assistant);
    });
    
    // Also allow clicking the whole card
    card.addEventListener('click', () => {
      openAITab(assistant);
    });
    
    return card;
  }
  
  // Open AI assistant in tab
  function openAITab(assistant) {
    try {
      // Open as tab
      window.api.openAITab(assistant);
      
      // Update UI
      updateStatusMessage(`Opening ${assistant.name} in tab...`);
      
      // Show persistence notification the first time
      const hasShownLoginInfo = localStorage.getItem('hasShownLoginInfo');
      if (!hasShownLoginInfo) {
        setTimeout(() => {
          showNotification(
            'Login Sessions Saved', 
            'Your login sessions will be automatically saved. You won\'t need to log in again the next time you open the app.',
            8000
          );
          localStorage.setItem('hasShownLoginInfo', 'true');
        }, 3000);
      }
      
      // Force update UI controls after a short delay
      setTimeout(forceUpdateUIControls, 300);
    } catch (error) {
      console.error(`Error opening assistant:`, error);
      showError(`Failed to open assistant. Error: ${error.message || 'Unknown error'}`);
      
      // Fallback to external browser
      window.api.openExternalLink(assistant.url);
    }
  }
  
  // Show an error message
  function showError(message) {
    assistantsContainer.innerHTML = `
      <div class="error">
        <h3>Error</h3>
        <p>${message}</p>
        <button id="retry-button" class="retry-button">Retry</button>
      </div>
    `;
    
    // Add retry button functionality
    const retryButton = document.getElementById('retry-button');
    if (retryButton) {
      retryButton.addEventListener('click', () => {
        window.location.reload();
      });
    }
  }
  
  // Update tab count in status bar
  function updateTabCount() {
    if (tabCountDisplay) {
      const count = tabs.length;
      tabCountDisplay.textContent = `${count} Tab${count !== 1 ? 's' : ''}`;
    }
  }
  
  // Update status message
  function updateStatusMessage(message) {
    if (statusMessage) {
      statusMessage.textContent = message;
    }
  }
  
  // Get descriptions for each AI assistant
  function getAssistantDescription(aiId) {
    const descriptions = {
      'claude': 'Anthropic\'s conversational AI assistant with long context windows, nuanced writing, and accurate responses.',
      'chatgpt': 'OpenAI\'s powerful language model with versatile capabilities, code generation, and creative tasks.',
      'gemini': 'Google\'s most capable AI model with real-time information, image understanding, and factual responses.',
      'deepseek': 'Advanced model for deep learning tasks with technical depth, research capabilities, and complex reasoning.',
      'mistral': 'Efficient and powerful open-source model with performance, efficiency, and balanced capabilities.',
      'google': 'Google Search for quick web searches, information lookup, and general browsing.'
    };
    
    return descriptions[aiId] || 'An AI assistant';
  }
  
  // Simple AI selector via confirm dialog
  function showAISelector() {
    console.log('Showing AI selector');
    
    try {
      // For simplicity, we'll create a very basic popup menu
      const menuContainer = document.createElement('div');
      menuContainer.className = 'ai-selector-popup';
      
      const closeBtn = document.createElement('button');
      closeBtn.className = 'close-popup-btn';
      closeBtn.textContent = '×';
      closeBtn.addEventListener('click', () => {
        document.body.removeChild(menuContainer);
      });
      
      menuContainer.appendChild(closeBtn);
      
      const heading = document.createElement('h3');
      heading.textContent = 'Select AI Assistant or Search';
      menuContainer.appendChild(heading);
      
      // Create buttons for each AI assistant
      aiAssistants.forEach(assistant => {
        const btnContainer = document.createElement('div');
        btnContainer.className = 'selector-btn-container';
        
        // Create the regular button
        const btn = document.createElement('button');
        btn.className = 'selector-btn';
        
        // Add special class for Google search to highlight it
        if (assistant.id === 'google') {
          btn.className = 'selector-btn google-search-btn';
        }
        
        btn.innerHTML = `<span class="icon">${assistant.icon}</span> ${assistant.name}`;
        
        btn.addEventListener('click', () => {
          document.body.removeChild(menuContainer);
          openAITab(assistant);
        });
        
        btnContainer.appendChild(btn);
        
        // For ChatGPT, add a "New Instance" button
        if (assistant.id === 'chatgpt') {
          const newInstanceBtn = document.createElement('button');
          newInstanceBtn.className = 'selector-btn new-instance-btn';
          newInstanceBtn.innerHTML = `<span class="icon">➕</span> New ChatGPT`;
          
          newInstanceBtn.addEventListener('click', () => {
            document.body.removeChild(menuContainer);
            openNewAIInstance(assistant);
          });
          
          btnContainer.appendChild(newInstanceBtn);
        }
        
        menuContainer.appendChild(btnContainer);
      });
      
      document.body.appendChild(menuContainer);
    } catch (error) {
      console.error('Error showing AI selector:', error);
      
      // Fallback to simple prompt
      const options = aiAssistants.map((ai, index) => `${index + 1}. ${ai.name}`).join('\n');
      const input = prompt(`Select an AI Assistant to open in tab:\n${options}`);
    
      if (input !== null) {
        const index = parseInt(input, 10) - 1;
        if (!isNaN(index) && index >= 0 && index < aiAssistants.length) {
          openAITab(aiAssistants[index]);
        } else {
          alert('Invalid selection');
        }
      }
    }
  }
  
  // Function to open a new instance of an AI assistant
  function openNewAIInstance(assistant) {
    try {
      // Open as a new tab instance
      window.api.openNewAIInstance(assistant);
      
      // Update UI
      updateStatusMessage(`Opening new ${assistant.name} instance...`);
      
      // Show persistence notification the first time
      const hasShownLoginInfo = localStorage.getItem('hasShownLoginInfo');
      if (!hasShownLoginInfo) {
        setTimeout(() => {
          showNotification(
            'Login Sessions Saved', 
            'Your login sessions will be automatically saved. You won\'t need to log in again the next time you open the app.',
            8000
          );
          localStorage.setItem('hasShownLoginInfo', 'true');
        }, 3000);
      }
      
      // Force update UI controls after a short delay
      setTimeout(forceUpdateUIControls, 300);
    } catch (error) {
      console.error(`Error opening new assistant instance:`, error);
      showError(`Failed to open new assistant instance. Error: ${error.message || 'Unknown error'}`);
      
      // Fallback to external browser
      window.api.openExternalLink(assistant.url);
    }
  }
  
  // Create a quick launch button
  function createQuickLaunchButton(assistant) {
    const button = document.createElement('button');
    button.className = 'quick-launch-btn';
    button.dataset.aiId = assistant.id;
    
    // Ensure the assistant has all required properties
    const name = assistant.name || 'Unknown Assistant';
    const icon = assistant.icon || '🤖';
    
    button.innerHTML = `
      <span class="icon">${icon}</span>
      <span class="name">${name}</span>
    `;
    
    // Add click event
    button.addEventListener('click', () => {
      openAITab(assistant);
    });
    
    return button;
  }
  
  // Add key event listener for quick tab switching
  document.addEventListener('keydown', (e) => {
    // Ctrl+Tab to cycle through tabs
    if (e.ctrlKey && e.key === 'Tab') {
      e.preventDefault();
      switchToNextTab();
    }
    
    // Ctrl+Shift+Tab to cycle backwards
    if (e.ctrlKey && e.shiftKey && e.key === 'Tab') {
      e.preventDefault();
      switchToPreviousTab();
    }
    
    // Ctrl+number to switch to specific tab
    if (e.ctrlKey && !isNaN(parseInt(e.key)) && parseInt(e.key) > 0) {
      const tabIndex = parseInt(e.key) - 1;
      if (tabIndex < tabs.length) {
        activateTab(tabs[tabIndex].id);
      }
    }
  });
  
  // Add functions for tab cycling
  function switchToNextTab() {
    if (tabs.length <= 1) return;
    
    // Find current tab index
    const currentIndex = tabs.findIndex(tab => tab.id === activeTabId);
    // Get next tab index (wrap around if at end)
    const nextIndex = (currentIndex + 1) % tabs.length;
    // Activate next tab
    activateTab(tabs[nextIndex].id);
  }
  
  function switchToPreviousTab() {
    if (tabs.length <= 1) return;
    
    // Find current tab index
    const currentIndex = tabs.findIndex(tab => tab.id === activeTabId);
    // Get previous tab index (wrap around if at beginning)
    const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    // Activate previous tab
    activateTab(tabs[prevIndex].id);
  }
  
  // Add this function to force update tab controls
  function forceUpdateUIControls() {
    renderTabs();
    toggleNavigationBar();
    updateNavigationState();
    updateQuickTabSwitcher();
    
    // Force display navigation if needed
    if (activeTabId !== 'home' && navBar) {
      navBar.style.display = 'flex';
    }
  }
  
  // Add a dedicated function to go to the home tab
  function goHome() {
    console.log('Going home');
    
    // First hide all browser views
    window.api.closeAllTabs()
      .then(() => {
        console.log('All tabs closed, activating home tab');
        
        // Update active tab ID
        activeTabId = 'home';
        
        // Show home content
        if (tabContentContainer) {
          tabContentContainer.style.display = 'block';
        }
        
        // Make sure the home page is visible
        const homeContainer = document.querySelector('.home-container');
        if (homeContainer) {
          homeContainer.classList.add('visible');
        }
        
        // Update UI
        renderTabs();
        toggleNavigationBar();
        updateStatusMessage('Home');
      })
      .catch(err => {
        console.error('Error going home:', err);
      });
  }
  
  // Mark initialization as complete
  document.body.dataset.appInit = 'complete';
  
  // Ensure all clickable elements are properly set up
  ensureButtonsFunctional();
  
  // Force an initial home screen state
  setTimeout(() => {
    console.log('Setting initial home screen state');
    goHome();
  }, 200);
});

// Function to ensure buttons are functional
function ensureButtonsFunctional() {
  console.log('Ensuring buttons are functional');
  
  // Make sure the new tab button is clickable
  const addTabBtn = document.getElementById('add-tab-button');
  if (addTabBtn) {
    console.log('Re-initializing new tab button');
    // Direct style overrides
    addTabBtn.style.zIndex = '9999';
    addTabBtn.style.position = 'relative';
    addTabBtn.style.pointerEvents = 'auto';
    addTabBtn.style.cursor = 'pointer';
    
    // Add a distinct border to make it more visible
    addTabBtn.style.border = '2px solid #4285f4';
    addTabBtn.style.boxShadow = '0 0 5px rgba(66, 133, 244, 0.5)';
    
    // Remove and re-add event listener
    const newBtn = addTabBtn.cloneNode(true);
    addTabBtn.parentNode.replaceChild(newBtn, addTabBtn);
    
    newBtn.addEventListener('click', (e) => {
      console.log('New tab button clicked');
      e.stopPropagation();
      e.preventDefault();
      showAISelector();
      return false;
    });
    
    // Add a small tooltip that appears on hover
    const tooltip = document.createElement('div');
    tooltip.className = 'button-tooltip';
    tooltip.textContent = 'Open AI Assistant or Search';
    newBtn.appendChild(tooltip);
  }
  
  // Make sure home tab is clickable
  const homeTab = document.querySelector('.tab[data-tab-id="home"]');
  if (homeTab) {
    console.log('Re-initializing home tab');
    // Direct style overrides
    homeTab.style.zIndex = '3000';
    homeTab.style.position = 'relative';
    homeTab.style.pointerEvents = 'auto';
    homeTab.style.cursor = 'pointer';
    
    // Remove and re-add event listener
    const newHomeTab = homeTab.cloneNode(true);
    homeTab.parentNode.replaceChild(newHomeTab, homeTab);
    
    newHomeTab.addEventListener('click', (e) => {
      console.log('Home tab clicked');
      e.stopPropagation();
      e.preventDefault();
      goHome();
      return false;
    });
  }
}

// Add a function to show notifications to the user
function showNotification(title, message, duration = 5000) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerHTML = `
    <div class="notification-header">
      <strong>${title}</strong>
      <button class="notification-close">×</button>
    </div>
    <div class="notification-body">
      ${message}
    </div>
  `;
  
  // Add close button functionality
  const closeBtn = notification.querySelector('.notification-close');
  closeBtn.addEventListener('click', () => {
    document.body.removeChild(notification);
  });
  
  // Auto-hide after duration
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.classList.add('notification-hiding');
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 500);
    }
  }, duration);
  
  // Add to document
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.classList.add('notification-visible');
  }, 10);
} 
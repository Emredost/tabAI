// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', async () => {
  // DOM Elements
  const assistantsContainer = document.getElementById('assistants-container');
  const tabsContainer = document.getElementById('tabs');
  const tabContentContainer = document.getElementById('tab-content');
  const newTabButton = document.getElementById('new-tab-button');
  const tabCountDisplay = document.getElementById('tab-count');
  const statusMessage = document.getElementById('status-message');
  
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
    
    // Clear loading message and populate AI cards
    assistantsContainer.innerHTML = '';
    aiAssistants.forEach(assistant => {
      const card = createAssistantCard(assistant);
      assistantsContainer.appendChild(card);
    });
    
    // Initialize window controls
    initWindowControls();
    
    // Initialize tab events
    initTabEvents();
    
    // Update status
    updateStatusMessage('Ready');
    
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
    // New tab button
    if (newTabButton) {
      newTabButton.addEventListener('click', () => {
        showAISelector();
      });
    }
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
      openExternalAI(assistant);
    });
    
    // Also allow clicking the whole card
    card.addEventListener('click', () => {
      openExternalAI(assistant);
    });
    
    return card;
  }
  
  // Open AI assistant in external browser (alternative to iframes)
  function openExternalAI(assistant) {
    try {
      // Open the URL in the default browser
      window.api.openExternalLink(assistant.url);
      
      // Record in recent chats if needed
      updateStatusMessage(`Opened ${assistant.name} in browser`);
    } catch (error) {
      console.error(`Error opening assistant:`, error);
      showError(`Failed to open assistant. Error: ${error.message || 'Unknown error'}`);
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
      'mistral': 'Efficient and powerful open-source model with performance, efficiency, and balanced capabilities.'
    };
    
    return descriptions[aiId] || 'An AI assistant';
  }
  
  // Simple AI selector via confirm dialog
  function showAISelector() {
    // For simplicity, we'll use a basic prompt for now
    // In a real app, you'd want a custom modal dialog
    const options = aiAssistants.map((ai, index) => `${index + 1}. ${ai.name}`).join('\n');
    const input = prompt(`Select an AI Assistant to open in browser:\n${options}`);
    
    if (input !== null) {
      const index = parseInt(input, 10) - 1;
      if (!isNaN(index) && index >= 0 && index < aiAssistants.length) {
        openExternalAI(aiAssistants[index]);
      } else {
        alert('Invalid selection');
      }
    }
  }
}); 
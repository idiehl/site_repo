// QuickPRO Browser Extension - Content Script
// This script runs on job posting pages

(function() {
  // Only run once
  if (window.quickproInjected) return;
  window.quickproInjected = true;

  // Create floating save button
  function createFloatingButton() {
    const button = document.createElement('div');
    button.id = 'quickpro-save-btn';
    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="30" r="20" stroke="#5e6bf1" stroke-width="4" fill="none"/>
        <path d="M42 40 L56 54" stroke="#06b6d4" stroke-width="5" stroke-linecap="round"/>
        <circle cx="32" cy="30" r="4" fill="#06b6d4"/>
      </svg>
      <span>Save to QuickPRO</span>
    `;
    
    button.addEventListener('click', handleSaveClick);
    document.body.appendChild(button);
    
    return button;
  }

  // Handle save click
  async function handleSaveClick() {
    const button = document.getElementById('quickpro-save-btn');
    const originalContent = button.innerHTML;
    
    button.innerHTML = '<span class="quickpro-loading"></span><span>Saving...</span>';
    button.classList.add('saving');
    
    try {
      // Send message to background script
      const response = await chrome.runtime.sendMessage({
        type: 'SAVE_JOB',
        data: {
          url: window.location.href,
          html_content: document.documentElement.outerHTML,
          page_title: document.title,
        }
      });
      
      if (response.success) {
        button.innerHTML = '<span>✓ Saved!</span>';
        button.classList.add('success');
        
        setTimeout(() => {
          button.innerHTML = originalContent;
          button.classList.remove('success', 'saving');
        }, 3000);
      } else {
        throw new Error(response.error);
      }
      
    } catch (err) {
      button.innerHTML = `<span>✗ ${err.message}</span>`;
      button.classList.add('error');
      
      setTimeout(() => {
        button.innerHTML = originalContent;
        button.classList.remove('error', 'saving');
      }, 3000);
    }
  }

  // Check if user is logged in before showing button
  async function init() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'CHECK_AUTH' });
      
      if (response.authenticated) {
        createFloatingButton();
      }
    } catch (err) {
      // Extension context may have been invalidated
      console.log('QuickPRO: Could not check auth status');
    }
  }

  // Initialize after a short delay to let page settle
  setTimeout(init, 1000);
})();

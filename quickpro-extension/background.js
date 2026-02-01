// Atlas Apply Browser Extension - Background Service Worker

const API_BASE = 'https://atlasuniversalis.com';

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SAVE_JOB') {
    handleSaveJob(message.data).then(sendResponse);
    return true; // Keep channel open for async response
  }
  
  if (message.type === 'CHECK_AUTH') {
    checkAuth().then(sendResponse);
    return true;
  }
});

// Handle saving a job
async function handleSaveJob(data) {
  try {
    const { accessToken } = await chrome.storage.local.get(['accessToken']);
    
    if (!accessToken) {
      return { success: false, error: 'Not logged in' };
    }
    
    const response = await fetch(`${API_BASE}/api/v1/jobs/ingest-html`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.detail || 'Failed to save job' };
    }
    
    const result = await response.json();
    return { success: true, data: result };
    
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Check if user is authenticated
async function checkAuth() {
  const { accessToken } = await chrome.storage.local.get(['accessToken']);
  
  if (!accessToken) {
    return { authenticated: false };
  }
  
  try {
    const response = await fetch(`${API_BASE}/api/v1/auth/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    if (response.ok) {
      const user = await response.json();
      return { authenticated: true, user };
    } else {
      // Token expired or invalid
      await chrome.storage.local.remove(['accessToken', 'userEmail']);
      return { authenticated: false };
    }
  } catch (err) {
    return { authenticated: false, error: err.message };
  }
}

// Optional: Show badge when on a job page
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const isJobPage = isJobPostingPage(tab.url);
    
    if (isJobPage) {
      chrome.action.setBadgeText({ tabId, text: '!' });
      chrome.action.setBadgeBackgroundColor({ tabId, color: '#06b6d4' });
    } else {
      chrome.action.setBadgeText({ tabId, text: '' });
    }
  }
});

function isJobPostingPage(url) {
  const jobPatterns = [
    /linkedin\.com\/jobs\//i,
    /indeed\.com\/.*viewjob/i,
    /indeed\.com\/.*jk=/i,
    /glassdoor\.com\/job-listing\//i,
    /lever\.co\//i,
    /greenhouse\.io\//i,
    /workday\.com\/.*job/i,
    /myworkdayjobs\.com\//i,
  ];
  
  return jobPatterns.some(pattern => pattern.test(url));
}

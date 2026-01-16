// QuickPRO Browser Extension - Popup Script

const API_BASE = 'https://atlasuniversalis.com';

// DOM Elements
const loginView = document.getElementById('login-view');
const mainView = document.getElementById('main-view');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const userEmail = document.getElementById('user-email');
const logoutBtn = document.getElementById('logout-btn');
const saveBtn = document.getElementById('save-btn');
const saveBtnText = document.getElementById('save-btn-text');
const statusBox = document.getElementById('page-status');
const statusMessage = document.getElementById('status-message');
const result = document.getElementById('result');
const resultMessage = document.getElementById('result-message');
const loading = document.getElementById('loading');

// State
let currentTabInfo = null;

// Initialize
document.addEventListener('DOMContentLoaded', init);

async function init() {
  const token = await getToken();
  
  if (token) {
    showMainView();
    await checkCurrentPage();
  } else {
    showLoginView();
  }
}

// View switching
function showLoginView() {
  loginView.classList.remove('hidden');
  mainView.classList.add('hidden');
}

function showMainView() {
  loginView.classList.add('hidden');
  mainView.classList.remove('hidden');
}

// Token management
async function getToken() {
  const data = await chrome.storage.local.get(['accessToken', 'userEmail']);
  if (data.accessToken) {
    userEmail.textContent = data.userEmail || 'Logged in';
    return data.accessToken;
  }
  return null;
}

async function setToken(token, email) {
  await chrome.storage.local.set({ 
    accessToken: token,
    userEmail: email 
  });
}

async function clearToken() {
  await chrome.storage.local.remove(['accessToken', 'userEmail', 'refreshToken']);
}

// Login handler
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  const loginBtn = document.getElementById('login-btn');
  loginBtn.disabled = true;
  loginBtn.textContent = 'Signing in...';
  
  try {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }
    
    const data = await response.json();
    await setToken(data.access_token, email);
    
    showMainView();
    await checkCurrentPage();
    
  } catch (err) {
    loginError.textContent = err.message;
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Sign In';
  }
});

// Logout handler
logoutBtn.addEventListener('click', async () => {
  await clearToken();
  showLoginView();
});

// Check current page
async function checkCurrentPage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.url) {
      statusMessage.textContent = 'Unable to access this page';
      return;
    }
    
    currentTabInfo = {
      url: tab.url,
      title: tab.title
    };
    
    // Check if it's a job posting page
    const isJobPage = isJobPostingPage(tab.url);
    
    if (isJobPage) {
      statusBox.classList.add('job-detected');
      statusBox.classList.remove('not-job');
      statusMessage.textContent = '✓ Job posting detected';
      saveBtn.disabled = false;
    } else {
      statusBox.classList.remove('job-detected');
      statusBox.classList.add('not-job');
      statusMessage.textContent = 'Navigate to a job posting to save it';
      saveBtn.disabled = true;
    }
    
  } catch (err) {
    statusMessage.textContent = 'Error checking page';
    console.error(err);
  }
}

// Detect job posting pages
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
    /careers\./i,
    /jobs\./i,
    /\/job\//i,
    /\/jobs\//i,
    /\/career/i,
  ];
  
  return jobPatterns.some(pattern => pattern.test(url));
}

// Save job handler
saveBtn.addEventListener('click', async () => {
  if (!currentTabInfo) return;
  
  const token = await getToken();
  if (!token) {
    showLoginView();
    return;
  }
  
  // Show loading
  loading.classList.remove('hidden');
  result.classList.add('hidden');
  saveBtn.disabled = true;
  
  try {
    // Get page HTML - try multiple methods
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let html = '';
    
    // Method 1: Try chrome.scripting if available
    if (chrome.scripting && chrome.scripting.executeScript) {
      try {
        const htmlContent = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => document.documentElement.outerHTML,
        });
        html = htmlContent[0].result;
      } catch (scriptErr) {
        console.log('scripting.executeScript failed, trying tabs.sendMessage');
      }
    }
    
    // Method 2: Try sending message to content script
    if (!html) {
      try {
        html = await chrome.tabs.sendMessage(tab.id, { type: 'GET_HTML' });
      } catch (msgErr) {
        console.log('tabs.sendMessage failed');
      }
    }
    
    // Method 3: If all else fails, just send the URL and let backend scrape
    if (!html) {
      html = `<html><head><title>${currentTabInfo.title}</title></head><body>Page content could not be captured. URL: ${currentTabInfo.url}</body></html>`;
    }
    
    // Send to API
    const response = await fetch(`${API_BASE}/api/v1/jobs/ingest-html`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        url: currentTabInfo.url,
        html_content: html,
        page_title: currentTabInfo.title,
      }),
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        await clearToken();
        showLoginView();
        throw new Error('Session expired. Please log in again.');
      }
      const error = await response.json();
      throw new Error(error.detail || 'Failed to save job');
    }
    
    const data = await response.json();
    
    // Show success
    result.classList.remove('hidden', 'error');
    result.classList.add('success');
    resultMessage.textContent = '✓ Job saved! Check your dashboard.';
    saveBtnText.textContent = 'Saved!';
    
  } catch (err) {
    result.classList.remove('hidden', 'success');
    result.classList.add('error');
    resultMessage.textContent = err.message;
    saveBtn.disabled = false;
  } finally {
    loading.classList.add('hidden');
  }
});

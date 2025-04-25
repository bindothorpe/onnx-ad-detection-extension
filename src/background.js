// Background script for Ad Detector Extension
// Handles communication between popup and content scripts

// Listen for installation or update
chrome.runtime.onInstalled.addListener(async () => {
  console.log("Ad Detector Extension installed/updated");

  // Initialize default settings if not already set
  const settings = await chrome.storage.local.get(["debug", "enabled"]);

  if (settings.debug === undefined) {
    await chrome.storage.local.set({ debug: true });
  }

  if (settings.enabled === undefined) {
    await chrome.storage.local.set({ enabled: true });
  }
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle any global message routing here if needed
  return false; // Don't keep the message channel open
});

// Optional: Add event listeners for tab updates to reset state
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Make sure tab.url exists before checking if it includes youtube.com
  if (
    changeInfo.status === "complete" &&
    tab.url &&
    tab.url.includes("youtube.com")
  ) {
    // Tab has been fully loaded, we could notify the content script here if needed
  }
});

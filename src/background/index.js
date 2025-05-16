// Background script for Ad Detector Extension
// Handles communication between popup and content scripts

// Listen for installation or update
chrome.runtime.onInstalled.addListener(async () => {
  console.log("Ad Detector Extension installed/updated");

  // Initialize default settings if not already set
  const settings = await chrome.storage.local.get([
    "debug",
    "enabled",
    "selectedModelId",
  ]);

  if (settings.debug === undefined) {
    await chrome.storage.local.set({ debug: true });
  }

  if (settings.enabled === undefined) {
    await chrome.storage.local.set({ enabled: true });
  }

  // Initialize default model if not set - using hard-coded default
  if (settings.selectedModelId === undefined) {
    await chrome.storage.local.set({ selectedModelId: "temporal-cnn" });
  }
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // When model is changed in popup, propagate to all tabs with YouTube
  if (message.type === "CHANGE_MODEL") {
    propagateModelChangeToTabs(message.modelId);
  }

  return false; // Don't keep the message channel open
});

// Propagate model change to all YouTube tabs
async function propagateModelChangeToTabs(modelId) {
  try {
    // Find all YouTube tabs
    const tabs = await chrome.tabs.query({ url: "*://*.youtube.com/*" });

    // Send model change message to each tab
    for (const tab of tabs) {
      chrome.tabs
        .sendMessage(tab.id, {
          type: "CHANGE_MODEL",
          modelId: modelId,
        })
        .catch((err) => {
          // Ignore errors from inactive tabs
          console.log(`Could not send to tab ${tab.id}: ${err.message}`);
        });
    }

    console.log(
      `Model change (${modelId}) propagated to ${tabs.length} YouTube tabs`
    );
  } catch (error) {
    console.error("Error propagating model change:", error);
  }
}

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

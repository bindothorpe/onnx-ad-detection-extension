// Popup script for Ad Detector Extension

// Get UI elements
const debugToggle = document.getElementById("debug-toggle");
const enabledToggle = document.getElementById("enabled-toggle");
const statusElement = document.getElementById("status");

// Initialize UI based on stored settings
document.addEventListener("DOMContentLoaded", async () => {
  // Load stored settings
  try {
    const settings = await chrome.storage.local.get(["debug", "enabled"]);

    // Set debug toggle
    if (settings.debug !== undefined) {
      debugToggle.checked = settings.debug;
    }

    // Set enabled toggle
    if (settings.enabled !== undefined) {
      enabledToggle.checked = settings.enabled;
      updateStatusDisplay(settings.enabled);
    } else {
      // Default to enabled
      enabledToggle.checked = true;
      updateStatusDisplay(true);
    }
  } catch (error) {
    console.error("Error loading settings:", error);
  }
});

// Update status display
function updateStatusDisplay(enabled) {
  if (enabled) {
    statusElement.textContent = "Active";
    statusElement.style.color = "#52c41a";
  } else {
    statusElement.textContent = "Disabled";
    statusElement.style.color = "#f5222d";
  }
}

// Handle debug toggle change
debugToggle.addEventListener("change", async () => {
  const debugEnabled = debugToggle.checked;

  // Save setting
  try {
    await chrome.storage.local.set({ debug: debugEnabled });

    // Notify content script
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: "UPDATE_DEBUG",
        debug: debugEnabled,
      });
    }
  } catch (error) {
    console.error("Error saving debug setting:", error);
  }
});

// Handle enabled toggle change
enabledToggle.addEventListener("change", async () => {
  const enabled = enabledToggle.checked;

  // Update UI
  updateStatusDisplay(enabled);

  // Save setting
  try {
    await chrome.storage.local.set({ enabled: enabled });

    // Notify content script
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: "SET_ENABLED",
        enabled: enabled,
      });
    }
  } catch (error) {
    console.error("Error saving enabled setting:", error);
  }
});

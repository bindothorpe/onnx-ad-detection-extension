// Popup script for Ad Detector Extension

// Get UI elements
const debugToggle = document.getElementById("debug-toggle");
const enabledToggle = document.getElementById("enabled-toggle");
const statusElement = document.getElementById("status");
const modelSelect = document.getElementById("model-select");
const modelDescription = document.getElementById("model-description");

// Initialize UI based on stored settings
document.addEventListener("DOMContentLoaded", async () => {
  // Populate model dropdown
  populateModelDropdown();

  // Load stored settings
  try {
    const settings = await chrome.storage.local.get([
      "debug",
      "enabled",
      "selectedModelId",
    ]);

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

    // Set selected model
    if (settings.selectedModelId) {
      modelSelect.value = settings.selectedModelId;
    } else {
      modelSelect.value = window.DEFAULT_MODEL_ID;
      // Save default model ID
      await chrome.storage.local.set({
        selectedModelId: window.DEFAULT_MODEL_ID,
      });
    }

    // Update model description based on selection
    updateModelDescription();
  } catch (error) {
    console.error("Error loading settings:", error);
  }
});

// Populate model dropdown with options
function populateModelDropdown() {
  // Clear existing options
  modelSelect.innerHTML = "";

  // Populate from global MODEL_CONFIGS
  window.MODEL_CONFIGS.forEach((model) => {
    const option = document.createElement("option");
    option.value = model.id;
    option.textContent = model.name;
    modelSelect.appendChild(option);
  });
}

// Update model description when selection changes
function updateModelDescription() {
  const selectedModelId = modelSelect.value;
  const selectedModel = window.getModelConfigById(selectedModelId);

  if (selectedModel) {
    modelDescription.textContent = selectedModel.description;
  } else {
    modelDescription.textContent = "";
  }
}

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

// Handle model selection change
modelSelect.addEventListener("change", async () => {
  const selectedModelId = modelSelect.value;

  // Update description
  updateModelDescription();

  // Save setting
  try {
    await chrome.storage.local.set({ selectedModelId: selectedModelId });

    // Notify background script about model change
    chrome.runtime.sendMessage({
      type: "CHANGE_MODEL",
      modelId: selectedModelId,
    });
  } catch (error) {
    console.error("Error saving model selection:", error);
  }
});

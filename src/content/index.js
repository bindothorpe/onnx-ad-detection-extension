// Ad Detector Extension - Content Script
// Extracts frames from YouTube videos and uses ONNX model to detect ads

// Configuration
let DEBUG = true; // Debug mode (can be toggled)
let ENABLED = true; // Extension enabled status (can be toggled)
const FRAME_INTERVAL = 1000; // Process frames every 1 second
let REQUIRED_FRAMES = 5; // Temporal window size from model - now changeable based on model
const FRAME_SIZE = 224; // Target frame size (224x224)

// State tracking
let isSandboxReady = false;
let isModelLoaded = false;
let sandboxFrame = null;
let currentVideoElement = null;
let processingFrames = false;
let isAdOverlayVisible = false;
let requestIdCounter = 0;
let pendingRequests = new Map();
let detectionInterval = null;
let lastProbability = 0;
let currentModelId = null;

let AD_PROBABILITY_THRESHOLD = 0.2; // Threshold for ad detection (will be updated by model config)

// Advanced detection tracking
const PROBABILITY_HISTORY = [];
const PROBABILITY_HISTORY_SIZE = 5; // Number of recent probabilities to keep
let PROBABILITY_THRESHOLD_HIGH = 0.25; // High confidence threshold (will be updated by model config)
let PROBABILITY_THRESHOLD_LOW = 0.2; // Low confidence threshold (will be updated by model config)

// Debug logging
function debugLog(...args) {
  if (DEBUG) {
    console.log("[Ad Detector]", ...args);
  }
}

// Create the sandbox iframe for model inference
function createSandboxFrame() {
  debugLog("Creating sandbox iframe");

  // Remove existing sandbox if present
  const existingFrame = document.getElementById("ad-detector-sandbox");
  if (existingFrame) {
    existingFrame.remove();
  }

  // Create new sandbox iframe
  sandboxFrame = document.createElement("iframe");
  sandboxFrame.id = "ad-detector-sandbox";
  sandboxFrame.src = chrome.runtime.getURL("model.html");
  sandboxFrame.style.display = "none";
  document.body.appendChild(sandboxFrame);

  // Set up message listener for sandbox communication
  window.addEventListener("message", handleSandboxMessage);
}

// Handle messages from the sandbox
function handleSandboxMessage(event) {
  // Make sure message is from our sandbox
  if (event.source !== sandboxFrame?.contentWindow) return;

  const message = event.data;

  switch (message.type) {
    case "SANDBOX_READY":
      debugLog("Sandbox is ready");
      isSandboxReady = true;

      // Load model ID from storage
      chrome.storage.local.get(["selectedModelId"], (result) => {
        // Initialize the model
        sandboxFrame.contentWindow.postMessage(
          {
            type: "INIT",
            modelId: result.selectedModelId,
          },
          "*"
        );
      });
      break;

    case "MODEL_LOADED":
      debugLog("Model loaded:", message.success, "Model ID:", message.modelId);
      isModelLoaded = message.success;

      if (message.success) {
        currentModelId = message.modelId;

        // Update required frames based on model
        if (message.frameCount !== undefined) {
          REQUIRED_FRAMES = message.frameCount;
          debugLog(
            `Updated required frames to ${REQUIRED_FRAMES} for model ${currentModelId}`
          );
        }

        // Update thresholds based on model's defaultThreshold
        if (message.defaultThreshold !== undefined) {
          AD_PROBABILITY_THRESHOLD = message.defaultThreshold;
          PROBABILITY_THRESHOLD_HIGH = message.defaultThreshold + 0.05;
          PROBABILITY_THRESHOLD_LOW = message.defaultThreshold - 0.05;
          debugLog(
            `Updated thresholds for model ${currentModelId}: ` +
              `Main=${AD_PROBABILITY_THRESHOLD}, High=${PROBABILITY_THRESHOLD_HIGH}, Low=${PROBABILITY_THRESHOLD_LOW}`
          );
        }
      } else {
        console.error("Failed to load model:", message.error);
      }
      break;

    case "INFERENCE_RESULT":
      // Check if extension is still enabled before processing results
      if (!ENABLED) {
        return;
      }

      const requestId = message.requestId;
      const callback = pendingRequests.get(requestId);

      if (callback) {
        callback(message);
        pendingRequests.delete(requestId);
      }
      break;
  }
}

// Create overlay to indicate advertisement
function createAdOverlay(videoElement) {
  // Get the video container
  const videoContainer =
    videoElement.closest(".html5-video-container") ||
    videoElement.parentElement;

  if (!videoContainer) {
    debugLog("Could not find video container");
    return null;
  }

  // Create overlay element
  const overlay = document.createElement("div");
  overlay.id = "ad-detector-overlay";
  overlay.style.position = "absolute";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.background =
    "linear-gradient(135deg, rgba(255,0,0,0.1) 0%, rgba(255,0,0,0.2) 100%)";
  overlay.style.pointerEvents = "none";
  overlay.style.zIndex = "9999";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.backdropFilter = "blur(2px)";
  overlay.style.transition = "all 0.3s ease-in-out";

  // Create container for label and animated border
  const labelContainer = document.createElement("div");
  labelContainer.style.top = "36px";
  labelContainer.style.position = "relative";
  labelContainer.style.padding = "12px 24px";
  labelContainer.style.border = "2px solid rgba(255, 0, 0, 0.8)";
  labelContainer.style.borderRadius = "6px";
  labelContainer.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  labelContainer.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
  labelContainer.style.animation = "pulse 2s infinite";

  // Add animation styling
  const style = document.createElement("style");
  style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.5); }
            70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(255, 0, 0, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 0, 0, 0); }
        }
    `;
  document.head.appendChild(style);

  // Add label
  const label = document.createElement("div");
  label.textContent = "ADVERTISEMENT DETECTED";
  label.style.color = "white";
  label.style.fontFamily = "Arial, sans-serif";
  label.style.fontWeight = "bold";
  label.style.fontSize = "20px";
  label.style.textAlign = "center";
  label.style.textShadow = "1px 1px 3px rgba(0, 0, 0, 0.5)";
  label.style.letterSpacing = "1px";
  labelContainer.appendChild(label);

  // Add to overlay
  overlay.appendChild(labelContainer);

  // Add probability indicator
  const probIndicator = document.createElement("div");
  probIndicator.id = "ad-probability-indicator";
  probIndicator.style.position = "absolute";
  probIndicator.style.top = "10px";
  probIndicator.style.right = "10px";
  probIndicator.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  probIndicator.style.color = "white";
  probIndicator.style.padding = "6px 10px";
  probIndicator.style.borderRadius = "4px";
  probIndicator.style.fontFamily = "monospace";
  probIndicator.style.fontSize = "12px";
  probIndicator.style.border = "1px solid rgba(255, 255, 255, 0.2)";
  overlay.appendChild(probIndicator);

  // Add model indicator
  const modelIndicator = document.createElement("div");
  modelIndicator.id = "model-indicator";
  modelIndicator.style.position = "absolute";
  modelIndicator.style.top = "10px";
  modelIndicator.style.left = "10px";
  modelIndicator.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  modelIndicator.style.color = "white";
  modelIndicator.style.padding = "6px 10px";
  modelIndicator.style.borderRadius = "4px";
  modelIndicator.style.fontFamily = "monospace";
  modelIndicator.style.fontSize = "12px";
  modelIndicator.style.border = "1px solid rgba(255, 255, 255, 0.2)";
  modelIndicator.textContent = `Model: ${currentModelId || "Unknown"}`;
  overlay.appendChild(modelIndicator);

  // Add "Powered by" badge
  const badge = document.createElement("div");
  badge.style.position = "absolute";
  badge.style.top = "50px";
  badge.style.right = "10px";
  badge.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  badge.style.color = "rgba(255, 255, 255, 0.7)";
  badge.style.padding = "4px 8px";
  badge.style.borderRadius = "4px";
  badge.style.fontSize = "10px";
  badge.textContent = "Powered by Ad Detector";
  overlay.appendChild(badge);

  // Add to container
  videoContainer.appendChild(overlay);

  return overlay;
}

// Update or show ad overlay
function showAdOverlay(videoElement, probability) {
  // Check if overlay exists
  let overlay = document.getElementById("ad-detector-overlay");

  if (!overlay) {
    overlay = createAdOverlay(videoElement);
    if (!overlay) return;
  } else {
    overlay.style.display = "flex";
  }

  // Update probability indicator
  const probIndicator = document.getElementById("ad-probability-indicator");
  if (probIndicator) {
    // Format the probability percentage
    const percentage = (probability * 100).toFixed(1);

    // Color coding based on confidence level
    let color;
    if (probability > 0.3) {
      color = "#ff4d4d"; // High confidence (red)
    } else if (probability > 0.2) {
      color = "#ff9933"; // Medium-high confidence (orange)
    } else {
      color = "#ffcc00"; // Medium confidence (yellow)
    }

    probIndicator.innerHTML = `
            <div style="display: flex; align-items: center;">
                <span style="margin-right: 8px;">Ad confidence:</span>
                <span style="color: ${color}; font-weight: bold;">${percentage}%</span>
            </div>
        `;
  }

  // Update model indicator
  const modelIndicator = document.getElementById("model-indicator");
  if (modelIndicator) {
    modelIndicator.textContent = `Model: ${currentModelId || "Unknown"}`;
  }

  isAdOverlayVisible = true;
}

// Hide ad overlay
function hideAdOverlay() {
  const overlay = document.getElementById("ad-detector-overlay");
  if (overlay) {
    overlay.remove(); // Remove from DOM instead of just hiding
  }
  isAdOverlayVisible = false;
}

// Update probability history with new value
function updateProbabilityHistory(probability) {
  // Add new probability to history
  PROBABILITY_HISTORY.push(probability);

  // Keep history at proper size
  if (PROBABILITY_HISTORY.length > PROBABILITY_HISTORY_SIZE) {
    PROBABILITY_HISTORY.shift(); // Remove oldest value
  }
}

// Get smoothed prediction based on probability history
function getSmoothedPrediction() {
  // If we don't have enough history, use the latest prediction
  if (PROBABILITY_HISTORY.length === 0) {
    return {
      isAd: lastProbability >= AD_PROBABILITY_THRESHOLD,
      confidence: lastProbability,
    };
  }

  // Calculate average probability
  const avgProbability =
    PROBABILITY_HISTORY.reduce((sum, prob) => sum + prob, 0) /
    PROBABILITY_HISTORY.length;

  // Apply smoothing logic with hysteresis
  // This prevents flickering between ad/non-ad states
  let isAd;

  if (isAdOverlayVisible) {
    // If currently showing ad overlay, only switch to non-ad if confidence is low
    isAd = avgProbability >= PROBABILITY_THRESHOLD_LOW;
  } else {
    // If not showing ad overlay, only switch to ad if confidence is high
    isAd = avgProbability >= PROBABILITY_THRESHOLD_HIGH;
  }

  return { isAd, confidence: avgProbability };
}

// Extract frames from video element
async function extractFrames(videoElement, numFrames = REQUIRED_FRAMES) {
  if (!videoElement || videoElement.readyState < 2) {
    // HAVE_CURRENT_DATA
    return null;
  }

  debugLog(`Extracting ${numFrames} frames`);

  // Create canvas for frame extraction
  const canvas = document.createElement("canvas");
  // Set willReadFrequently attribute for better performance
  canvas.willReadFrequently = true;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  canvas.width = FRAME_SIZE;
  canvas.height = FRAME_SIZE;

  try {
    const frames = [];

    // For standard CNN (numFrames = 1), we only need one frame
    // For temporal CNN (numFrames > 1), we need multiple frames
    for (let i = 0; i < numFrames; i++) {
      // Draw current video frame to canvas
      ctx.drawImage(videoElement, 0, 0, FRAME_SIZE, FRAME_SIZE);

      // Get image data
      const imageData = ctx.getImageData(0, 0, FRAME_SIZE, FRAME_SIZE);

      // Normalize pixel data to [-1, 1] range (matching model training normalization)
      const normalizedFrame = normalizeFrameData(imageData.data);

      frames.push(normalizedFrame);

      // In a real implementation with actual sequential frames,
      // we might wait for the next frame or sample frames at specific intervals
      // For now, we'll just extract the same frame multiple times if needed
      await new Promise((resolve) => setTimeout(resolve, 5));
    }

    return frames;
  } catch (error) {
    console.error("Frame extraction error:", error);
    return null;
  }
}

// Normalize frame data to match model input requirements
function normalizeFrameData(data) {
  // Create normalized arrays for RGB channels
  const frameSize = FRAME_SIZE * FRAME_SIZE;
  const normalizedData = new Array(3 * frameSize);

  // Extract and normalize RGB channels (RGBA → RGB)
  // Convert from [0-255] to [-1, 1] range to match model training
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    // Red channel
    normalizedData[j] = data[i] / 127.5 - 1;
    // Green channel
    normalizedData[j + frameSize] = data[i + 1] / 127.5 - 1;
    // Blue channel
    normalizedData[j + 2 * frameSize] = data[i + 2] / 127.5 - 1;
  }

  return normalizedData;
}

// Process video frames with the model
async function processCurrentVideo() {
  debugLog(
    `processCurrentVideo called - ENABLED: ${ENABLED}, isModelLoaded: ${isModelLoaded}, currentVideoElement: ${!!currentVideoElement}, processingFrames: ${processingFrames}`
  );

  if (!ENABLED || !isModelLoaded || !currentVideoElement || processingFrames)
    return;

  processingFrames = true;

  try {
    // Extract frames from video - use the REQUIRED_FRAMES which is updated based on model
    const frames = await extractFrames(currentVideoElement, REQUIRED_FRAMES);

    if (!frames) {
      debugLog("Failed to extract frames");
      return;
    }

    // Create a unique request ID
    const requestId = requestIdCounter++;

    // Set up promise for async response
    const resultPromise = new Promise((resolve) => {
      pendingRequests.set(requestId, resolve);

      // Add timeout to clean up if no response
      setTimeout(() => {
        if (pendingRequests.has(requestId)) {
          pendingRequests.delete(requestId);
          resolve({ success: false, error: "Request timeout" });
        }
      }, 5000);
    });

    // Keep track of the start time
    const processingStartTime = performance.now();

    sandboxFrame.contentWindow.postMessage(
      {
        type: "PROCESS_FRAMES",
        requestId: requestId,
        frames: frames,
      },
      "*"
    );

    // Wait for result
    const result = await resultPromise;

    // Keep track of the end time
    const processingEndTime = performance.now();

    // Calculate the total duration
    const totalProcessingTime = processingEndTime - processingStartTime;

    if (result.success) {
      lastProbability = result.probability;
      debugLog(
        `Ad probability: ${(result.probability * 100).toFixed(2)}% | ` +
          `Inference: ${
            result.inferenceTime ? result.inferenceTime.toFixed(2) : "N/A"
          }ms | ` +
          `Total: ${totalProcessingTime.toFixed(2)}ms` +
          `${result.modelId ? ` (Model: ${result.modelId})` : ""}`
      );

      // Add to probability history
      updateProbabilityHistory(result.probability);

      // Get smoothed prediction based on recent history
      const { isAd, confidence } = getSmoothedPrediction();
      debugLog(
        `Smoothed prediction: isAd=${isAd}, confidence=${confidence.toFixed(2)}`
      );

      // Update UI based on smoothed result
      if (isAd) {
        showAdOverlay(currentVideoElement, confidence);
      } else if (isAdOverlayVisible) {
        hideAdOverlay();
      }
    } else {
      debugLog("Inference failed:", result.error);
    }
  } catch (error) {
    console.error("Error processing video:", error);
  } finally {
    processingFrames = false;
  }
}

// Change the current model
function changeModel(modelId) {
  debugLog(`Changing model to: ${modelId}`);

  if (isSandboxReady && sandboxFrame) {
    sandboxFrame.contentWindow.postMessage(
      {
        type: "CHANGE_MODEL",
        modelId: modelId,
      },
      "*"
    );
  } else {
    debugLog("Cannot change model: sandbox not ready");
  }
}

// Initialize model and start frame detection
function startDetection(videoElement) {
  if (currentVideoElement === videoElement) return;

  debugLog("Starting detection on video element");

  // Stop previous detection if running
  stopDetection();

  debugLog("Past stopDetection();");

  // Set current video element
  currentVideoElement = videoElement;

  debugLog(!!currentVideoElement);

  // Start regular frame processing
  detectionInterval = setInterval(() => {
    if (videoElement.paused || videoElement.ended) return;
    processCurrentVideo();
  }, FRAME_INTERVAL);

  debugLog(
    `Detection interval started: ${!!detectionInterval}, video paused: ${
      videoElement.paused
    }, video ended: ${videoElement.ended}`
  );

  // Set up event listeners
  videoElement.addEventListener("pause", onVideoPause);
  videoElement.addEventListener("play", onVideoPlay);
  videoElement.addEventListener("seeked", onVideoSeeked);
}

// Handle video pause event
function onVideoPause() {
  debugLog("Video paused");
}

// Handle video play event
function onVideoPlay() {
  debugLog("Video playing");
  processCurrentVideo(); // Process immediately when video starts
}

// Handle video seek event
function onVideoSeeked() {
  debugLog("Video seeked");
  processCurrentVideo(); // Process immediately after seeking
}

function stopDetection() {
  if (!currentVideoElement) return;

  debugLog("Stopping detection");

  // Clear interval
  if (detectionInterval) {
    clearInterval(detectionInterval);
    detectionInterval = null;
  }

  // Remove event listeners
  currentVideoElement.removeEventListener("pause", onVideoPause);
  currentVideoElement.removeEventListener("play", onVideoPlay);
  currentVideoElement.removeEventListener("seeked", onVideoSeeked);

  // Hide overlay
  hideAdOverlay();

  // Reset processing state
  processingFrames = false;

  // Reset state
  currentVideoElement = null;
}

// Find and monitor YouTube video
function findYouTubeVideo() {
  // Don't look for videos if extension is disabled
  if (!ENABLED) {
    debugLog("Extension disabled, not looking for video");
    return false;
  }

  debugLog("Looking for YouTube video");

  const videoElement = document.querySelector("video.html5-main-video");

  if (videoElement && videoElement.readyState >= 2) {
    debugLog("Found YouTube video element");
    startDetection(videoElement);
    return true;
  }

  return false;
}

// Initialize extension
function initialize() {
  debugLog("Initializing Ad Detector Extension");

  // Create sandbox iframe for model
  createSandboxFrame();

  // Try to find YouTube video
  if (!findYouTubeVideo()) {
    // Retry after a short delay
    setTimeout(findYouTubeVideo, 2000);
  }

  // Set up mutation observer to detect new videos
  const observer = new MutationObserver((mutations) => {
    // Only look for videos if extension is enabled
    if (
      ENABLED &&
      (!currentVideoElement || currentVideoElement.parentNode === null)
    ) {
      findYouTubeVideo();
    }
  });

  // Observe document for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Listen for messages from background script or popup
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "UPDATE_DEBUG") {
      DEBUG = message.debug;
      debugLog("Debug mode updated:", DEBUG);
    } else if (message.type === "SET_ENABLED") {
      ENABLED = message.enabled;
      debugLog("Extension enabled state updated:", ENABLED);

      if (!ENABLED) {
        // Clean up if disabled - use stopDetection for complete cleanup
        stopDetection();
        // Clear any pending inference requests
        pendingRequests.clear();
      } else {
        // Restart detection if enabled - find video element again
        findYouTubeVideo();
      }
    } else if (message.type === "CHANGE_MODEL") {
      // Handle model change request
      if (message.modelId && message.modelId !== currentModelId) {
        changeModel(message.modelId);
      }
    }
  });

  // Load saved settings
  chrome.storage.local.get(
    ["debug", "enabled", "selectedModelId"],
    (result) => {
      if (result.debug !== undefined) {
        DEBUG = result.debug;
        debugLog("Debug mode loaded from settings:", DEBUG);
      }

      if (result.enabled !== undefined) {
        ENABLED = result.enabled;
        debugLog("Enabled state loaded from settings:", ENABLED);
      }

      // Current model ID is loaded when sandbox is ready
    }
  );
}

// Start initialization
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}

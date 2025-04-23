// content-script.js - Runs on YouTube pages to detect video elements and add overlay

console.log("Ad Detector Extension: Content script loaded");

enum OverlayType {
  VIDEO,
  AD
}

function getLabel(overlayType: OverlayType): string {
  switch (overlayType) {
    case OverlayType.VIDEO: return "VIDEO";
    case OverlayType.AD: return "AD";
  }
}

function getGradient(overlayType: OverlayType): string {
  switch (overlayType) {
    case OverlayType.VIDEO: return "linear-gradient(330deg,rgba(96, 35, 226, 1) 0%, rgba(198, 139, 231, 1) 100%)";
    case OverlayType.AD: return "linear-gradient(330deg,rgb(225, 117, 117) 0%, rgb(224, 31, 31) 100%)";
  }
}

function getId(overlayType: OverlayType): string {
  switch (overlayType) {
    case OverlayType.VIDEO: return "video-detector-overlay";
    case OverlayType.AD: return "ad-detector-overlay";
  }
}

// Function to create and position an overlay on top of the video
function createOverlay(overlayType: OverlayType) {
  // Create overlay element
  const overlay = document.createElement("div");
  overlay.id = getId(overlayType);
  overlay.style.position = "absolute";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.boxSizing = "border-box";
  overlay.style.pointerEvents = "none"; // Allow clicks to pass through
  overlay.style.zIndex = "9999";

  // Add a label to indicate this is from our extension
  const label = document.createElement("div");
  label.textContent = getLabel(overlayType)
  label.style.position = "absolute";
  label.style.top = "10px";
  label.style.right = "10px";
  label.style.background = getGradient(overlayType);
  label.style.color = "white";
  label.style.padding = "5px 10px";
  label.style.borderRadius = "4px";
  label.style.fontWeight = "bold";
  label.style.fontFamily = "Arial, sans-serif";
  label.style.fontSize = "14px";

  overlay.appendChild(label);

  return overlay;
}

// Function to detect YouTube video element and add overlay
function detectAndAddOverlay(overlayType: OverlayType) {
  console.log("Ad Detector Extension: Checking for video elements");

  // Try to find the primary video element on YouTube
  const videoElement = document.querySelector("video.html5-main-video");

  if (videoElement) {
    console.log("Ad Detector Extension: Video element found!", videoElement);

    // Find the video container to position our overlay
    const videoContainer = document.querySelector(".html5-video-container");
    if (videoContainer) {
      // Check if we already added an overlay to prevent duplicates
      if (!document.getElementById(getId(overlayType))) {
        // Create and add overlay
        const overlay = createOverlay(overlayType);
        // Add the overlay to the container
        videoContainer.appendChild(overlay);
      }

      return videoElement;
    }
  } else {
    console.log("Ad Detector Extension: No video element found yet");
    return null;
  }
}

// Function to remove overlay (can be called when ads end)
function removeOverlay(overlayType: OverlayType) {
  const overlay = document.getElementById(getId(overlayType));
  if (overlay) {
    overlay.remove();
    console.log("Ad Detector Extension: Overlay removed");
  }
}

// Detect video element on page load
function initVideoDetection() {
  // YouTube loads its content dynamically, so we need to wait a bit
  setTimeout(() => {
    const video = detectAndAddOverlay(OverlayType.VIDEO);

    if (video) {
      console.log(
        "Ad Detector Extension: Successfully detected video and added overlay"
      );
    } else {
      console.log("Ad Detector Extension: Retrying video detection...");
      // If video wasn't found, retry after a longer delay
      setTimeout(detectAndAddOverlay, 2000);
    }
  }, 1000);
}

// Initialize detection when the page has loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initVideoDetection);
} else {
  initVideoDetection();
}

// Also detect videos when the page content changes
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.addedNodes.length) {
      detectAndAddOverlay(OverlayType.VIDEO);
      break;
    }
  }
});

// Start observing the document body for DOM changes
observer.observe(document.body, {
  childList: true,
  subtree: true,
});

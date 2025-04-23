// content-script.js - Runs on YouTube pages to detect video elements and add overlay

console.log("Ad Detector Extension: Content script loaded");

// Function to create and position an overlay on top of the video
function createOverlay(videoElement) {
  // Create overlay element
  const overlay = document.createElement("div");
  overlay.id = "ad-detector-overlay";
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
  label.textContent = "VIDEO";
  label.style.position = "absolute";
  label.style.top = "10px";
  label.style.right = "10px";
  label.style.background =
    "linear-gradient(330deg,rgba(96, 35, 226, 1) 0%, rgba(198, 139, 231, 1) 100%)";
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
function detectAndAddOverlay() {
  console.log("Ad Detector Extension: Checking for video elements");

  // Try to find the primary video element on YouTube
  const videoElement = document.querySelector("video.html5-main-video");

  if (videoElement) {
    console.log("Ad Detector Extension: Video element found!", videoElement);

    // Find the video container to position our overlay
    const videoContainer = document.querySelector(".html5-video-container");
    if (videoContainer) {
      // Check if we already added an overlay to prevent duplicates
      if (!document.getElementById("ad-detector-overlay")) {
        // Create and add overlay
        const overlay = createOverlay(videoElement);
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
function removeOverlay() {
  const overlay = document.getElementById("ad-detector-overlay");
  if (overlay) {
    overlay.remove();
    console.log("Ad Detector Extension: Overlay removed");
  }
}

// Detect video element on page load
function initVideoDetection() {
  // YouTube loads its content dynamically, so we need to wait a bit
  setTimeout(() => {
    const video = detectAndAddOverlay();

    if (video) {
      console.log(
        "Ad Detector Extension: Successfully detected video and added overlay"
      );

      // Set up a resize observer to ensure the overlay maintains the correct size
      // when the video player changes dimensions
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const overlay = document.getElementById("ad-detector-overlay");
          if (overlay) {
            overlay.style.width = entry.contentRect.width + "px";
            overlay.style.height = entry.contentRect.height + "px";
            console.log(
              "Ad Detector Extension: Overlay resized to",
              entry.contentRect.width + "x" + entry.contentRect.height
            );
          }
        }
      });

      // Observe the video element for size changes
      resizeObserver.observe(video);

      // Example listener for when the video starts playing
      video.addEventListener("play", () => {
        console.log("Ad Detector Extension: Video started playing");
        // Make sure our overlay is still positioned correctly after play starts
        // as YouTube might adjust the video size
        setTimeout(() => {
          const overlay = document.getElementById("ad-detector-overlay");
          if (overlay) {
            overlay.style.height = video.clientHeight + "px";
            overlay.style.width = video.clientWidth + "px";
          }
        }, 500);

        // For demonstration purposes, remove the overlay after 5 seconds
        // In a real implementation, you would remove it when your model determines it's not an ad
        /*
        setTimeout(() => {
          removeOverlay();
        }, 5000);
        */
      });
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
      detectAndAddOverlay();
      break;
    }
  }
});

// Start observing the document body for DOM changes
observer.observe(document.body, {
  childList: true,
  subtree: true,
});

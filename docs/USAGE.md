# User Guide - Ad Detector Extension

## Overview

The Ad Detector Extension is a Chrome browser extension that automatically identifies advertisements within YouTube videos using machine learning. When an advertisement is detected, the extension displays a visual overlay to notify you.

## Installation

### From Chrome Web Store (Recommended)

1. Visit the [Ad Detector Extension page](https://chrome.google.com/webstore/detail/ad-detector-extension/[extension-id]) on the Chrome Web Store
2. Click the "Add to Chrome" button
3. Review the permissions and click "Add extension"

### Manual Installation (Developer Mode)

If you prefer to install the extension manually:

1. Download the latest release from the [GitHub releases page](https://github.com/bindothorpe/onnx-ad-detection-extension/releases)
2. Extract the ZIP file to a folder on your computer
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" using the toggle in the top-right corner
5. Click "Load unpacked" and select the extracted folder

## Features

### Automatic Ad Detection

The extension automatically analyzes YouTube videos as you watch them and identifies advertisement segments based on visual patterns. This works for:

- Mid-roll ads embedded in longer videos
- Sponsored content segments
- Promotional content within the video

When an advertisement is detected, a semi-transparent red overlay will appear with the text "ADVERTISEMENT DETECTED".

### Customization

To access the extension's settings:

1. Click on the Ad Detector icon in your Chrome toolbar
2. The popup menu offers the following options:
   - **Enable/Disable Detection**: Toggle ad detection on or off
   - **Enable Debug Logging**: Enable detailed logging (useful for troubleshooting)

## How It Works

The Ad Detector uses a machine learning model to analyze video frames in real-time:

1. The extension extracts frames from the YouTube video player
2. These frames are processed by an ONNX neural network model
3. The model calculates the probability that the current segment is an advertisement
4. If the probability exceeds a threshold, the overlay is displayed

All processing happens locally on your device - no video data is sent to external servers.

## Limitations

Please be aware of the following limitations:

- **False Positives**: The extension may occasionally identify regular content as advertisements, especially in videos with rapid scene changes or commercial-like visuals.
- **False Negatives**: Some advertisements may not be detected, particularly if they are visually similar to regular content.
- **Performance Impact**: On lower-end devices, the extension may cause slight performance degradation when watching higher-resolution videos.
- **Browser Compatibility**: The extension is designed for Chrome and Chromium-based browsers only.

## Troubleshooting

### Extension Not Detecting Ads

If the extension isn't detecting advertisements:

1. Ensure the extension is enabled (check the popup menu)
2. Refresh the YouTube page you're viewing
3. Make sure the video is playing (detection pauses when video is paused)
4. Try a different video to see if the issue persists

### High CPU Usage

If you notice high CPU usage while the extension is active:

1. Disable debug logging in the extension settings
2. Try watching videos at a lower resolution
3. Temporarily disable the extension for specific videos that cause issues

### Extension Not Working At All

If the extension appears completely non-functional:

1. Check if the extension is enabled in Chrome's extension manager
2. Ensure you have the latest version of Chrome
3. Try reinstalling the extension
4. Check your browser console for error messages (right-click anywhere on the page, select "Inspect", then go to the "Console" tab)

## Privacy

The Ad Detector Extension:

- Does NOT collect or transmit any personal data
- Does NOT send video content to any external servers
- Processes all video analysis locally on your device
- Does NOT track your browsing history or viewing habits

## Feedback and Support

If you encounter issues or have suggestions for improvement:

- Submit issues on our [GitHub Issues page](https://github.com/bindothorpe/onnx-ad-detection-extension/issues)
- For detailed bug reports, please include:
  - Your browser version
  - Extension version
  - Steps to reproduce the issue
  - Any error messages from the console

## Acknowledgements

This extension was developed as part of a bachelor's thesis project by Bindo Thorpe, exploring techniques for automatic advertisement detection in video streams using machine learning.
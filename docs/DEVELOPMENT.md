# Development Guide

This document provides instructions for developers who want to contribute to or modify the ONNX Ad Detection Extension.

## Project Overview

The ONNX Ad Detection Extension is a Chrome extension that uses machine learning to detect advertisements in YouTube videos. It leverages an ONNX model to analyze video frames and identify commercial content in real-time.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (v6 or higher)
- [Chrome](https://www.google.com/chrome/) browser

## Project Structure

```
/
├── src/                        # All source code
│   ├── background/             # Background script
│   │   └── index.js            # Service worker 
│   ├── content/                # Content scripts
│   │   └── index.js            # YouTube video processing
│   ├── popup/                  # Popup UI
│   │   ├── index.js            # Popup functionality
│   │   └── styles.css          # Popup styling
│   ├── model/                  # Model handling
│   │   ├── detector.js         # Ad detection implementation
│   │   └── utils.js            # Model utilities
│   └── utils/                  # Shared utilities
│       └── index.js            # Common utility functions
├── public/                     # Static assets
│   ├── manifest.json           # Extension manifest
│   ├── popup.html              # Popup UI HTML
│   ├── model.html              # Sandboxed model page
│   ├── icons/                  # Extension icons
│   └── assets/                 # Organized assets
│       ├── models/             # ML models
│       └── onnx/               # ONNX runtime files
├── config/                     # Build configuration
├── tests/                      # Testing scripts
└── docs/                       # Documentation
```

## Development Setup

1. Clone the repository:
   ```
   git clone https://github.com/bindothorpe/onnx-ad-detection-extension.git
   cd onnx-ad-detection-extension
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run watch
   ```

4. Load the extension in Chrome:
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked" 
   - Select the `build` directory in your project folder

5. Make changes to the source code and webpack will automatically rebuild. Refresh the extension in Chrome to see your changes.

## Building for Production

To create a production build:

```
npm run build
```

This will generate optimized files in the `build` directory.

## Architecture Overview

### Content Script Flow

1. The content script (`src/content/index.js`) runs on YouTube pages and:
   - Identifies video elements
   - Extracts frames at regular intervals 
   - Sends frames to the sandboxed model page
   - Displays overlay UI when ads are detected

2. The sandboxed model page (`public/model.html` and `src/model/detector.js`):
   - Loads the ONNX model securely
   - Processes video frames 
   - Returns probability scores to the content script

3. The background script (`src/background/index.js`):
   - Manages extension state
   - Handles communication between popup and content scripts

### Model Architecture

The ad detection model is based on a neural network trained to identify visual patterns in advertisements. It:

- Takes a sequence of video frames as input
- Processes them through a convolutional neural network
- Outputs a probability score (0-1) indicating ad likelihood

The model expects input in the format: `[batch_size, frames, channels, height, width]` where:
- `batch_size` is 1
- `frames` is 5 (temporal window size)
- `channels` is 3 (RGB)
- `height` and `width` are 224 (frame dimensions)

## Working with the ONNX Model

The extension uses ONNX Runtime Web for inference. The model is loaded in a sandboxed iframe for security.

To update the model:
1. Place your new ONNX model file in `public/assets/models/`
2. Update the `MODEL_PATH` in `src/model/detector.js` if necessary
3. Update the input/output processing logic if your model has different requirements

To test the model independently:
1. Open the extension
2. Navigate to `model-test.html` (development only)
3. Use the test page to verify model loading and inference

## Debugging Tips

- Enable debug mode in the extension popup for detailed console logs
- Use Chrome DevTools to inspect the content script and background service worker
- Check the sandbox console by right-clicking the extension, clicking "Inspect popup", and navigating to the iframe console

## Contributing

1. Create a new branch for your feature or bugfix
2. Make your changes
3. Test thoroughly on different YouTube videos
4. Submit a pull request with a clear description of your changes

## Common Issues

- **WASM loading fails**: Make sure your server correctly serves `.wasm` files with the proper MIME type.
- **Model inference is slow**: Check if WebAssembly SIMD is available in your browser, as it significantly improves performance.
- **Video frame extraction errors**: These typically occur when trying to access video data on cross-origin frames or when using older browser versions.
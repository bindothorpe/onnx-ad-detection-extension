# ONNX Ad Detection Extension

A Chrome extension for automatic advertisement detection in video content using machine learning. This project is part of a bachelor's thesis exploring real-time ad detection techniques.

## Overview

This extension uses a pre-trained ONNX model to analyze video content and identify advertisement segments in real-time. By processing video frames locally within the browser, the extension can detect ads without relying on external services or network requests.

## Technical Approach

The extension loads an ONNX model using ONNX Runtime Web, which allows for efficient inference directly in the browser. The model was trained to recognize visual patterns characteristic of advertisements and can process video frames to make frame-by-frame predictions.

Key components:
- ONNX Runtime for WebAssembly-accelerated inference
- Chrome Extension API for browser integration
- Video frame extraction and processing

## Repository Structure

```
/
├── src/                        # All source code
│   ├── background/             # Background script
│   ├── content/                # Content scripts
│   ├── popup/                  # Popup UI
│   ├── model/                  # Model handling
│   └── utils/                  # Shared utilities
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
├── docs/                       # Documentation
│   ├── DEVELOPMENT.md          # Developer guide
│   └── USAGE.md                # User guide
└── README.md                   # This file
```

## Installation

### Development Setup

1. Clone the repository:
   ```
   git clone https://github.com/bindothorpe/onnx-ad-detection-extension.git
   cd onnx-ad-detection-extension
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Build the extension:
   ```
   npm run build
   ```

4. Load the extension in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `build` directory

## Documentation

Comprehensive documentation is available in the `docs` directory:

- [Development Guide](docs/DEVELOPMENT.md) - Setup instructions and information for developers
- [Usage Guide](docs/USAGE.md) - Information for end users on how to use the extension

## Current Status

This project is currently a work in progress. The core functionality of loading and running the ONNX model is implemented, but video frame extraction and real-time analysis features are still under development.

## Planned Features

- Video frame extraction from YouTube videos
- Real-time advertisement detection
- User interface for visualizing detection results
- Options for customizing detection behavior

## Acknowledgements

This project is based on [browser-based-imagen](https://github.com/Lewington-pitsos/browser-based-imagen), which provided the foundational structure for running ML models in a Chrome extension.

## Bachelor's Thesis

This extension was developed as part of a bachelor's thesis exploring techniques for automatic advertisement detection in video streams. The thesis investigates the use of machine learning models for identifying advertising content based on visual and temporal features.
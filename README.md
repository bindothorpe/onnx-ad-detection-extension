# ONNX Ad Detection Extension

<div align="center">
  <img src="public/icons/icon128.png" alt="ONNX Ad Detection Extension" width="128" height="128">
  
  # ONNX Ad Detection Extension
  
  **Automatically detects advertisements in YouTube videos using machine learning**
  
  [![GitHub release](https://img.shields.io/github/release/bindothorpe/onnx-ad-detection-extension.svg)](https://github.com/bindothorpe/onnx-ad-detection-extension/releases)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
</div>

A Chrome extension for automatic advertisement detection in YouTube videos using machine learning. This project is part of a bachelor's thesis exploring real-time ad detection techniques using ONNX neural network models.

## Overview

This extension uses pre-trained ONNX models to analyze video content and identify advertisement segments in real-time. By processing video frames locally within the browser, the extension can detect ads without relying on external services or network requests. The extension is functional but detection accuracy is still too low to be used for reliable detection.

## Technical Approach

The extension loads ONNX models using ONNX Runtime Web, which allows for efficient inference directly in the browser. Multiple model architectures are supported, from lightweight MobileNet models to more accurate EfficientNet and ResNet variants.

Key components:
- ONNX Runtime for WebAssembly-accelerated inference
- Chrome Extension API for browser integration
- Real-time video frame extraction and processing
- Multiple model support

## Implemented Features

The following features are currently functional, though detection accuracy is still low:

### Core Functionality
- **Real-time advertisement detection** - Analyzes video frames as you watch
- **Visual overlay notifications** - Semi-transparent overlay appears when ads are detected
- **Multiple model support** - Choose from various ONNX models with different accuracy/performance trade-offs
- **Configurable detection settings** - Adjust thresholds and enable/disable detection
- **Debug logging** - Detailed logging for troubleshooting and development

### Supported Models
- Custom temporal model (analyzes 5 consecutive frames)
- ResNet-18 and ResNet-50 (single frame analysis)
- EfficientNetV2 Small/Medium/Large variants
- MobileNetV3 Small (lightweight option)

### User Interface
- **Extension popup** - Control settings and model selection
- **Detection overlay** - Real-time probability display and model information
- **Status indicators** - Visual feedback on detection confidence

**Note**: While all features are implemented and functional, detection accuracy varies and may produce false positives/negatives.

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
├── docs/                       # Documentation
│   ├── DEVELOPMENT.md          # Developer guide
│   └── USAGE.md                # User guide
└── README.md                   # This file
```

## Installation

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/bindothorpe/onnx-ad-detection-extension.git
   cd onnx-ad-detection-extension
   ```

2. Download the ONNX models:
   - Go to the [GitHub releases page](https://github.com/bindothorpe/onnx-ad-detection-extension/releases)
   - Download the latest release zip file containing the ONNX models
   - Extract the zip file
   - Copy the extracted models to `public/assets/models/` directory
   
   **Note**: The models are distributed separately due to their large file size.

3. Install dependencies:
   ```bash
   npm install
   ```

4. Build the extension:
   ```bash
   npm run build
   ```

5. Load the extension in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `build` directory

## Usage

Once installed, the extension automatically:

1. **Detects YouTube videos** - Activates when you visit YouTube
2. **Analyzes video frames** - Processes frames in real-time using the selected model
3. **Shows detection results** - Displays overlay when advertisements are detected
4. **Provides controls** - Click the extension icon to access settings

### Customization

Access settings through the extension popup:
- **Model Selection** - Choose from different ONNX models
- **Enable/Disable Detection** - Toggle ad detection on/off
- **Debug Logging** - Enable detailed console output

## Limitations

Please be aware of the following limitations:

- **Accuracy**: Detection accuracy varies significantly
- **False Positives**: May identify regular content as advertisements
- **False Negatives**: Some advertisements may not be detected
- **Performance**: May impact browser performance on lower-end devices
- **Compatibility**: Designed for Chrome and Chromium-based browsers only

## Documentation

Comprehensive documentation is available in the `docs` directory:

- [Development Guide](docs/DEVELOPMENT.md) - Setup and development information
- [Usage Guide](docs/USAGE.md) - End user instructions

## Acknowledgements

This project was developed as part of a bachelor's thesis by Bindo Thorpe, exploring techniques for automatic advertisement detection in video streams using machine learning.

The project structure is based on [browser-based-imagen](https://github.com/Lewington-pitsos/browser-based-imagen), which provided the foundational Chrome extension architecture for running ML models in the browser.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
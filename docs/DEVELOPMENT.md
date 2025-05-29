# Development Guide

This document provides instructions for developers who want to contribute to or modify the ONNX Ad Detection Extension.

## Project Overview

The ONNX Ad Detection Extension is a Chrome extension that uses machine learning to detect advertisements in YouTube videos. It leverages ONNX models to analyze video frames and identify commercial content in real-time. The extension is functional with all core features implemented, though detection accuracy is currently low and being improved.

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
│   │   └── model-config.js     # Model configuration
│   └── utils/                  # Shared utilities
│       └── index.js            # Common utility functions
├── public/                     # Static assets
│   ├── manifest.json           # Extension manifest
│   ├── popup.html              # Popup UI HTML
│   ├── model.html              # Sandboxed model page
│   ├── icons/                  # Extension icons
│   └── assets/                 # Organized assets
│       ├── models/             # ML models (downloaded separately)
│       └── onnx/               # ONNX runtime files
├── config/                     # Build configuration
└── docs/                       # Documentation
```

## Development Setup

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

4. Start the development server:
   ```bash
   npm run watch
   ```

5. Load the extension in Chrome:
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked" 
   - Select the `build` directory in your project folder

6. Make changes to the source code and webpack will automatically rebuild. Refresh the extension in Chrome to see your changes.

## Building for Production

To create a production build:

```bash
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

The ad detection models are neural networks trained to identify visual patterns in advertisements. The extension supports multiple model types:

- **Temporal models**: Analyze sequences of frames (e.g., 5 consecutive frames)
- **Single-frame models**: Analyze individual frames using architectures like ResNet, EfficientNet, MobileNet

Models expect input in the format: `[batch_size, frames, channels, height, width]` or `[batch_size, channels, height, width]` where:
- `batch_size` is 1
- `frames` is model-dependent (1 for single-frame, 5 for temporal)
- `channels` is 3 (RGB)
- `height` and `width` are 224 (frame dimensions)

## Working with ONNX Models

The extension uses ONNX Runtime Web for inference. Models are loaded in a sandboxed iframe for security.

### Adding New Models

1. Place your ONNX model file in `public/assets/models/`
2. Update the `MODEL_CONFIGS` array in `src/model/model-config.js`:
   ```javascript
   {
     id: "your-model-id",
     name: "Your Model Name",
     path: "assets/models/your_model.onnx",
     type: "standard", // or "temporal"
     frameCount: 1, // or 5 for temporal models
     description: "Description of your model",
     defaultThreshold: 0.8,
   }
   ```
3. Update input/output processing logic in `src/model/detector.js` if your model has different requirements

### Model Performance Testing

To test model performance independently:
1. Open the extension
2. Navigate to `model.html` in the browser
3. Use browser console to test model loading and inference
4. Check inference times and accuracy metrics

## Current Development Status

The extension is functional with all major features implemented:

### ✅ Completed Features
- Real-time video frame extraction
- Multiple ONNX model support
- Model inference in sandboxed environment
- Visual overlay UI for detection results
- Extension popup with settings
- Model switching and configuration
- Debug logging and performance metrics

### 🔄 Areas for Improvement
- **Model Accuracy**: Current models have low accuracy and produce many false positives/negatives
- **Performance Optimization**: Reduce inference time and CPU usage
- **Training Data**: Expand training datasets with more diverse ad examples
- **Temporal Analysis**: Improve multi-frame detection algorithms

### 🎯 Future Enhancements
- Advanced smoothing algorithms for detection stability
- User feedback collection for model improvement
- Support for other video platforms
- Custom model upload functionality

## Debugging Tips

- Enable debug mode in the extension popup for detailed console logs
- Use Chrome DevTools to inspect the content script and background service worker
- Check the sandbox console by right-clicking the extension, clicking "Inspect popup", and navigating to the iframe console
- Monitor inference times and detection probabilities in the overlay

## Testing

### Manual Testing
1. Load the extension in development mode
2. Navigate to YouTube and play various videos
3. Test with known advertisement content
4. Monitor console logs for errors or performance issues
5. Test model switching and settings changes

### Performance Testing
- Monitor CPU usage during video playback
- Check inference times for different models
- Test on various video resolutions and frame rates

## Contributing

1. Create a new branch for your feature or bugfix
2. Make your changes
3. Test thoroughly on different YouTube videos and models
4. Ensure no regressions in existing functionality
5. Submit a pull request with a clear description of your changes

## Common Issues

- **WASM loading fails**: Make sure your server correctly serves `.wasm` files with the proper MIME type
- **Model inference is slow**: Check if WebAssembly SIMD is available in your browser, as it significantly improves performance
- **Video frame extraction errors**: These typically occur when trying to access video data on cross-origin frames or when using older browser versions
- **High false positive rates**: This is a known limitation of the current models and training data

## Model Training (For Advanced Contributors)

If you're interested in improving the models:

1. **Data Collection**: Gather diverse YouTube video samples with manual ad/non-ad annotations
2. **Training Pipeline**: Use frameworks like PyTorch or TensorFlow to train on the collected data
3. **ONNX Export**: Convert trained models to ONNX format for browser compatibility
4. **Validation**: Test models thoroughly before integrating into the extension

For more details on model training, please refer to the research thesis documentation.

## Resources

- [ONNX Runtime Web Documentation](https://onnxruntime.ai/docs/get-started/with-javascript.html)
- [Chrome Extension API Documentation](https://developer.chrome.com/docs/extensions/)
- [WebAssembly Documentation](https://webassembly.org/getting-started/developers-guide/)
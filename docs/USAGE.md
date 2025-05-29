# User Guide - ONNX Ad Detection Extension

## Overview

The ONNX Ad Detection Extension is a Chrome browser extension that automatically identifies advertisements within YouTube videos using machine learning. When an advertisement is detected, the extension displays a visual overlay to notify you.

**Important Note**: The extension is functional but detection accuracy is currently low. You may experience frequent false positives (regular content identified as ads) and false negatives (ads not detected). The models are being improved to achieve better accuracy.

## Installation

### From GitHub Releases

1. Go to the [GitHub releases page](https://github.com/bindothorpe/onnx-ad-detection-extension/releases)
2. Download the latest release zip file
3. Extract the extension files to a folder on your computer
4. Download the ONNX models zip file from the same release
5. Extract the models and place them in the `public/assets/models/` directory
6. Open Chrome and navigate to `chrome://extensions/`
7. Enable "Developer mode" using the toggle in the top-right corner
8. Click "Load unpacked" and select the extracted extension folder

**Note**: Currently only available as a development installation. Chrome Web Store release is planned for the future.

## Features

### Automatic Ad Detection

The extension automatically analyzes YouTube videos as you watch them and attempts to identify advertisement segments based on visual patterns. This includes:

- Mid-roll ads embedded in longer videos
- Sponsored content segments
- Promotional content within the video

When an advertisement is detected, a semi-transparent red overlay will appear with the text "ADVERTISEMENT DETECTED" along with confidence percentage and model information.

### Multiple Model Support

The extension supports several ONNX models with different characteristics:

- **Custom Temporal Model**: Analyzes 5 consecutive frames for temporal patterns
- **ResNet Models**: Single-frame analysis with ResNet-18 and ResNet-50 architectures
- **EfficientNet Models**: Efficient single-frame detection in Small, Medium, and Large variants
- **MobileNet V3**: Lightweight option for better performance on lower-end devices

### Customization

To access the extension's settings:

1. Click on the Ad Detector icon in your Chrome toolbar
2. The popup menu offers the following options:
   - **Model Selection**: Choose from different ONNX models
   - **Enable/Disable Detection**: Toggle ad detection on or off
   - **Enable Debug Logging**: Enable detailed logging (useful for troubleshooting)

## How It Works

The Ad Detector uses machine learning models to analyze video frames in real-time:

1. The extension extracts frames from the YouTube video player
2. These frames are processed by the selected ONNX neural network model
3. The model calculates the probability that the current segment is an advertisement
4. If the probability exceeds a threshold, the overlay is displayed

All processing happens locally on your device - no video data is sent to external servers.

## Limitations

Please be aware of the following significant limitations:

- **Low Accuracy**: Current detection accuracy is low and not suitable for reliable ad blocking
- **High False Positive Rate**: The extension frequently identifies regular content as advertisements, especially in videos with:
  - Rapid scene changes
  - Commercial-like visuals
  - Product reviews or unboxings
  - Gaming content with UI elements
- **False Negatives**: Many advertisements are not detected, particularly if they are visually similar to regular content
- **Performance Impact**: On lower-end devices, the extension may cause performance degradation when watching higher-resolution videos
- **Browser Compatibility**: The extension is designed for Chrome and Chromium-based browsers only
- **YouTube Only**: Currently only works on YouTube videos

## Troubleshooting

### Extension Not Detecting Ads

If the extension isn't detecting advertisements:

1. Ensure the extension is enabled (check the popup menu)
2. Verify that models are properly installed in `public/assets/models/`
3. Refresh the YouTube page you're viewing
4. Make sure the video is playing (detection pauses when video is paused)
5. Try switching to a different model in the extension settings
6. Check browser console for error messages

### Too Many False Positives

If the extension is showing too many false advertisements:

1. Try switching to a different model (some are more conservative)
2. This is a known limitation of the current models
3. Consider disabling the extension for specific types of content that trigger false positives

### High CPU Usage

If you notice high CPU usage while the extension is active:

1. Disable debug logging in the extension settings
2. Switch to the MobileNet V3 Small model for better performance
3. Try watching videos at a lower resolution
4. Temporarily disable the extension for resource-intensive videos

### Extension Not Working At All

If the extension appears completely non-functional:

1. Check if the extension is enabled in Chrome's extension manager
2. Ensure you have the latest version of Chrome
3. Verify that ONNX models are properly installed
4. Try reloading the extension
5. Check your browser console for error messages (F12 → Console tab)
6. Try a fresh installation following the setup steps

### Model Loading Issues

If models fail to load:

1. Ensure model files are in the correct `public/assets/models/` directory
2. Check that model files are not corrupted (re-download if necessary)
3. Verify your browser supports WebAssembly
4. Check browser console for specific error messages

## Privacy

The Ad Detector Extension:

- Does NOT collect or transmit any personal data
- Does NOT send video content to any external servers
- Processes all video analysis locally on your device
- Does NOT track your browsing history or viewing habits
- Does NOT store any information about detected advertisements

## Performance Considerations

To optimize performance:

- Use lighter models (MobileNet V3 Small) on slower devices
- Disable debug logging when not needed
- Consider disabling the extension for live streams or very long videos
- Monitor CPU usage and adjust settings accordingly

## Expected Behavior

Given the current accuracy limitations, you should expect:

- **Many false alarms**: Regular content will often be flagged as advertisements
- **Missed advertisements**: Real ads may not be detected
- **Inconsistent detection**: Same content may be classified differently on repeated views
- **Model variation**: Different models will produce different results on the same content

This extension is currently best used as a research tool or proof-of-concept rather than a practical ad detection solution.

## Feedback and Support

If you encounter issues or have suggestions for improvement:

- Submit issues on our [GitHub Issues page](https://github.com/bindothorpe/onnx-ad-detection-extension/issues)
- For detailed bug reports, please include:
  - Your browser version
  - Extension version
  - Selected model
  - Steps to reproduce the issue
  - Any error messages from the console
  - Video URL where the issue occurred (if public)

## Acknowledgements

This extension was developed as part of a bachelor's thesis project by Bindo Thorpe, exploring techniques for automatic advertisement detection in video streams using machine learning. The current limitations reflect the challenges of real-world ad detection and the ongoing research nature of this project.
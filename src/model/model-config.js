// Model configuration file
// Contains metadata for all available ONNX models

// Define model configurations as a global variable
window.MODEL_CONFIGS = [
  {
    id: "custom",
    name: "Custom Ad Detector",
    path: "assets/models/custom_ad_detector.onnx",
    type: "temporal",
    frameCount: 5,
    description: "Analyzes 5 consecutive frames for temporal patterns in ads",
    defaultThreshold: 0.5,
  },
  {
    id: "resnet18",
    name: "ResNet (18)",
    path: "assets/models/resnet18_ad_detector.onnx",
    type: "standard",
    frameCount: 1,
    description: "Analyzes single frames for visual ad patterns",
    defaultThreshold: 0.5,
  },
  {
    id: "resnet50",
    name: "ResNet (50)",
    path: "assets/models/resnet50_ad_detector.onnx",
    type: "standard",
    frameCount: 1,
    description: "Analyzes single frames for visual ad patterns",
    defaultThreshold: 0.5,
  },
  {
    id: "efficientnet-v2-s",
    name: "EfficientNetV2 (Small)",
    path: "assets/models/efficientnet_v2_s_ad_detector.onnx",
    type: "standard",
    frameCount: 1,
    description: "Analyzes single frames for visual ad patterns",
    defaultThreshold: 0.5,
  },
  {
    id: "efficientnet-v2-m",
    name: "EfficientNetV2 (Medium)",
    path: "assets/models/efficientnet_v2_m_ad_detector.onnx",
    type: "standard",
    frameCount: 1,
    description: "Analyzes single frames for visual ad patterns",
    defaultThreshold: 0.5,
  },
  {
    id: "efficientnet-v2-l",
    name: "EfficientNetV2 (Large)",
    path: "assets/models/efficientnet_v2_l_ad_detector.onnx",
    type: "standard",
    frameCount: 1,
    description: "Analyzes single frames for visual ad patterns",
    defaultThreshold: 0.5,
  },
  {
    id: "mobilenet-v3-small",
    name: "MobileNet V3 (Small)",
    path: "assets/models/mobilenet_v3_small_ad_detector.onnx",
    type: "standard",
    frameCount: 1,
    description: "Analyzes single frames for visual ad patterns",
    defaultThreshold: 0.5,
  },
];

// Default model ID to use if none is specified
window.DEFAULT_MODEL_ID = "custom";

// Function to get model config by ID
window.getModelConfigById = function (id) {
  return (
    window.MODEL_CONFIGS.find((model) => model.id === id) ||
    window.MODEL_CONFIGS[0]
  );
};

// For CommonJS compatibility
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    MODEL_CONFIGS: window.MODEL_CONFIGS,
    DEFAULT_MODEL_ID: window.DEFAULT_MODEL_ID,
    getModelConfigById: window.getModelConfigById,
  };
}

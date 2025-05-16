// Model configuration file
// Contains metadata for all available ONNX models

// Define model configurations as a global variable
window.MODEL_CONFIGS = [
  {
    id: "temporal-cnn",
    name: "Temporal CNN (5-frame)",
    path: "assets/models/ad_detector.onnx",
    type: "temporal",
    frameCount: 5,
    description: "Analyzes 5 consecutive frames for temporal patterns in ads",
    defaultThreshold: 0.5,
  },
  {
    id: "standard-cnn",
    name: "Standard CNN (1-frame)",
    path: "assets/models/resnet18_ad_detector.onnx", // You'll need to add this model file
    type: "standard",
    frameCount: 1,
    description: "Analyzes single frames for visual ad patterns",
    defaultThreshold: 0.5,
  },
];

// Default model ID to use if none is specified
window.DEFAULT_MODEL_ID = "temporal-cnn";

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

// Ad detector model processing in sandbox
// This script runs in the sandboxed page to load and use the ONNX model

// Configuration
const MODEL_PATH = "assets/models/ad_detector.onnx";
const TEMPORAL_WINDOW = 5; // Number of frames to analyze at once (based on model training)
const FRAME_DIMS = [224, 224]; // Model expects 224x224 frames

// Model state
let session = null;
let isModelLoaded = false;
let statusElement = document.getElementById("status");

// Updates status display
function updateStatus(message) {
  if (statusElement) {
    statusElement.textContent = message;
  }
  console.log("[Ad Detector Sandbox]", message);
}

// Load the ONNX model
async function loadModel() {
  try {
    updateStatus("Loading ad detection model...");

    // Fetch model file
    const response = await fetch(MODEL_PATH);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch model: ${response.status} ${response.statusText}`
      );
    }

    const modelArrayBuffer = await response.arrayBuffer();
    updateStatus(
      `Model fetched (${(modelArrayBuffer.byteLength / (1024 * 1024)).toFixed(
        2
      )} MB). Initializing...`
    );

    // Create ONNX inference session
    session = await ort.InferenceSession.create(modelArrayBuffer, {
      executionProviders: ["wasm"],
    });

    // Get model input/output information
    const inputName = session.inputNames[0];
    const outputName = session.outputNames[0];

    console.log("Model loaded successfully:");
    console.log("- Input:", inputName, session.inputNames);
    console.log("- Output:", outputName, session.outputNames);

    isModelLoaded = true;
    updateStatus("Model ready for inference");

    // Notify content script that model is ready
    window.parent.postMessage({ type: "MODEL_LOADED", success: true }, "*");
  } catch (error) {
    console.error("Error loading model:", error);
    updateStatus(`Error loading model: ${error.message}`);
    window.parent.postMessage(
      {
        type: "MODEL_LOADED",
        success: false,
        error: error.message,
      },
      "*"
    );
  }
}

// Process frames and run inference
async function processFrames(frames, requestId) {
  if (!isModelLoaded || !session) {
    return {
      type: "INFERENCE_RESULT",
      requestId: requestId,
      success: false,
      error: "Model not loaded yet",
    };
  }

  try {
    // The model expects input in shape [batch, frames, channels, height, width]
    // Batch size is 1 (we're processing one video segment at a time)
    const inputShape = [1, TEMPORAL_WINDOW, 3, FRAME_DIMS[0], FRAME_DIMS[1]];

    // Create input tensor
    const inputTensor = new ort.Tensor(
      "float32",
      new Float32Array(frames.flat(Infinity)),
      inputShape
    );

    // Create feeds object with the input tensor
    const feeds = {};
    feeds[session.inputNames[0]] = inputTensor;

    // Run inference
    const results = await session.run(feeds);

    // Get output data (probability that the content is an advertisement)
    const outputTensor = results[session.outputNames[0]];
    const probability = parseFloat(outputTensor.data[0]);

    return {
      type: "INFERENCE_RESULT",
      requestId: requestId,
      success: true,
      probability: probability,
      isAd: probability >= 0.5, // Threshold of 0.5
    };
  } catch (error) {
    console.error("Error during inference:", error);
    return {
      type: "INFERENCE_RESULT",
      requestId: requestId,
      success: false,
      error: error.message,
    };
  }
}

// Setup message listener for communication with content script
window.addEventListener("message", async (event) => {
  // Security check - only accept messages from parent window
  if (event.source !== window.parent) return;

  const message = event.data;

  switch (message.type) {
    case "INIT":
      // Initialize/load the model
      if (!isModelLoaded) {
        await loadModel();
      } else {
        window.parent.postMessage({ type: "MODEL_LOADED", success: true }, "*");
      }
      break;

    case "PROCESS_FRAMES":
      // Process video frames
      if (!message.frames || !Array.isArray(message.frames)) {
        window.parent.postMessage(
          {
            type: "INFERENCE_RESULT",
            requestId: message.requestId,
            success: false,
            error: "Invalid frames data",
          },
          "*"
        );
        return;
      }

      const result = await processFrames(message.frames, message.requestId);
      window.parent.postMessage(result, "*");
      break;
  }
});

// Notify that the sandbox is ready
window.parent.postMessage({ type: "SANDBOX_READY" }, "*");

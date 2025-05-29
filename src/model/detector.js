// Ad detector model processing in sandbox
// This script runs in the sandboxed page to load and use the ONNX model

// Configuration
const FRAME_DIMS = [224, 224]; // Model expects 224x224 frames

// Model state
let session = null;
let isModelLoaded = false;
let statusElement = document.getElementById("status");
let currentModelId = window.DEFAULT_MODEL_ID;
let currentModelConfig = window.getModelConfigById(currentModelId);

// Updates status display
function updateStatus(message) {
  if (statusElement) {
    statusElement.textContent = message;
  }
  console.log("[Ad Detector Sandbox]", message);
}

// Load the ONNX model
async function loadModel(modelId = window.DEFAULT_MODEL_ID) {
  try {
    // First check if we need to unload the existing model
    if (session) {
      try {
        // Free resources from previous model
        await session.release();
        session = null;
      } catch (error) {
        console.warn("Error releasing previous model:", error);
      }
    }

    // Get model configuration
    currentModelId = modelId;
    currentModelConfig = window.getModelConfigById(modelId);

    // Update status
    updateStatus(`Loading ${currentModelConfig.name} model...`);

    const MODEL_PATH = currentModelConfig.path;

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

    console.log(`Model ${currentModelConfig.name} loaded successfully:`);
    console.log("- Input:", inputName, session.inputNames);
    console.log("- Output:", outputName, session.outputNames);

    isModelLoaded = true;
    updateStatus(`${currentModelConfig.name} model ready for inference`);

    // Notify content script that model is ready
    window.parent.postMessage(
      {
        type: "MODEL_LOADED",
        success: true,
        modelId: currentModelId,
        frameCount: currentModelConfig.frameCount,
        defaultThreshold: currentModelConfig.defaultThreshold || 0.5,
      },
      "*"
    );

    return true;
  } catch (error) {
    console.error("Error loading model:", error);
    updateStatus(`Error loading model: ${error.message}`);
    window.parent.postMessage(
      {
        type: "MODEL_LOADED",
        success: false,
        error: error.message,
        modelId: currentModelId,
        defaultThreshold: currentModelConfig
          ? currentModelConfig.defaultThreshold || 0.5
          : 0.5,
      },
      "*"
    );
    return false;
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
      modelId: currentModelId,
    };
  }

  try {
    // The input shape differs based on model type
    let inputShape;

    if (currentModelConfig.type === "temporal") {
      // Temporal model expects [batch, frames, channels, height, width]
      inputShape = [
        1,
        currentModelConfig.frameCount,
        3,
        FRAME_DIMS[0],
        FRAME_DIMS[1],
      ];
    } else {
      // Standard model expects [batch, channels, height, width]
      inputShape = [1, 3, FRAME_DIMS[0], FRAME_DIMS[1]];
    }

    // Create input tensor
    const inputTensor = new ort.Tensor(
      "float32",
      new Float32Array(frames.flat(Infinity)),
      inputShape
    );

    // Create feeds object with the input tensor
    const feeds = {};
    feeds[session.inputNames[0]] = inputTensor;

    // Keep track of the start time
    const inferenceStartTime = performance.now();
    // Run inference
    const results = await session.run(feeds);
    // Keep track of the end time
    const inferenceEndTime = performance.now();

    // Calculate the inference duration
    const inferenceTime = inferenceEndTime - inferenceStartTime;

    // Get output data (probability that the content is an advertisement)
    const outputTensor = results[session.outputNames[0]];
    let probability;

    if (currentModelConfig.type === "temporal") {
      probability = parseFloat(outputTensor.data[0]);
    } else {
      const adLogit = parseFloat(outputTensor.data[1]);
      // Apply sigmoid
      probability = 1 / (1 + Math.exp(-adLogit));
    }

    console.log(
      `[Ad Detector Sandbox] Inference completed in ${inferenceTime.toFixed(
        2
      )}ms`
    );

    return {
      type: "INFERENCE_RESULT",
      requestId: requestId,
      success: true,
      probability: probability,
      isAd: probability >= currentModelConfig.defaultThreshold,
      modelId: currentModelId,
      inferenceTime: inferenceTime,
    };
  } catch (error) {
    console.error("Error during inference:", error);
    return {
      type: "INFERENCE_RESULT",
      requestId: requestId,
      success: false,
      error: error.message,
      modelId: currentModelId,
    };
  }
}

// Setup message listener for communication with content script
window.addEventListener("message", async (event) => {
  // Only accept messages from parent window
  if (event.source !== window.parent) return;

  const message = event.data;

  switch (message.type) {
    case "INIT":
      // Initialize/load the model
      if (!isModelLoaded) {
        const modelId = message.modelId || window.DEFAULT_MODEL_ID;
        await loadModel(modelId);
      } else {
        window.parent.postMessage(
          {
            type: "MODEL_LOADED",
            success: true,
            modelId: currentModelId,
            frameCount: currentModelConfig.frameCount,
            defaultThreshold: currentModelConfig.defaultThreshold || 0.5,
          },
          "*"
        );
      }
      break;

    case "CHANGE_MODEL":
      // Switch to a different model
      if (message.modelId && message.modelId !== currentModelId) {
        await loadModel(message.modelId);
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
            modelId: currentModelId,
            inferenceTime: null,
          },
          "*"
        );
        return;
      }

      // Check if we got the expected number of frames
      const expectedFrames = currentModelConfig.frameCount;
      const receivedFrames = message.frames.length;

      if (receivedFrames !== expectedFrames) {
        console.warn(
          `Model expects ${expectedFrames} frames, but received ${receivedFrames}`
        );
      }

      const result = await processFrames(message.frames, message.requestId);
      window.parent.postMessage(result, "*");
      break;
  }
});

// Notify that the sandbox is ready
window.parent.postMessage({ type: "SANDBOX_READY" }, "*");

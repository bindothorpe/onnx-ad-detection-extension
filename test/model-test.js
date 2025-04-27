// Function to add messages to the log
function log(message) {
  console.log(message);
  const logElement = document.getElementById("log");
  const entry = document.createElement("div");
  entry.textContent = message;
  logElement.appendChild(entry);
  logElement.scrollTop = logElement.scrollHeight;
}

// Function to test loading the ONNX model
async function testModelLoading() {
  log("Starting model loading test...");

  try {
    // Try to load the model
    log("Attempting to load ad_detector.onnx...");
    const startTime = performance.now();

    // Fetch the model
    const modelResponse = await fetch("models/ad_detector.onnx");
    if (!modelResponse.ok) {
      throw new Error(
        `Failed to fetch model: ${modelResponse.status} ${modelResponse.statusText}`
      );
    }

    const modelBuffer = await modelResponse.arrayBuffer();
    log(
      `Model fetched successfully (${(
        modelBuffer.byteLength /
        (1024 * 1024)
      ).toFixed(2)} MB)`
    );

    // Create an ONNX inference session
    log("Creating ONNX inference session...");
    const session = await ort.InferenceSession.create(modelBuffer, {
      executionProviders: ["wasm"],
    });

    const endTime = performance.now();
    log(
      `Model loaded successfully in ${((endTime - startTime) / 1000).toFixed(
        2
      )} seconds!`
    );

    // Skip trying to access metadata directly
    log("Testing inference with sample input...");

    // Try different input shapes based on your model
    // This is based on your model's expected input shape [batch, frames, channels, height, width]
    const inputShapes = [
      [1, 5, 3, 224, 224], // Standard shape from your model training
      [1, 3, 224, 224], // Single frame shape
      [1, 5, 3, 224, 224, 1], // Possible alternative format
    ];

    let inferenceSuccess = false;
    let inferenceOutput = null;
    let usedShape = null;

    // Try different input shapes until one works
    for (const shape of inputShapes) {
      try {
        log(`Trying input shape: [${shape.join(", ")}]`);
        const size = shape.reduce((a, b) => a * b, 1);
        const inputTensor = new ort.Tensor(
          "float32",
          new Float32Array(size).fill(0.1),
          shape
        );

        // Try to guess input name
        const possibleInputNames = [
          "input",
          "images",
          "image",
          "x",
          "input_1",
          "inputs",
        ];

        for (const inputName of possibleInputNames) {
          try {
            log(`Trying input name: "${inputName}"`);
            const feeds = {};
            feeds[inputName] = inputTensor;

            const results = await session.run(feeds);
            inferenceSuccess = true;
            inferenceOutput = results;
            usedShape = shape;
            log(
              `✔ Inference successful with input name "${inputName}" and shape [${shape.join(
                ", "
              )}]`
            );

            // Display output information
            log("Model outputs:");
            for (const outputName in results) {
              const tensor = results[outputName];
              log(`- Name: ${outputName}`);
              log(`  Shape: [${tensor.dims.join(", ")}]`);
              log(`  Type: ${tensor.type}`);

              // Show a sample of values
              const values = Array.from(tensor.data).slice(0, 5);
              log(
                `  Sample values: [${values
                  .map((v) => v.toFixed(4))
                  .join(", ")}...]`
              );
            }

            break; // Exit input name loop if successful
          } catch (err) {
            log(`  ✕ Input name "${inputName}" failed: ${err.message}`);
          }
        }

        if (inferenceSuccess) break; // Exit shape loop if successful
      } catch (err) {
        log(`  ✕ Shape [${shape.join(", ")}] failed: ${err.message}`);
      }
    }

    if (inferenceSuccess) {
      log("✔ Model test completed successfully!");
      log(`Model expects input shape: [${usedShape.join(", ")}]`);
      log("Output structure:");
      for (const outputName in inferenceOutput) {
        log(
          `- ${outputName}: [${inferenceOutput[outputName].dims.join(", ")}]`
        );
      }
    } else {
      log("✕ Could not determine correct input format for this model.");
      log(
        "Check the convert_to_onnx.py script to see input/output names and shapes."
      );
    }
  } catch (error) {
    log(`Error: ${error.message}`);
    console.error("Detailed error:", error);
  }
}

// Add click event listener to the test button
document
  .getElementById("testButton")
  .addEventListener("click", testModelLoading);

// Initial log message
log('Model test page loaded. Click "Load Model" to start the test.');

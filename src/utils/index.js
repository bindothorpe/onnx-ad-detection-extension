function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clamp(number, min, max) {
  return Math.max(min, Math.min(number, max));
}

function clampAndDenormalize(number, min, max) {
  return (clamp(number, min, max) + 1) * 0.5;
}

function getColorIndicesForCoord(x, y, width) {
  const red = y * (width * 4) + x * 4;
  return [red, red + 1, red + 2, red + 3];
}

function getEncoderInput(inputIds) {
  const inputIdsTensor = new ort.Tensor(
    "int64",
    new BigInt64Array(inputIds.map((x) => BigInt(x))),
    [1, inputIds.length]
  );
  const encoderAttentionMaskTensor = new ort.Tensor(
    "int64",
    new BigInt64Array(inputIds.length).fill(1n),
    [1, inputIds.length]
  );

  return [inputIdsTensor, encoderAttentionMaskTensor];
}

async function updateIteration(i) {
  document.getElementById("count").textContent = (i + 1).toString();
  await sleep(10);
}

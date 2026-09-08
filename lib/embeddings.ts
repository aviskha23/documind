import { env, pipeline } from "@huggingface/transformers";

env.cacheDir = "./.model-cache";

// Use WebAssembly instead of the native ONNX runtime.
// This works in serverless environments such as Vercel.
env.backends.onnx.wasm!.numThreads = 1;

let extractor: any = null;

async function getExtractor() {
  if (!extractor) {
    extractor = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2",
      {
        device: "cpu",
      }
    );
  }

  return extractor;
}

export async function generateEmbedding(text: string) {
  const model = await getExtractor();

  const output = await model(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data);
}
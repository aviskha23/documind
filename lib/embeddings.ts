import { env, pipeline } from "@huggingface/transformers";

env.cacheDir = "./.model-cache";

let extractor: any = null;

function isProduction() {
  return process.env.NODE_ENV === "production";
}

async function getExtractor() {
  if (!extractor) {
    extractor = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }

  return extractor;
}

async function generateLocalEmbedding(text: string) {
  const model = await getExtractor();

  const output = await model(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data) as number[];
}

async function generateHuggingFaceEmbedding(text: string) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  if (!apiKey) {
    throw new Error("HUGGINGFACE_API_KEY is not configured");
  }

  const response = await fetch(
  "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: text,
        options: {
          wait_for_model: true,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Hugging Face embedding request failed: ${response.status} - ${errorText}`
    );
  }

  const embedding = await response.json();

  if (!Array.isArray(embedding)) {
    throw new Error("Unexpected Hugging Face embedding response");
  }

  return embedding as number[];
}

export async function generateEmbedding(text: string) {
  if (isProduction()) {
    return generateHuggingFaceEmbedding(text);
  }

  return generateLocalEmbedding(text);
}
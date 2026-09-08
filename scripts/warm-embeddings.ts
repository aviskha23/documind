import { generateEmbedding } from "../lib/embeddings";

async function main() {
  console.log("Warming up embedding model (downloading if needed)...");

  await generateEmbedding("warmup");

  console.log("Embedding model ready.");
}

main();
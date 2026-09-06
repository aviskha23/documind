import { prisma } from "@/lib/prisma";
import { generateEmbedding } from "@/lib/embeddings";

export async function searchSimilarChunks(
  query: string,
  limit = 5
) {
  const queryEmbedding = await generateEmbedding(query);

  const results = await prisma.$queryRaw<
    {
      id: string;
      content: string;
      documentId: string;
      similarity: number;
    }[]
  >`
    SELECT
      id,
      content,
      "documentId",
      1 - (
        embedding <=> ${JSON.stringify(queryEmbedding)}::vector
      ) AS similarity
    FROM "DocumentChunk"
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}::vector
    LIMIT ${limit};
  `;

  return results;
}
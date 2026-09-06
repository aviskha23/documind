import { searchSimilarChunks } from "@/lib/search";
import { generateAnswer } from "@/lib/ollama";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const question = body.question;

    if (!question || typeof question !== "string") {
      return Response.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    const chunks = await searchSimilarChunks(question, 5);

    if (chunks.length === 0) {
      return Response.json({
        answer: "I couldn't find relevant information in your uploaded documents.",
        sources: [],
      });
    }

    const context = chunks
      .map((chunk, index) => `[Source ${index + 1}]\n${chunk.content}`)
      .join("\n\n");

    const answer = await generateAnswer(question, context);

    return Response.json({
      answer,
      sources: chunks.map((chunk) => ({
        documentId: chunk.documentId,
        content: chunk.content,
        similarity: chunk.similarity,
      })),
    });
  } catch (error) {
    console.error("Chat API error:", error);

    return Response.json(
      { error: "Something went wrong while processing your question." },
      { status: 500 }
    );
  }
}
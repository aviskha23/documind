import { searchSimilarChunks } from "@/lib/search";
import { streamAnswer } from "@/lib/ollama";

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
        answer:
          "I couldn't find relevant information in your uploaded documents.",
        sources: [],
      });
    }

    const context = chunks
      .map((chunk, index) => `[Source ${index + 1}]\n${chunk.content}`)
      .join("\n\n");

    const ollamaStream = await streamAnswer(question, context);

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = ollamaStream.getReader();

        let buffer = "";

        try {
          while (true) {
            const { value, done } = await reader.read();

            if (done) break;

            buffer += decoder.decode(value, {
              stream: true,
            });

            const lines = buffer.split("\n");

            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.trim()) continue;

              const data = JSON.parse(line);

              if (data.message?.content) {
                controller.enqueue(
                  encoder.encode(
                    JSON.stringify({
                      type: "token",
                      content: data.message.content,
                    }) + "\n"
                  )
                );
              }
            }
          }

          if (buffer.trim()) {
            const data = JSON.parse(buffer);

            if (data.message?.content) {
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    type: "token",
                    content: data.message.content,
                  }) + "\n"
                )
              );
            }
          }

          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "sources",
                sources: chunks.map((chunk) => ({
                  documentId: chunk.documentId,
                  content: chunk.content,
                  similarity: chunk.similarity,
                })),
              }) + "\n"
            )
          );

          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "done",
              }) + "\n"
            )
          );

          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);

          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "error",
                error: "Something went wrong while generating the answer.",
              }) + "\n"
            )
          );

          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);

    return Response.json(
      { error: "Something went wrong while processing your question." },
      { status: 500 }
    );
  }
}
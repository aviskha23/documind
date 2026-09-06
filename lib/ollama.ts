const OLLAMA_URL = "http://localhost:11434";

export async function generateAnswer(
  question: string,
  context: string
) {
  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3.2:3b",
      stream: false,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful document assistant. Answer the user's question using only the provided context. If the answer cannot be found in the context, say you cannot find the answer in the uploaded documents. Do not make up information.",
        },
        {
          role: "user",
          content: `Context:
${context}

Question:
${question}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed: ${response.status}`);
  }

  const data = await response.json();

  return data.message.content;
}
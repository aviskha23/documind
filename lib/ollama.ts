const OLLAMA_URL =
  process.env.OLLAMA_URL || "http://localhost:11434";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "openai/gpt-oss-20b";

const SYSTEM_PROMPT =
  "You are a helpful document assistant. Answer the user's question using only the provided context. If the answer cannot be found in the context, say you cannot find the answer in the uploaded documents. Do not make up information.";

function isProduction() {
  return process.env.NODE_ENV === "production";
}

console.log("GROQ KEY LOADED:", !!process.env.GROQ_API_KEY);
console.log("GROQ URL:", GROQ_URL);

export async function generateAnswer(
  question: string,
  context: string
) {
  if (!isProduction()) {
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
            content: SYSTEM_PROMPT,
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
      const errorText = await response.text();
      throw new Error(
        `Ollama request failed: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();

    return data.message.content;
  }

  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      stream: false,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
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
    const errorText = await response.text();
    throw new Error(
      `Groq request failed: ${response.status} - ${errorText}`
    );
  }

  const data = await response.json();

  return data.choices[0].message.content;
}

export async function streamAnswer(
  question: string,
  context: string
) {
  if (!isProduction()) {
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3.2:3b",
        stream: true,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
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

    if (!response.body) {
      throw new Error("Ollama response has no body");
    }

    return response.body;
  }

  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      stream: true,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
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
    throw new Error(`Groq request failed: ${response.status}`);
  }

  if (!response.body) {
    throw new Error("Groq response has no body");
  }

  return response.body;
}
"use client";

import { useState } from "react";

type Source = {
  documentId: string;
  content: string;
  similarity: number;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
};

export default function ChatPage() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!question.trim() || loading) return;

    const currentQuestion = question.trim();

    setQuestion("");

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        content: currentQuestion,
      },
      {
        role: "assistant",
        content: "",
      },
    ]);

    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: currentQuestion,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Something went wrong");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";

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

          if (data.type === "token") {
            setMessages((previous) => {
              const updated = [...previous];
              const lastMessage = updated[updated.length - 1];

              if (lastMessage?.role === "assistant") {
                updated[updated.length - 1] = {
                  ...lastMessage,
                  content: lastMessage.content + data.content,
                };
              }

              return updated;
            });
          }

          if (data.type === "sources") {
            setMessages((previous) => {
              const updated = [...previous];
              const lastMessage = updated[updated.length - 1];

              if (lastMessage?.role === "assistant") {
                updated[updated.length - 1] = {
                  ...lastMessage,
                  sources: data.sources,
                };
              }

              return updated;
            });
          }

          if (data.type === "error") {
            throw new Error(data.error);
          }
        }
      }
    } catch (error) {
      console.error(error);

      setMessages((previous) => {
        const updated = [...previous];
        const lastMessage = updated[updated.length - 1];

        if (lastMessage?.role === "assistant") {
          updated[updated.length - 1] = {
            ...lastMessage,
            content: "Something went wrong while getting the answer.",
          };
        }

        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-3xl font-bold">Chat</h2>

      <p className="mt-2 text-muted-foreground">
        Ask questions about your documents here.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about your documents..."
          className="flex-1 rounded-md border bg-background px-4 py-2"
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
        >
          {loading ? "Thinking..." : "Send"}
        </button>
      </form>

      <div className="mt-8 space-y-6">
        {messages.map((message, index) => (
          <div key={index} className="rounded-lg border p-6">
            <h3 className="font-semibold">
              {message.role === "user" ? "You" : "DocuMind"}
            </h3>

            <p className="mt-3 whitespace-pre-wrap text-muted-foreground">
              {message.content}
            </p>

            {message.role === "assistant" &&
              message.sources &&
              message.sources.length > 0 && (
                <div className="mt-6 border-t pt-5">
                  <h3 className="font-semibold">Sources</h3>

                  <div className="mt-3 space-y-3">
                    {message.sources.map((source, sourceIndex) => (
                      <div
                        key={`${source.documentId}-${sourceIndex}`}
                        className="rounded-md bg-muted p-3 text-sm"
                      >
                        <p className="font-medium">
                          Source {sourceIndex + 1}
                        </p>

                        <p className="mt-1 text-muted-foreground">
                          {source.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
}
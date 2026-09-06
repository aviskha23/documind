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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: data.answer,
          sources: data.sources || [],
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: "Something went wrong while getting the answer.",
        },
      ]);
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
          <div
            key={index}
            className="rounded-lg border p-6"
          >
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

        {loading && (
          <div className="rounded-lg border p-6">
            <p className="text-muted-foreground">
              Thinking...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
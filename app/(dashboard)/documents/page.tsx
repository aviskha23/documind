"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function DocumentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleUpload() {
    if (!file) return;

    setStatus("uploading");
    setErrorMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Upload failed");
      }

      setStatus("success");
      setFile(null);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Documents</h1>

      <Card className="p-6 max-w-md">
        <p className="mb-4 text-sm text-muted-foreground">
          Upload a PDF to your workspace.
        </p>

        <Input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="mb-4"
        />

        <Button
          onClick={handleUpload}
          disabled={!file || status === "uploading"}
        >
          {status === "uploading" ? "Uploading..." : "Upload"}
        </Button>

        {status === "success" && (
          <p className="mt-3 text-sm text-green-600">Upload successful!</p>
        )}
        {status === "error" && (
          <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
        )}
      </Card>
    </div>
  );
}
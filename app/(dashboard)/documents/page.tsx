"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

type Document = {
  id: string;
  title: string;
  fileUrl: string;
  createdAt: string;
};

export default function DocumentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchDocuments() {
    try {
      const res = await fetch("/api/documents");

      if (!res.ok) {
        throw new Error("Failed to fetch documents");
      }

      const data = await res.json();
      setDocuments(data);
    } catch (error) {
      console.error("Fetch documents error:", error);
    } finally {
      setLoadingDocuments(false);
    }
  }

  useEffect(() => {
    fetchDocuments();
  }, []);

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

      await fetchDocuments();
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong"
      );
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this document?"
    );

    if (!confirmed) return;

    setDeletingId(id);

    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Delete failed");
      }

      setDocuments((currentDocuments) =>
        currentDocuments.filter((document) => document.id !== id)
      );
    } catch (error) {
      console.error("Delete document error:", error);
      alert(
        error instanceof Error ? error.message : "Failed to delete document"
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Documents</h1>

      <Card className="max-w-md p-6">
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
          <p className="mt-3 text-sm text-green-600">
            Upload successful!
          </p>
        )}

        {status === "error" && (
          <p className="mt-3 text-sm text-red-600">
            {errorMessage}
          </p>
        )}
      </Card>

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold">Your Documents</h2>

        {loadingDocuments ? (
          <p className="text-sm text-muted-foreground">
            Loading documents...
          </p>
        ) : documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No documents uploaded yet.
          </p>
        ) : (
          <div className="space-y-3">
            {documents.map((document) => (
              <Card
                key={document.id}
                className="flex items-center justify-between p-4"
              >
                <div>
                  <p className="font-medium">{document.title}</p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Uploaded{" "}
                    {new Date(document.createdAt).toLocaleString()}
                  </p>
                </div>

                <Button
                  variant="destructive"
                  onClick={() => handleDelete(document.id)}
                  disabled={deletingId === document.id}
                >
                  {deletingId === document.id ? "Deleting..." : "Delete"}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
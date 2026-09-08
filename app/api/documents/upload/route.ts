import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { PDFParse } from "pdf-parse";
import { chunkText } from "@/lib/chunk-text";
import { generateEmbedding } from "@/lib/embeddings";

export async function POST(request: Request) {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    const { userId } = await auth();

    console.log("UPLOAD AUTH USER:", userId);

    if (!userId) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return Response.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    if (!user) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const workspace = await prisma.workspace.findFirst({
      where: {
        ownerId: user.id,
      },
    });

    if (!workspace) {
      return Response.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    // Convert the uploaded file into a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from the PDF
    const parser = new PDFParse({ data: buffer });
    const pdfData = await parser.getText();
    const rawText = pdfData.text;

    await parser.destroy();

    // Store the PDF in Supabase Storage
    const filePath = `${user.id}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("documents")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);

      return Response.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    // Store the document and extracted text in PostgreSQL
    const document = await prisma.document.create({
      data: {
        title: file.name,
        fileUrl: filePath,
        rawText,
        workspaceId: workspace.id,
      },
    });
    const chunks = chunkText(rawText);

    for (const content of chunks) {
      const chunk = await prisma.documentChunk.create({
        data: {
          content,
          documentId: document.id,
        },
      });

      const embedding = await generateEmbedding(content);

      await prisma.$executeRaw`
        UPDATE "DocumentChunk"
        SET embedding = ${JSON.stringify(embedding)}::vector
        WHERE id = ${chunk.id}
    `;
    }

    return Response.json({
      message: "Document uploaded and text extracted successfully",
      document,
    });
  } catch (error) {
    console.error("Upload error:", error);

    return Response.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
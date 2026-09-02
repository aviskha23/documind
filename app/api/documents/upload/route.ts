import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  try {
    // Check if the user is logged in
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the uploaded file
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Only allow PDF files
    if (file.type !== "application/pdf") {
      return Response.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // Find the user in our database
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

    // Find the user's workspace
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

    // Create a unique file path
    const filePath = `${user.id}/${Date.now()}-${file.name}`;

    // Upload the PDF to Supabase Storage
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

    // Save document information in our database
    const document = await prisma.document.create({
      data: {
        title: file.name,
        fileUrl: filePath,
        workspaceId: workspace.id,
      },
    });

    return Response.json({
      message: "Document uploaded successfully",
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
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

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

    const document = await prisma.document.findFirst({
      where: {
        id,
        workspaceId: workspace.id,
      },
    });

    if (!document) {
      return Response.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    const { error: storageError } = await supabaseAdmin.storage
      .from("documents")
      .remove([document.fileUrl]);

    if (storageError) {
      console.error("Supabase delete error:", storageError);

      return Response.json(
        { error: "Failed to delete file from storage" },
        { status: 500 }
      );
    }

    await prisma.document.delete({
      where: {
        id: document.id,
      },
    });

    return Response.json({
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Delete document error:", error);

    return Response.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
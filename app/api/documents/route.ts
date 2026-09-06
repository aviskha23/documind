import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
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

    const documents = await prisma.document.findMany({
      where: {
        workspaceId: workspace.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return Response.json(documents);
  } catch (error) {
    console.error("Fetch documents error:", error);

    return Response.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
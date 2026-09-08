import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    return null;
  }

  const name =
    clerkUser.fullName ||
    `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() ||
    null;

  const user = await prisma.user.upsert({
    where: {
      clerkId: userId,
    },
    update: {
      email,
      name,
    },
    create: {
      clerkId: userId,
      email,
      name,
    },
  });

  const workspace = await prisma.workspace.findFirst({
    where: {
      ownerId: user.id,
    },
  });

  if (!workspace) {
    await prisma.workspace.create({
      data: {
        name: "My Workspace",
        ownerId: user.id,
      },
    });
  }

  return user;
}
"use server";

import prisma from "@devboard/db/prismaClient";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user;
}

export async function createInviteLink(
  boardId: string,
  role: "VIEWER" | "EDITOR" = "EDITOR",
) {
  const user = await getCurrentUser();
  // Verify ownership
  const board = await prisma.board.findUnique({
    where: { id: boardId, ownerId: user.id },
  });
  if (!board) throw new Error("Board not found or not owner");

  const link = await prisma.inviteLink.create({
    data: { boardId, role },
  });
  return link;
}

export async function getInviteLinks(boardId: string) {
  await getCurrentUser();
  return prisma.inviteLink.findMany({
    where: { boardId },
    orderBy: { createdAt: "desc" },
  });
}

export async function revokeInviteLink(linkId: string) {
  await getCurrentUser();
  await prisma.inviteLink.delete({ where: { id: linkId } });
}

export async function acceptInvite(token: string) {
  const user = await getCurrentUser();
  const link = await prisma.inviteLink.findUnique({ where: { token } });
  if (!link) throw new Error("Invalid invite link");
  if (link.expiresAt && link.expiresAt < new Date())
    throw new Error("Link expired");
  if (link.maxUses && link.usedCount >= link.maxUses)
    throw new Error("Link has reached max uses");

  // Upsert membership
  await prisma.boardMember.upsert({
    where: {
      boardId_userId: { boardId: link.boardId, userId: user.id },
    },
    update: { role: link.role },
    create: {
      boardId: link.boardId,
      userId: user.id,
      role: link.role,
    },
  });

  // Increment usage
  await prisma.inviteLink.update({
    where: { id: link.id },
    data: { usedCount: { increment: 1 } },
  });

  return link.boardId;
}

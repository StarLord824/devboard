"use server";

import prisma from "@devboard/db/prismaClient";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { nanoid } from "nanoid";

// ── Helper: get current user ────────────────────────────────────────────────
async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user;
}

// ── Board CRUD ──────────────────────────────────────────────────────────────

export async function getBoards() {
  const user = await getCurrentUser();
  const boards = await prisma.board.findMany({
    where: {
      isArchived: false,
      OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
    },
    include: {
      _count: { select: { pages: true, members: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
  return boards;
}

export async function createBoard(name: string) {
  const user = await getCurrentUser();
  const slug = `${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 40)}-${nanoid(6)}`;

  const board = await prisma.board.create({
    data: {
      name,
      slug,
      ownerId: user.id,
      pages: {
        create: {
          name: "Page 1",
          order: 0,
        },
      },
    },
    include: { pages: true },
  });
  return board;
}

export async function renameBoard(boardId: string, name: string) {
  const user = await getCurrentUser();
  await prisma.board.update({
    where: { id: boardId, ownerId: user.id },
    data: { name },
  });
}

export async function duplicateBoard(boardId: string) {
  const user = await getCurrentUser();
  const original = await prisma.board.findUnique({
    where: { id: boardId },
    include: { pages: true },
  });
  if (!original) throw new Error("Board not found");

  const slug = `${original.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 40)}-${nanoid(6)}`;

  const copy = await prisma.board.create({
    data: {
      name: `${original.name} (copy)`,
      slug,
      ownerId: user.id,
      pages: {
        create: original.pages.map((p) => ({
          name: p.name,
          order: p.order,
          yjsState: p.yjsState,
        })),
      },
    },
  });
  return copy;
}

export async function archiveBoard(boardId: string) {
  const user = await getCurrentUser();
  await prisma.board.update({
    where: { id: boardId, ownerId: user.id },
    data: { isArchived: true },
  });
}

export async function deleteBoard(boardId: string) {
  const user = await getCurrentUser();
  await prisma.board.delete({
    where: { id: boardId, ownerId: user.id },
  });
}

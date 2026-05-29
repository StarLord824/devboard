"use server";

import prisma from "@devboard/db/prismaClient";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user;
}

export async function getBoardName(boardId: string) {
  await getCurrentUser();
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: { name: true },
  });
  return board?.name ?? "Untitled";
}

export async function getPages(boardId: string) {
  await getCurrentUser();
  const pages = await prisma.page.findMany({
    where: { boardId },
    orderBy: { order: "asc" },
  });
  return pages;
}

export async function createPage(boardId: string, name: string) {
  await getCurrentUser();
  const maxOrder = await prisma.page.aggregate({
    where: { boardId },
    _max: { order: true },
  });
  const nextOrder = (maxOrder._max.order ?? -1) + 1;

  const page = await prisma.page.create({
    data: { boardId, name, order: nextOrder },
  });
  return page;
}

export async function renamePage(pageId: string, name: string) {
  await getCurrentUser();
  await prisma.page.update({
    where: { id: pageId },
    data: { name },
  });
}

export async function reorderPages(boardId: string, orderedIds: string[]) {
  await getCurrentUser();
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.page.update({
        where: { id, boardId },
        data: { order: index },
      }),
    ),
  );
}

export async function deletePage(pageId: string) {
  await getCurrentUser();
  const page = await prisma.page.findUnique({ where: { id: pageId } });
  if (!page) throw new Error("Page not found");

  const count = await prisma.page.count({
    where: { boardId: page.boardId },
  });
  if (count <= 1) throw new Error("Cannot delete the last page");

  await prisma.page.delete({ where: { id: pageId } });
}

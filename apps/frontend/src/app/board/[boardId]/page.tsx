import type { Metadata } from "next";
import BoardClient from "./BoardClient";

interface Props {
  params: Promise<{ boardId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { boardId } = await params;
  return { title: `Board ${boardId} | Devboard` };
}

export default async function BoardPage({ params }: Props) {
  const { boardId } = await params;

  return (
    <main className="w-screen h-screen overflow-hidden bg-white">
      <BoardClient boardId={boardId} />
    </main>
  );
}

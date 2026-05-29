"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Share2 } from "lucide-react";
import ShareDialog from "@/components/dashboard/ShareDialog";

interface CanvasTopbarProps {
  boardId: string;
  boardName: string;
}

export default function CanvasTopbar({ boardId, boardName }: CanvasTopbarProps) {
  const router = useRouter();
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <>
      <header className="h-12 shrink-0 flex items-center justify-between px-4 bg-white border-b border-zinc-200 z-30">
        {/* Left — back to dashboard */}
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Dashboard</span>
        </button>

        {/* Center — board name */}
        <p className="absolute left-1/2 -translate-x-1/2 text-sm font-medium text-zinc-900 truncate max-w-xs pointer-events-none">
          {boardName}
        </p>

        {/* Right — share */}
        <button
          onClick={() => setShareOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <Share2 size={14} />
          Share
        </button>
      </header>

      <ShareDialog
        open={shareOpen}
        boardId={boardId}
        onClose={() => setShareOpen(false)}
      />
    </>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/components/dashboard/Topbar";
import BoardCard from "@/components/dashboard/BoardCard";
import CreateBoardDialog from "@/components/dashboard/CreateBoardDialog";
import {
  getBoards,
  createBoard,
  renameBoard,
  duplicateBoard,
  archiveBoard,
  deleteBoard,
} from "./actions";
import { Plus, Grid3X3, List } from "lucide-react";

type Board = {
  id: string;
  name: string;
  slug: string;
  updatedAt: Date;
  _count: { pages: number; members: number };
};

export default function DashboardPage() {
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const fetchBoards = useCallback(async () => {
    try {
      const data = await getBoards();
      setBoards(data as Board[]);
    } catch {
      // Not authed or error — middleware should redirect
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const handleCreate = async (name: string) => {
    await createBoard(name);
    fetchBoards();
  };

  const handleRename = async (id: string, name: string) => {
    await renameBoard(id, name);
    fetchBoards();
  };

  const handleDuplicate = async (id: string) => {
    await duplicateBoard(id);
    fetchBoards();
  };

  const handleArchive = async (id: string) => {
    await archiveBoard(id);
    fetchBoards();
  };

  const handleDelete = async (id: string) => {
    await deleteBoard(id);
    fetchBoards();
  };

  const filtered = boards.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      <Topbar
        onSearch={setSearchQuery}
        onNewBoard={() => setDialogOpen(true)}
      />

      <div className="flex-1 overflow-auto p-6">
        {/* View toggle */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-zinc-500">
            {filtered.length} board{filtered.length !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-1 border border-zinc-200 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:text-zinc-600"}`}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:text-zinc-600"}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="border border-zinc-200 rounded-xl overflow-hidden animate-pulse"
              >
                <div className="aspect-video bg-zinc-100" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-zinc-100 rounded w-2/3" />
                  <div className="h-3 bg-zinc-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#a1a1aa"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 3v18" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-zinc-900 mb-1">
              {searchQuery ? "No boards found" : "Create your first board"}
            </h3>
            <p className="text-sm text-zinc-500 mb-4">
              {searchQuery
                ? "Try a different search term"
                : "Get started by creating a new drawing board"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setDialogOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Plus size={16} /> Create Board
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((board) => (
              <BoardCard
                key={board.id}
                id={board.id}
                name={board.name}
                slug={board.slug}
                updatedAt={board.updatedAt}
                pageCount={board._count.pages}
                memberCount={board._count.members}
                onRename={handleRename}
                onDuplicate={handleDuplicate}
                onArchive={handleArchive}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((board) => (
              <div
                key={board.id}
                className="flex items-center justify-between px-4 py-3 border border-zinc-200 rounded-lg hover:bg-zinc-50 cursor-pointer transition-colors"
                onClick={() => router.push(`/board/${board.id}`)}
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    {board.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {board._count.pages} page
                    {board._count.pages !== 1 ? "s" : ""} · Updated{" "}
                    {new Date(board.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateBoardDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreate={handleCreate}
      />
    </>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { reorderPages } from "@/app/dashboard/board-actions";

interface Page {
  id: string;
  name: string;
  order: number;
}

interface PagesStripProps {
  boardId: string;
  pages: Page[];
  activePageId: string;
  onSelectPage: (pageId: string) => void;
  onAddPage: () => void;
  onRenamePage: (pageId: string, name: string) => void;
  onDeletePage: (pageId: string) => void;
  onReorderPages: () => void;
}

export default function PagesStrip({
  boardId,
  pages,
  activePageId,
  onSelectPage,
  onAddPage,
  onRenamePage,
  onDeletePage,
  onReorderPages,
}: PagesStripProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [localPages, setLocalPages] = useState<Page[]>(pages);
  const inputRef = useRef<HTMLInputElement>(null);
  const draggingId = useRef<string | null>(null);

  // Keep localPages in sync when parent updates pages
  useEffect(() => {
    setLocalPages(pages);
  }, [pages]);

  useEffect(() => {
    if (renamingId && inputRef.current) inputRef.current.focus();
  }, [renamingId]);

  const startRename = (page: Page) => {
    setRenamingId(page.id);
    setRenameValue(page.name);
  };

  const commitRename = () => {
    if (renamingId && renameValue.trim()) {
      onRenamePage(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  };

  // ── Drag-to-reorder ────────────────────────────────────────────────────────

  const handleDragStart = (e: React.DragEvent, pageId: string) => {
    draggingId.current = pageId;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!draggingId.current || draggingId.current === targetId) return;

    setLocalPages((prev) => {
      const fromIndex = prev.findIndex((p) => p.id === draggingId.current);
      const toIndex = prev.findIndex((p) => p.id === targetId);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const handleDrop = async () => {
    draggingId.current = null;
    await reorderPages(
      boardId,
      localPages.map((p) => p.id),
    );
    onReorderPages();
  };

  const handleDragEnd = () => {
    draggingId.current = null;
  };

  return (
    <div
      className="absolute bottom-0 left-0 right-0 h-10 flex items-center gap-1 px-3 z-30"
      style={{
        backgroundColor: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(8px)",
        borderTop: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      {localPages.map((page) => {
        const isActive = page.id === activePageId;
        const isDragging = draggingId.current === page.id;

        return (
          <div
            key={page.id}
            draggable
            onDragStart={(e) => handleDragStart(e, page.id)}
            onDragOver={(e) => handleDragOver(e, page.id)}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            className={`group relative flex items-center gap-1 px-3 h-7 rounded-md text-xs cursor-pointer transition-colors select-none ${
              isActive
                ? "bg-blue-100 text-blue-700 font-medium"
                : "text-zinc-600 hover:bg-zinc-100"
            } ${isDragging ? "opacity-40" : ""}`}
            onClick={() => onSelectPage(page.id)}
            onDoubleClick={() => startRename(page)}
          >
            {renamingId === page.id ? (
              <input
                ref={inputRef}
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename();
                  if (e.key === "Escape") setRenamingId(null);
                }}
                className="bg-transparent border-none outline-none text-xs w-16"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span>{page.name}</span>
            )}

            {pages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete "${page.name}"?`)) {
                    onDeletePage(page.id);
                  }
                }}
                className="opacity-0 group-hover:opacity-100 ml-1 text-zinc-400 hover:text-red-500 transition-opacity"
              >
                <X size={12} />
              </button>
            )}
          </div>
        );
      })}

      <button
        onClick={onAddPage}
        className="flex items-center justify-center w-7 h-7 rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
        title="Add page"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

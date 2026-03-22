"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, X } from "lucide-react";

interface Page {
  id: string;
  name: string;
  order: number;
}

interface PagesStripProps {
  pages: Page[];
  activePageId: string;
  onSelectPage: (pageId: string) => void;
  onAddPage: () => void;
  onRenamePage: (pageId: string, name: string) => void;
  onDeletePage: (pageId: string) => void;
  /** Dynamic theme color for text/border based on canvas bg */
  themeColor?: string;
}

export default function PagesStrip({
  pages,
  activePageId,
  onSelectPage,
  onAddPage,
  onRenamePage,
  onDeletePage,
  themeColor = "#3f3f46",
}: PagesStripProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div
      className="absolute bottom-0 left-0 right-0 h-10 flex items-center gap-1 px-3 z-30"
      style={{
        backgroundColor: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(8px)",
        borderTop: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      {pages.map((page) => {
        const isActive = page.id === activePageId;
        return (
          <div
            key={page.id}
            className={`group relative flex items-center gap-1 px-3 h-7 rounded-md text-xs cursor-pointer transition-colors select-none ${
              isActive
                ? "bg-blue-100 text-blue-700 font-medium"
                : "text-zinc-600 hover:bg-zinc-100"
            }`}
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

            {/* Delete X — show on hover, hide if last page */}
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

      {/* Add Page */}
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

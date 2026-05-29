"use client";

import Link from "next/link";
import { MoreHorizontal, Pencil, Copy, Archive, Trash2, Share2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface BoardCardProps {
  id: string;
  name: string;
  slug: string;
  updatedAt: Date;
  pageCount: number;
  memberCount: number;
  onRename: (id: string, name: string) => void;
  onDuplicate: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onShare: (id: string) => void;
}

export default function BoardCard({
  id,
  name,
  slug,
  updatedAt,
  pageCount,
  memberCount,
  onRename,
  onDuplicate,
  onArchive,
  onDelete,
  onShare,
}: BoardCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(name);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renaming && inputRef.current) inputRef.current.focus();
  }, [renaming]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleRenameSubmit = () => {
    if (newName.trim() && newName !== name) {
      onRename(id, newName.trim());
    } else {
      setNewName(name);
    }
    setRenaming(false);
  };

  const timeAgo = getTimeAgo(new Date(updatedAt));

  return (
    <div className="group relative border border-zinc-200 rounded-xl bg-white hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer overflow-hidden">
      {/* Thumbnail */}
      <Link href={`/board/${id}`}>
        <div className="aspect-video bg-zinc-100 flex items-center justify-center">
          <div className="w-16 h-16 rounded-lg bg-zinc-200/60 flex items-center justify-center">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#a1a1aa"
              strokeWidth="1.5"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 3v18" />
            </svg>
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="px-3 py-2.5">
        {renaming ? (
          <input
            ref={inputRef}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRenameSubmit();
              if (e.key === "Escape") {
                setNewName(name);
                setRenaming(false);
              }
            }}
            className="text-sm font-medium text-zinc-900 w-full px-1 py-0.5 border border-blue-400 rounded focus:outline-none"
          />
        ) : (
          <p className="text-sm font-medium text-zinc-900 truncate">{name}</p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-zinc-500">{timeAgo}</span>
          <span className="text-xs text-zinc-400">·</span>
          <span className="text-xs text-zinc-500">
            {pageCount} page{pageCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Menu Button */}
      <div
        ref={menuRef}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          className="p-1.5 bg-white/90 backdrop-blur-sm border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
        >
          <MoreHorizontal size={14} className="text-zinc-600" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-9 w-40 bg-white border border-zinc-200 rounded-lg shadow-lg py-1 z-50">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setRenaming(true);
                setMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              <Pencil size={14} /> Rename
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(id);
                setMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              <Copy size={14} /> Duplicate
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare(id);
                setMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              <Share2 size={14} /> Share
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onArchive(id);
                setMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              <Archive size={14} /> Archive
            </button>
            <div className="border-t border-zinc-100 my-1" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("Delete this board permanently?")) {
                  onDelete(id);
                }
                setMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

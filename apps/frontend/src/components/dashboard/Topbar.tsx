"use client";

import { useState } from "react";
import { useSession, signOut } from "@/lib/auth-client";
import { Plus, Search, LogOut, User } from "lucide-react";

interface TopbarProps {
  onSearch?: (query: string) => void;
  onNewBoard?: () => void;
}

export default function Topbar({ onSearch, onNewBoard }: TopbarProps) {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="h-14 border-b border-zinc-200 bg-white flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-zinc-900">Boards</h1>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            placeholder="Search boards..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearch?.(e.target.value);
            }}
            className="pl-9 pr-4 py-1.5 text-sm border border-zinc-200 rounded-lg bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onNewBoard}
          className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={16} />
          New Board
        </button>

        {session?.user && (
          <div
            className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium cursor-pointer"
            title={session.user.name || "User"}
          >
            {session.user.name?.[0]?.toUpperCase() || "U"}
          </div>
        )}
      </div>
    </header>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  createInviteLink,
  getInviteLinks,
  revokeInviteLink,
} from "@/app/dashboard/share-actions";
import { Link2, Copy, Trash2, Check } from "lucide-react";

interface ShareDialogProps {
  open: boolean;
  boardId: string;
  onClose: () => void;
}

type InviteLink = {
  id: string;
  token: string;
  role: string;
  createdAt: Date;
  usedCount: number;
  maxUses: number | null;
};

export default function ShareDialog({
  open,
  boardId,
  onClose,
}: ShareDialogProps) {
  const [links, setLinks] = useState<InviteLink[]>([]);
  const [role, setRole] = useState<"VIEWER" | "EDITOR">("EDITOR");
  const [copied, setCopied] = useState<string | null>(null);

  const fetchLinks = async () => {
    const data = await getInviteLinks(boardId);
    setLinks(data as InviteLink[]);
  };

  useEffect(() => {
    if (open) fetchLinks();
  }, [open]);

  const handleCreate = async () => {
    await createInviteLink(boardId, role);
    fetchLinks();
  };

  const handleRevoke = async (linkId: string) => {
    await revokeInviteLink(linkId);
    fetchLinks();
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(url);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 mx-4">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">
          Share Board
        </h2>

        {/* Create new link */}
        <div className="flex items-center gap-2 mb-4">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "VIEWER" | "EDITOR")}
            className="px-3 py-1.5 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="EDITOR">Editor</option>
            <option value="VIEWER">Viewer</option>
          </select>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
          >
            <Link2 size={14} /> Generate Link
          </button>
        </div>

        {/* Existing links */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {links.length === 0 && (
            <p className="text-sm text-zinc-500 text-center py-4">
              No invite links yet.
            </p>
          )}
          {links.map((link) => (
            <div
              key={link.id}
              className="flex items-center justify-between px-3 py-2 bg-zinc-50 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-700 font-mono truncate">
                  /invite/{link.token}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {link.role} · Used {link.usedCount}/{link.maxUses ?? "∞"}{" "}
                  times
                </p>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={() => copyLink(link.token)}
                  className="p-1.5 text-zinc-400 hover:text-blue-600 transition-colors"
                  title="Copy link"
                >
                  {copied === link.token ? (
                    <Check size={14} />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
                <button
                  onClick={() => handleRevoke(link.id)}
                  className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors"
                  title="Revoke link"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

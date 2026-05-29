"use client";

import { useState, useEffect, useCallback } from "react";
import CanvasLayers from "@/components/canvas/CanvasLayers";
import PagesStrip from "@/components/canvas/PagesStrip";
import CanvasTopbar from "@/components/canvas/CanvasTopbar";
import {
  getBoardName,
  getPages,
  createPage,
  renamePage,
  deletePage,
} from "@/app/dashboard/board-actions";

interface PageItem {
  id: string;
  name: string;
  order: number;
}

export default function BoardClient({ boardId }: { boardId: string }) {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [activePageId, setActivePageId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [boardName, setBoardName] = useState("");

  const fetchPages = useCallback(async () => {
    try {
      const [name, data] = await Promise.all([
        getBoardName(boardId),
        getPages(boardId),
      ]);
      setBoardName(name);
      const sorted = (data as PageItem[]).sort((a, b) => a.order - b.order);
      setPages(sorted);
      if (!activePageId || !sorted.find((p) => p.id === activePageId)) {
        setActivePageId(sorted[0]?.id || "");
      }
    } catch {
      // If no pages exist yet (board without auth) just show canvas
    } finally {
      setLoading(false);
    }
  }, [boardId, activePageId]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleAddPage = async () => {
    const newPage = await createPage(boardId, `Page ${pages.length + 1}`);
    await fetchPages();
    setActivePageId(newPage.id);
  };

  const handleRenamePage = async (pageId: string, name: string) => {
    await renamePage(pageId, name);
    fetchPages();
  };

  const handleDeletePage = async (pageId: string) => {
    await deletePage(pageId);
    if (activePageId === pageId) {
      setActivePageId("");
    }
    fetchPages();
  };

  return (
    <div className="flex flex-col w-full h-full">
      <CanvasTopbar boardId={boardId} boardName={boardName} />

      <div className="relative flex-1 overflow-hidden">
        <CanvasLayers boardId={boardId} />

        {!loading && pages.length > 0 && (
          <PagesStrip
            boardId={boardId}
            pages={pages}
            activePageId={activePageId}
            onSelectPage={setActivePageId}
            onAddPage={handleAddPage}
            onRenamePage={handleRenamePage}
            onDeletePage={handleDeletePage}
            onReorderPages={fetchPages}
          />
        )}
      </div>
    </div>
  );
}

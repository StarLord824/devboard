"use client";

import React, { useEffect, useState, useRef } from "react";
import { Stage, Layer, Rect, Circle, Text } from "react-konva";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { Shape } from "@devboard/common/types/canvas";

// Use a random color for the cursor/presence
const userColor = '#' + Math.floor(Math.random()*16777215).toString(16);

export default function CanvasBoard({
  slug,
  userName,
}: {
  slug: string;
  userName: string;
}) {
  const [doc] = useState(() => new Y.Doc());
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [shapes, setShapes] = useState<Record<string, Shape>>({});
  const [awarenessUsers, setAwarenessUsers] = useState<any[]>([]);
  
  // Connect to WS
  useEffect(() => {
    // In a real deployed scenario, this URL would come from env vars
    const wsUrl = "ws://localhost:8080"; 
    const wsProvider = new WebsocketProvider(wsUrl, `board-${slug}`, doc);
    
    setProvider(wsProvider);

    // Awareness (Presence)
    wsProvider.awareness.setLocalStateField("user", {
      name: userName,
      color: userColor,
    });

    wsProvider.awareness.on("change", () => {
      const states = Array.from(wsProvider.awareness.getStates().values());
      setAwarenessUsers(states);
    });

    // Shared Shapes Map
    const yShapes = doc.getMap<Shape>("shapes");
    
    // Initial load
    setShapes(yShapes.toJSON());

    // Listen for changes
    yShapes.observe(() => {
       setShapes(yShapes.toJSON());
    });

    return () => {
      wsProvider.disconnect();
    };
  }, [slug, doc, userName]);

  // Insert a test shape if empty (Temporary for debugging)
  const addTestShape = () => {
    if(!provider) return;
    const yShapes = doc.getMap<Shape>("shapes");
    const id = Math.random().toString(36).substr(2, 9);
    
    const shape: Shape = {
      id,
      type: 'rect',
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: 100,
      height: 100,
      fill: userColor,
    };
    
    yShapes.set(id, shape);
  }

  return (
    <div className="w-full h-full relative bg-gray-100 overflow-hidden">
      {/* Absolute Toolbar Overlay */}
      <div className="absolute top-4 left-4 z-10 bg-white p-2 rounded shadow flex gap-2">
        <button onClick={addTestShape} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
           Add Rect
        </button>
        <div className="flex items-center gap-2 border-l pl-2">
           <span className="text-sm text-gray-500">Users: {awarenessUsers.length}</span>
           {awarenessUsers.map((u: any, i) => (
             u.user && (
               <div key={i} title={u.user.name} className="w-6 h-6 rounded-full border-2 border-white shadow-sm" style={{backgroundColor: u.user.color}}></div>
             )
           ))}
        </div>
      </div>

      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
            {Object.values(shapes).map((shape) => {
                if(shape.type === 'rect') {
                    return (
                        <Rect
                            key={shape.id}
                            x={shape.x}
                            y={shape.y}
                            width={shape.width}
                            height={shape.height}
                            fill={shape.fill}
                            draggable
                            onDragEnd={(e) => {
                                // Update position in Yjs
                                const yShapes = doc.getMap<Shape>("shapes");
                                const updated = {
                                    ...shape,
                                    x: e.target.x(),
                                    y: e.target.y()
                                };
                                yShapes.set(shape.id, updated);
                            }}
                        />
                    );
                }
                return null;
            })}
        </Layer>
      </Stage>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import {
  Canvas,
  Rect,
  Circle,
  IText,
  Line,
  PencilBrush,
  EraserBrush,
} from "fabric";

export default function CanvasBoard() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);

  useEffect(() => {
    if (canvasRef.current && !canvas) {
      const fabricCanvas = new Canvas(canvasRef.current, {
        height: window.innerHeight - 120,
        width: window.innerWidth - 40,
        backgroundColor: "#fff",
        selection: true,
      });

      addGridToCanvas(fabricCanvas);
      setCanvas(fabricCanvas);

      // Handle resize
      const resizeCanvas = () => {
        fabricCanvas.setDimensions({
          width: window.innerWidth - 40,
          height: window.innerHeight - 120,
        });
        fabricCanvas.renderAll();
      };
      window.addEventListener("resize", resizeCanvas);

      return () => {
        fabricCanvas.dispose();
        window.removeEventListener("resize", resizeCanvas);
      };
    }
  }, [canvas]);

  const addGridToCanvas = (canvas: Canvas) => {
    const gridSize = 20;
    const patternCanvas = document.createElement("canvas");
    patternCanvas.width = gridSize;
    patternCanvas.height = gridSize;
    const ctx = patternCanvas.getContext("2d");

    if (ctx) {
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, gridSize, gridSize);
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(gridSize, 0);
      ctx.moveTo(0, 0);
      ctx.lineTo(0, gridSize);
      ctx.stroke();
    }

    // Use pattern as background
    canvas.setBackgroundColor(
      { source: patternCanvas, repeat: "repeat" },
      canvas.renderAll.bind(canvas)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1 flex relative">
        <div className="flex-1 p-5">
          <div className="bg-white rounded-lg shadow-lg p-4 h-full">
            <canvas
              ref={canvasRef}
              className="border border-gray-200 rounded"
            />
          </div>
        </div>
        <PropertyPanel canvas={canvas} />
      </div>
      <ToolBar canvas={canvas} />
    </div>
  );
}

function Header() {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <h1 className="text-xl font-semibold text-gray-800">Canvas Designer</h1>
    </div>
  );
}

function PropertyPanel({ canvas }: { canvas: Canvas | null }) {
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [properties, setProperties] = useState<any>({
    width: 0,
    height: 0,
    fill: "#000000",
    stroke: "#000000",
    strokeWidth: 1,
    opacity: 1,
  });

  useEffect(() => {
    if (!canvas) return;

    const handleSelection = () => {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        setSelectedObject(activeObject);
        updateProperties(activeObject);
      } else {
        setSelectedObject(null);
      }
    };

    const handleObjectModified = () => {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        updateProperties(activeObject);
      }
    };

    canvas.on("selection:created", handleSelection);
    canvas.on("selection:updated", handleSelection);
    canvas.on("selection:cleared", handleSelection);
    canvas.on("object:modified", handleObjectModified);
    canvas.on("object:scaling", handleObjectModified);

    return () => {
      canvas.off("selection:created", handleSelection);
      canvas.off("selection:updated", handleSelection);
      canvas.off("selection:cleared", handleSelection);
      canvas.off("object:modified", handleObjectModified);
      canvas.off("object:scaling", handleObjectModified);
    };
  }, [canvas]);

  const updateProperties = (obj: any) => {
    const scaledWidth =
      obj.type === "circle" ? obj.radius * 2 * obj.scaleX : obj.width * obj.scaleX;
    const scaledHeight =
      obj.type === "circle" ? obj.radius * 2 * obj.scaleY : obj.height * obj.scaleY;

    setProperties({
      width: Math.round(scaledWidth),
      height: Math.round(scaledHeight),
      fill: obj.fill || "#000000",
      stroke: obj.stroke || "#000000",
      strokeWidth: obj.strokeWidth || 1,
      opacity: obj.opacity || 1,
    });
  };

  const handlePropertyChange = (property: string, value: any) => {
    if (!selectedObject || !canvas) return;

    const updates: any = {};

    if (property === "width") {
      const newWidth = parseInt(value) || 0;
      if (selectedObject.type === "circle") {
        updates.radius = newWidth / 2 / selectedObject.scaleX;
      } else {
        updates.width = newWidth / selectedObject.scaleX;
      }
    } else if (property === "height") {
      const newHeight = parseInt(value) || 0;
      if (selectedObject.type === "circle") {
        updates.radius = newHeight / 2 / selectedObject.scaleY;
      } else {
        updates.height = newHeight / selectedObject.scaleY;
      }
    } else {
      updates[property] = value;
    }

    selectedObject.set(updates);
    canvas.renderAll();
    setProperties((prev: { [key: string]: any }) => ({ ...prev, [property]: value }));
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Properties</h3>

      {selectedObject ? (
        <div className="space-y-4">
          {/* Object type */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-gray-600 mb-2">Object Type</p>
            <p className="text-sm text-gray-800 capitalize">{selectedObject.type}</p>
          </div>

          {/* Width / Height */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
              <input
                type="number"
                value={properties.width}
                onChange={(e) => handlePropertyChange("width", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
              <input
                type="number"
                value={properties.height}
                onChange={(e) => handlePropertyChange("height", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Fill color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fill Color</label>
            <input
              type="color"
              value={properties.fill}
              onChange={(e) => handlePropertyChange("fill", e.target.value)}
            />
          </div>

          {/* Stroke */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Border Color</label>
            <input
              type="color"
              value={properties.stroke}
              onChange={(e) => handlePropertyChange("stroke", e.target.value)}
            />
          </div>

          {/* Stroke width / Opacity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Border Width</label>
              <input
                type="number"
                min="0"
                max="20"
                value={properties.strokeWidth}
                onChange={(e) =>
                  handlePropertyChange("strokeWidth", parseInt(e.target.value))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Opacity</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={properties.opacity}
                onChange={(e) =>
                  handlePropertyChange("opacity", parseFloat(e.target.value))
                }
              />
            </div>
          </div>

          {/* Delete */}
          <button
            onClick={() => {
              if (selectedObject && canvas) {
                canvas.remove(selectedObject);
                canvas.renderAll();
              }
            }}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Delete Object
          </button>
        </div>
      ) : (
        <p className="text-gray-500">Select an object to edit</p>
      )}
    </div>
  );
}

function ToolBar({ canvas }: { canvas: Canvas | null }) {
  const [activeMode, setActiveMode] = useState("select");
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);

  const tools = [
    {
      id: "select",
      name: "Select",
      action: () => {
        if (canvas) {
          canvas.isDrawingMode = false;
          canvas.selection = true;
          setActiveMode("select");
        }
      },
    },
    {
      id: "pen",
      name: "Pen",
      action: () => {
        if (canvas) {
          const brush = new PencilBrush(canvas);
          brush.width = brushSize;
          brush.color = brushColor;
          canvas.freeDrawingBrush = brush;
          canvas.isDrawingMode = true;
          setActiveMode("pen");
        }
      },
    },
    {
      id: "eraser",
      name: "Eraser",
      action: () => {
        if (canvas) {
          const eraser = new EraserBrush(canvas);
          eraser.width = brushSize;
          canvas.freeDrawingBrush = eraser;
          canvas.isDrawingMode = true;
          setActiveMode("eraser");
        }
      },
    },
    {
      id: "text",
      name: "Text",
      action: () => {
        if (canvas) {
          const text = new IText("Double click to edit", {
            left: 100,
            top: 100,
            fontFamily: "Arial",
            fontSize: 20,
            fill: "#000",
          });
          canvas.add(text);
          canvas.setActiveObject(text);
          canvas.renderAll();
        }
      },
    },
    {
      id: "line",
      name: "Line",
      action: () => {
        if (canvas) {
          const line = new Line([50, 50, 200, 50], {
            stroke: "#000",
            strokeWidth: 2,
          });
          canvas.add(line);
          canvas.setActiveObject(line);
          canvas.renderAll();
        }
      },
    },
    {
      id: "rect",
      name: "Rectangle",
      action: () => {
        if (canvas) {
          const rect = new Rect({
            left: 100,
            top: 100,
            fill: "#ff6b6b",
            width: 100,
            height: 80,
          });
          canvas.add(rect);
          canvas.setActiveObject(rect);
          canvas.renderAll();
        }
      },
    },
    {
      id: "circle",
      name: "Circle",
      action: () => {
        if (canvas) {
          const circle = new Circle({
            left: 100,
            top: 100,
            fill: "#4ecdc4",
            radius: 50,
          });
          canvas.add(circle);
          canvas.setActiveObject(circle);
          canvas.renderAll();
        }
      },
    },
    {
      id: "clear",
      name: "Clear All",
      action: () => {
        if (canvas) {
          canvas.getObjects().forEach((obj) => canvas.remove(obj));
          canvas.renderAll();
        }
      },
    },
  ];

  return (
    <div className="bg-white border-t border-gray-200 px-6 py-4 flex gap-2">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={tool.action}
          className={`px-4 py-2 rounded-lg ${
            activeMode === tool.id ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          {tool.name}
        </button>
      ))}

      {(activeMode === "pen" || activeMode === "eraser") && (
        <div className="flex items-center gap-4 ml-6">
          <label>Size</label>
          <input
            type="range"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => {
              const size = parseInt(e.target.value);
              setBrushSize(size);
              if (canvas && canvas.freeDrawingBrush) {
                canvas.freeDrawingBrush.width = size;
              }
            }}
          />
          <span>{brushSize}</span>

          {activeMode === "pen" && (
            <>
              <label>Color</label>
              <input
                type="color"
                value={brushColor}
                onChange={(e) => {
                  const color = e.target.value;
                  setBrushColor(color);
                  if (canvas && canvas.freeDrawingBrush) {
                    canvas.freeDrawingBrush.color = color;
                  }
                }}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
  
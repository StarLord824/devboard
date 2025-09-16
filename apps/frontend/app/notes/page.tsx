"use client";

import { use, useEffect, useRef, useState } from "react";
import {Canvas, Rect} from "fabric";

export default function CanvasBoard() {

  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const fabricCanvas = new Canvas(canvasRef.current, {
        height: window.innerHeight-100,
        width: window.innerWidth-100,
        // backgroundColor: "black",
      });
      fabricCanvas.backgroundColor = "#FFFF00"
      fabricCanvas.renderAll();
      setCanvas(fabricCanvas);

      return () => {
        fabricCanvas.dispose();
      };
    }
  }, []);
  
  return (
    <div className="flex items-center justify-center h-screen w-screen px-8 py-3 border-white border-4">
      <canvas ref={canvasRef} id="canvas"/>
      <ToolBar canvas={canvas}/>
    </div>
  )
}
export function ToolBar( {canvas}: {canvas: Canvas | null} ) {
  const addRectangle = () => {
    if(canvas) {
      const rect = new Rect({
        left: 100,
        top: 100,
        fill: 'red',
        width: 100,
        height: 100
      });
      canvas.add(rect);
    }
  }
  return (
    <div className="fixed bottom-6 bg-neutral-800 p-2 flex flex-row gap-2">
      <button  className="m-1 p-2 bg-blue-500 text-white rounded">Select</button>
      <button  className="m-1 p-2 bg-blue-500 text-white rounded">Pen</button>
      <button  className="m-1 p-2 bg-green-500 text-white rounded">Eraser</button>
      <button  className="m-1 p-2 bg-yellow-500 text-white rounded">Text</button>
      <button  className="m-1 p-2 bg-purple-500 text-white rounded">Line</button>
      <button onClick={ addRectangle } className="m-1 p-2 bg-pink-500 text-white rounded">Rectangle</button>
      <button  className="m-1 p-2 bg-orange-500 text-white rounded">Circle</button>
      <button  className="m-1 p-2 bg-gray-500 text-white rounded">Image</button>
      <button  className="m-1 p-2 bg-gray-500 text-white rounded">PDF</button>
      <button  className="m-1 p-2 bg-red-500 text-white rounded">Clear</button>
    </div>
  )
}

// import { useEffect, useRef } from "react";
// import { Canvas, Circle, Rect, Image as FabricImage } from "fabric";

// export default function CanvasBoard() {
//   const canvasRef = useRef<Canvas | null>(null);
//   const canvasContainerRef = useRef<HTMLCanvasElement | null>(null);

//   useEffect(() => {
//     if (!canvasContainerRef.current) return;

//     const canvas = new Canvas(canvasContainerRef.current, {
//       backgroundColor: "black",
//       selection: true,
//       isDrawingMode: false,
//       // width/height can also be set through canvas.setDimensions
//     });

//     canvasRef.current = canvas;

//     // prevent scroll/zoom via wheel
//     canvas.on("mouse:wheel", (opt) => {
//       opt.e.preventDefault();
//       opt.e.stopPropagation();
//     });

//     // Dotted background grid
//     const gridSize = 40;
//     const dotRadius = 1.2;
//     const dotColor = "#333";

//     const { width, height } = { width: canvas.width, height: canvas.height };

//     for (let x = 0; x < width; x += gridSize) {
//       for (let y = 0; y < height; y += gridSize) {
//         const dot = new Circle({
//           radius: dotRadius,
//           fill: dotColor,
//           left: x,
//           top: y,
//           selectable: false,
//           evented: false,
//         });
//         canvas.add(dot);
//       }
//     }

//     // Possibly: disable panning or other interactive behavior that causes scrollbars

//     // Clean up
//     return () => {
//       canvas.dispose();
//     };
//   }, []);

//   return (
//     <canvas
//       ref={canvasContainerRef}
//       className="fixed top-0 left-0 w-screen h-screen"
//     />
//   );
// }

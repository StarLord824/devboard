"use client";

import { use, useEffect, useRef, useState } from "react";
import {Canvas, Rect} from "fabric";
import { set } from "zod";

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
      <Settings canvas={canvas}/>
    </div>
  )
}

export function Settings( {canvas}: {canvas: Canvas | null} ) {
  const [visible, setVisible] = useState<boolean>(true);
  const [seletedObject, setSelectedObject] = useState<any>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [diameter, setDiameter] = useState<number>(0);
  const [color, setColor] = useState<string>('');

  useEffect(() => {
    if(canvas) {
      canvas.on('selection:created', (e) => {
        handleObjectSelection(e.selected[0]);
      });
      canvas.on('selection:cleared', (e) => {
        clearSettings();
      });
      canvas.on('selection:updated', (e) => {
        setSelectedObject(e.selected[0]);
        setVisible(true);
      });
      canvas.on('object:modified', (e) => {
        setSelectedObject(e.target);
      });
      canvas.on('object:scaling', (e) => {
        setSelectedObject(e.target);
      });
    }
  }, [canvas]);

  const handleObjectSelection = (object: any) => {
    setSelectedObject(object);
    setVisible(true);
    if(object.type === 'circle') {
      setDiameter(object.radius * 2 * object.scaleX);
      setWidth(0);
      setHeight(0);
    } else {
      setWidth(object.width * object.scaleX);
      setHeight(object.height * object.scaleY);
      setDiameter(0);
    }
    setColor(object.fill);

  };
  const clearSettings = () => {
    setSelectedObject(null);
    setWidth(0);
    setHeight(0);
    setDiameter(0);
    setColor('');
    setVisible(false);
  }
  const handleHeightChange = (e: any) => {
    const value = e.target.value.replace(/\D/g, '');
    const newHeight = parseInt(value, 10);

    setHeight(newHeight);
    if (seletedObject.type !== 'circle' && seletedObject && newHeight > 0) {
      seletedObject.set( { height: newHeight/seletedObject.scaleY } );
      canvas?.renderAll();
  }
  const handleWidthChange = (e: any) => {
    const value = e.target.value.replace(/\D/g, '');
    const newWidth = parseInt(value, 10);

    setWidth(newWidth);
    if (seletedObject.type !== 'circle' && seletedObject && newWidth > 0) {
      seletedObject.set( { width: newWidth/seletedObject.scaleX } );
      canvas?.renderAll();
    }
  }
  const handleDiameterChange = (e: any) => {
    const value = e.target.value.replace(/\D/g, '');
    const newDiameter = parseInt(value, 10);

    setDiameter(newDiameter);
    if (seletedObject.type === 'circle' && seletedObject && newDiameter > 0) {
      seletedObject.set( { radius: newDiameter/2 * seletedObject.scaleX } );
      canvas?.renderAll();
    }
  }
  const handleColorChange = (e: any) => {
    const value = e.target.value;
    setColor(value); 
    if(seletedObject) {
      seletedObject.set( { fill: value } );
      canvas?.renderAll();
    }
  }
  return (
    <div className="flex items-center justify-center h-screen w-screen px-8 py-3 border-white border-4">
      { visible && seletedObject && 
        (
          <>
            <div className="flex flex-col items-center justify-center">
              <div className="flex flex-row items-center justify-center">
                <input type="text" value={width} onChange={handleWidthChange} className="w-full h-10 px-2 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" />
                <input type="text" value={height} onChange={handleHeightChange} className="w-full h-10 px-2 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" />
                <input type="text" value={diameter} onChange={handleDiameterChange} className="w-full h-10 px-2 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" />
              </div>
              <div className="flex flex-row items-center justify-center">
                <input type="color" value={color} onChange={handleColorChange} className="w-full h-10 px-2 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" />  
              </div>
            </div>
          </>
        )
      }
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
  const addCircle = () => {
    if(canvas) {
      const circle = new Rect({
        left: 100,
        top: 100,
        fill: 'red',
        width: 100,
        height: 100
      });
      canvas.add(circle);
    }
  }
  function writer() {
    if(canvas) {
      canvas.isDrawingMode = true;
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.width = 5;
        canvas.freeDrawingBrush.color = 'red';
      }
    }
  }
  function eraser() {
    if(canvas) {
      canvas.isDrawingMode = false;
    }
  }
  return (
    <div className="fixed bottom-6 bg-neutral-800 p-2 flex flex-row gap-2">
      <button  className="m-1 p-2 bg-blue-500 text-white rounded">
        Select
      </button>
      <button className="m-1 p-2 bg-blue-500 text-white rounded" 
       onClick={writer} >
        Pen
      </button>
      <button className="m-1 p-2 bg-green-500 text-white rounded"
       onClick={eraser}>
        Eraser
      </button>
      <button className="m-1 p-2 bg-yellow-500 text-white rounded">
        Text
      </button>
      <button className="m-1 p-2 bg-purple-500 text-white rounded">
        Line
      </button>
      <button className="m-1 p-2 bg-pink-500 text-white rounded" 
       onClick={ addRectangle }>
        Rectangle
      </button>
      <button className="m-1 p-2 bg-orange-500 text-white rounded"
       onClick={addCircle}>
        Circle
      </button>
      <button  className="m-1 p-2 bg-gray-500 text-white rounded">
        Image
      </button>
      <button  className="m-1 p-2 bg-gray-500 text-white rounded">
        PDF
      </button>
      <button  className="m-1 p-2 bg-red-500 text-white rounded">
        Clear
      </button>
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

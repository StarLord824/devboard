"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import Landing from "./components/Landing";

const CanvasBoard = dynamic(() => import("./components/Canvas"), { 
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center">Loading Canvas...</div>
});

export default function Home() {
  return (
    <div className="w-screen h-screen">
       <CanvasBoard slug="demo-board" userName={`User-${Math.floor(Math.random() * 1000)}`} />
    </div>
  );
}

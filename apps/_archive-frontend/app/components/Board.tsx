'use client';
import React, { useState, useRef, useEffect } from 'react';
import { 
  MousePointer, 
  Edit3, 
  Square, 
  Circle, 
  Type, 
  Undo, 
  Redo, 
  ZoomIn,
  Share,
  MessageCircle,
  FileText,
  ChevronRight,
  ChevronLeft,
  X
} from 'lucide-react';

const CollaborativeWhiteboard = () => {
  const [boardTitle, setBoardTitle] = useState('Untitled Board');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [selectedTool, setSelectedTool] = useState('select');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePanel, setActivePanel] = useState('chat');
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Sample presence data
  const participants = [
    { id: 1, name: "Alice Johnson", avatar: "AJ", color: "bg-blue-500" },
    { id: 2, name: "Bob Smith", avatar: "BS", color: "bg-green-500" },
    { id: 3, name: "Carol Davis", avatar: "CD", color: "bg-purple-500" },
    { id: 4, name: "David Wilson", avatar: "DW", color: "bg-orange-500" },
  ];

  const tools = [
    { id: 'select', icon: MousePointer, label: 'Select' },
    { id: 'draw', icon: Edit3, label: 'Draw' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'text', icon: Type, label: 'Text' },
  ];

  const actions = [
    { id: 'undo', icon: Undo, label: 'Undo' },
    { id: 'redo', icon: Redo, label: 'Redo' },
    { id: 'zoom', icon: ZoomIn, label: 'Zoom' },
  ];

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
  };

  const handleTitleKeyPress = (e : { key : string }) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
    }
  };

  const handleCanvasMouseDown = (e : { clientX : number, clientY : number }) => {
    if (selectedTool === 'select') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y });
    }
  };

  const handleCanvasMouseMove = (e : { clientX : number, clientY : number }) => {
    if (isDragging && selectedTool === 'select') {
      setCanvasOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const PresenceAvatars = () => (
    <div className="flex -space-x-2">
      {participants.map((participant) => (
        <div
          key={participant.id}
          className={`w-8 h-8 rounded-full ${participant.color} flex items-center justify-center text-white text-xs font-medium border-2 border-white shadow-sm`}
          title={participant.name}
        >
          {participant.avatar}
        </div>
      ))}
    </div>
  );

  const Navbar = () => (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            type="text"
            value={boardTitle}
            onChange={(e) => setBoardTitle(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={handleTitleKeyPress}
            className="text-lg font-semibold bg-transparent border-none outline-none focus:bg-gray-50 px-2 py-1 rounded"
          />
        ) : (
          <h1 
            className="text-lg font-semibold text-gray-900 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors"
            onClick={() => setIsEditingTitle(true)}
          >
            {boardTitle}
          </h1>
        )}
      </div>
      
      <div className="flex items-center space-x-4">
        <PresenceAvatars />
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors">
          <Share size={16} />
          <span>Share</span>
        </button>
      </div>
    </div>
  );

  const Toolbar = () => (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
      <div className="bg-white shadow-lg border border-gray-200 rounded-xl p-2 flex items-center space-x-1">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool.id)}
              className={`p-3 rounded-lg transition-all ${
                selectedTool === tool.id
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={tool.label}
            >
              <Icon size={18} />
            </button>
          );
        })}
        
        <div className="w-px h-8 bg-gray-200 mx-2" />
        
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              className="p-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              title={action.label}
            >
              <Icon size={18} />
            </button>
          );
        })}
      </div>
    </div>
  );

  const SidebarToggle = () => (
    <button
      onClick={() => setSidebarOpen(!sidebarOpen)}
      className={`fixed top-1/2 transform -translate-y-1/2 z-30 bg-white shadow-lg border border-gray-200 rounded-l-lg p-2 transition-all ${
        sidebarOpen ? 'right-80' : 'right-0'
      }`}
    >
      {sidebarOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
    </button>
  );

  const Sidebar = () => (
    <div className={`fixed top-14 right-0 h-full w-80 bg-white border-l border-gray-200 transform transition-transform duration-300 ease-in-out z-20 ${
      sidebarOpen ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <div className="h-full flex flex-col">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActivePanel('chat')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activePanel === 'chat'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageCircle size={16} className="inline mr-2" />
            Chat
          </button>
          <button
            onClick={() => setActivePanel('notes')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activePanel === 'notes'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText size={16} className="inline mr-2" />
            Notes
          </button>
        </div>
        
        <div className="flex-1 p-4">
          {activePanel === 'chat' ? (
            <div className="space-y-4">
              <div className="text-sm text-gray-500 text-center py-4">
                No messages yet. Start a conversation!
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <textarea
                placeholder="Add your notes here..."
                className="w-full h-40 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors">
                Save Notes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const Canvas = () => (
    <div className="flex-1 relative overflow-hidden bg-gray-50">
      <div
        ref={canvasRef}
        className="absolute inset-4 bg-white rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing"
        style={{
          transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
          minHeight: '200%',
          minWidth: '200%',
        }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
      >
        {/* Canvas content would go here */}
        <div className="w-full h-full relative">
          {/* Grid pattern for visual reference */}
          <div className="absolute inset-0 opacity-5">
            <div className="w-full h-full" style={{
              backgroundImage: `
                linear-gradient(to right, #000 1px, transparent 1px),
                linear-gradient(to bottom, #000 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Navbar />
      <Canvas />
      <Toolbar />
      <SidebarToggle />
      <Sidebar />
    </div>
  );
};

export default CollaborativeWhiteboard;
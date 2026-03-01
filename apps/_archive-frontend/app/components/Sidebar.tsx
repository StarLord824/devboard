import React, { useState } from 'react';
import { 
  Home, 
  Layout, 
  FileText, 
  StickyNote, 
  Settings, 
  ChevronLeft,
  ChevronRight 
} from 'lucide-react';

const CollapsibleSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('Dashboard');

  const menuItems = [
    { name: 'Dashboard', icon: Home },
    { name: 'Boards', icon: Layout },
    { name: 'Templates', icon: FileText },
    { name: 'Notes', icon: StickyNote },
    { name: 'Settings', icon: Settings },
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex h-screen">
      <div className={`${isCollapsed ? 'w-20' : 'w-64'} bg-indigo-600 text-white transition-all duration-300 ease-in-out flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-indigo-500">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <h1 className="text-xl font-bold">Workspace</h1>
            )}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.name;
              
              return (
                <li key={item.name}>
                  <button
                    onClick={() => setActiveItem(item.name)}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 hover:bg-indigo-700 ${
                      isActive ? 'bg-indigo-700' : ''
                    }`}
                    title={isCollapsed ? item.name : ''}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="font-medium">{item.name}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-indigo-500">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">JD</span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">John Doe</p>
                <p className="text-xs text-indigo-200 truncate">john@example.com</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-gray-50 p-8">
        <div className="max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {activeItem}
          </h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-gray-600">
              This is the main content area for <strong>{activeItem}</strong>. 
              The sidebar can be collapsed by clicking the chevron button to save space 
              while still providing quick access to navigation items through icons.
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="bg-gray-50 rounded-lg p-4">
                  <div className="h-20 bg-gray-200 rounded mb-3"></div>
                  <h3 className="font-medium text-gray-900">Sample Item {item}</h3>
                  <p className="text-sm text-gray-500 mt-1">Description for item {item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSidebar;
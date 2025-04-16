import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - responsive */}
      {/* Sidebar wrapper with fixed width */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} fixed lg:static w-64 h-full z-40`}>
        <Sidebar />
      </div>

      {/* Backdrop - only on mobile when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0  bg-opacity-50 z-30 lg:hidden" 
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main content area - always take up all available space */}
      <div className="flex flex-col flex-1 w-full">
        {/* Navbar */}
        <Navbar isSidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        
        {/* Main content with scrolling */}
        <div className="flex-1 overflow-auto p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;


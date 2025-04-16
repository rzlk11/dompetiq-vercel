import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LogOut, reset } from '../features/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Navbar = ({ isSidebarOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation(); // Add location hook to track current route
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [pageTitle, setPageTitle] = useState('Dashboard'); // State to store current page title
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  // Create refs for dropdown containers
  const searchRef = useRef(null);
  const notificationsRef = useRef(null);
  const profileMenuRef = useRef(null);

    const handleLogout = () => {
      // Add any logout logic here (clear tokens, etc.)
      dispatch(LogOut());
      dispatch(reset());
      navigate('/login');
    };
  
  // Update page title based on current route
  useEffect(() => {
    // Map routes to their display titles
    const routeTitles = {
      '/dashboard': 'Dashboard',
      '/rekening': 'Rekening',
      '/transaksi': 'Transaksi',
      '/transaksi-terjadwal': 'Transaksi Terjadwal',
      '/anggaran': 'Anggaran',
      '/kalender': 'Kalender',
      '/export-pdf': 'Export PDF File',
      '/kategori': 'Pengelolaan Kategori',
      '/kategori/kelola': 'Pengelolaan Kategori',
      '/pengaturan': 'Pengaturan',
      '/profile': 'Profile',
      '/help': 'Help',
      '/settings': 'Settings',
      '/login': 'Login'
    };
    
    // Set page title based on current path or default to 'Dashboard'
    setPageTitle(routeTitles[location.pathname] || 'Dashboard');
  }, [location.pathname]);
  
  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      // Close search if clicked outside the search container
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
      
      // Close notifications if clicked outside the notifications container
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      
      // Close profile menu if clicked outside the profile menu container
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    
    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle search functionality
  const handleSearchClick = () => {
    setShowSearch(!showSearch);
    // Close other menus when search is clicked
    setShowNotifications(false);
    setShowProfileMenu(false);
  };
  
  // Handle notifications functionality
  const handleNotificationsClick = () => {
    setShowNotifications(!showNotifications);
    // Close other menus when notifications is clicked
    setShowSearch(false);
    setShowProfileMenu(false);
  };
  
  // Handle profile menu functionality
  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
    // Close other menus when profile is clicked
    setShowSearch(false);
    setShowNotifications(false);
  };
  
  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Add your search logic here
    console.log('Search submitted:', e.target.search.value);
    setShowSearch(false);
  };
  
  return (
    <div className="bg-white shadow-sm px-4 py-2 flex items-center justify-between relative">
      {/* Left side - Menu toggle and Page title */}
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
        >
          <MenuIcon />
        </button>
        <h1 className="text-xl font-semibold text-gray-800 ml-2">{pageTitle}</h1>
      </div>
      
      {/* Right side - Search, notifications, help, profile */}
      <div className="flex items-center space-x-4">
        {/* Search bar */}
        <div className="relative hidden md:block" ref={searchRef}>
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              name="search"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-64"
            />
            <button 
              type="button" 
              onClick={handleSearchClick}
              className="absolute left-3 top-2.5 text-gray-500"
            >
              <SearchIcon fontSize="small" />
            </button>
          </form>
        </div>
        
        {/* Mobile search button */}
        <div ref={searchRef}>
          <button 
            className="p-2 rounded-full hover:bg-gray-100 md:hidden"
            onClick={handleSearchClick}
          >
            <SearchIcon fontSize="small" />
          </button>
        </div>
        
        {/* Notification button */}
        <div className="relative" ref={notificationsRef}>
          <button 
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={handleNotificationsClick}
          >
            <NotificationsIcon fontSize="small" />
          </button>
          
          {/* Notifications dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10">
              <div className="p-4 border-b">
                <h3 className="font-medium">Notifications</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <div className="p-4 border-b hover:bg-gray-50">
                  <p className="text-sm font-medium">Update Baru tersedia</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
                <div className="p-4 border-b hover:bg-gray-50">
                  <p className="text-sm font-medium">Laporan anda sudah siap</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
              <div className="p-2 text-center">
                <button className="text-sm text-green-500 hover:text-green-700">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Help button */}
        <button 
          className="p-2 rounded-full hover:bg-gray-100"
          onClick={() => navigate('/help')}
        >
          <HelpOutlineIcon fontSize="small" />
        </button>
        
        {/* User profile button */}
        <div className="relative" ref={profileMenuRef}>
          <button 
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={handleProfileClick}
          >
            <AccountCircleIcon fontSize="small" />
          </button>
          
          {/* Profile dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              <div className="p-4 border-b">
                <p className="font-medium">{user.username}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <div>
                <button 
                  className="block w-full text-left px-4 py-2 hover:bg-gray-50"
                  onClick={() => navigate('/profile')}
                >
                  Profile
                </button>
                <button 
                  className="block w-full text-left px-4 py-2 hover:bg-gray-50"
                  onClick={() => navigate('/pengaturan')}
                >
                  Settings
                </button>
                <button 
                  className="block w-full text-left px-4 py-2 hover:bg-gray-50"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile search overlay */}
      {showSearch && (
        <div className="absolute left-0 top-full w-full bg-white shadow-md p-4 md:hidden z-10" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              name="search"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              autoFocus
            />
            <SearchIcon className="absolute left-3 top-2.5 text-gray-500" fontSize="small" />
          </form>
        </div>
      )}
    </div>
  );
};

export default Navbar;
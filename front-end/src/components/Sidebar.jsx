import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LogOut, reset } from '../features/authSlice';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logoImg from '../assets/logo.png';

// Import Material UI Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ReceiptIcon from '@mui/icons-material/Receipt';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GetAppIcon from '@mui/icons-material/GetApp';
import CategoryIcon from '@mui/icons-material/Category';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import DateRangeIcon from '@mui/icons-material/DateRange';

const Sidebar = () => {
  // Initialize with all menus expanded
  const [showManageMenu, setShowManageMenu] = useState(true);
  const [showPreferenceMenu, setShowPreferenceMenu] = useState(true);
  const [showDiagramMenu, setShowDiagramMenu] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Determine active route
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    // Add any logout logic here (clear tokens, etc.)
    dispatch(LogOut());
    dispatch(reset());
    navigate('/');
  };

  // Function to handle navigation to Anggaran page
  const navigateToDashboard = () => {
    navigate('/dashboard');
  };

  // Function to handle navigation to Anggaran page
  const navigateToAnggaran = () => {
    navigate('/anggaran');
  };

  // Function to handle navigation to Kategori Kelola page
  const navigateToKategoriKelola = () => {
    navigate('/kategori/kelola');
  };

  // Function to handle navigation to Diagram Category page
  const navigateToDiagramKategori = () => {
    navigate('/diagram/kategori');
  };

  // Function to handle navigation to Diagram Time page
  const navigateToDiagramWaktu = () => {
    navigate('/diagram/waktu');
  };

  // Explicitly defined toggle functions with direct state control
  const toggleManageMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowManageMenu(prevState => !prevState);
  };

  const togglePreferenceMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPreferenceMenu(prevState => !prevState);
  };

  const toggleDiagramMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDiagramMenu(prevState => !prevState);
  };

  // Only auto-expand menus when navigating to a route inside them, don't auto-collapse
  useEffect(() => {
    const manageRoutes = ['/dashboard', '/rekening', '/transaksi', '/transaksi-terjadwal', '/anggaran', '/kalender'];
    const prefRoutes = ['/export-pdf', '/kategori', '/kategori/kelola', '/pengaturan'];
    const diagramRoutes = ['/diagram/kategori', '/diagram/waktu'];
    
    // Only expand, don't collapse automatically
    if (manageRoutes.some(route => location.pathname === route) && !showManageMenu) {
      setShowManageMenu(true);
    }
    
    if (prefRoutes.some(route => location.pathname === route) && !showPreferenceMenu) {
      setShowPreferenceMenu(true);
    }

    if (diagramRoutes.some(route => location.pathname === route) && !showDiagramMenu) {
      setShowDiagramMenu(true);
    }
  }, [location.pathname]);

  return (
    <div className="h-screen w-64 bg-gray-900 overflow-y-auto">
      <div className="flex flex-col text-white min-h-full">
        {/* Logo - Now part of the scrollable area */}
        <div className="flex items-center p-4 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
          <img src={logoImg} alt="DompetIQ Logo" className="h-8 w-8 mr-2" />
          <span className="font-semibold text-xl">DompetIQ</span>
        </div>

        {/* Main Navigation */}
        <div className="flex flex-col flex-grow">
          <div className="py-4">
            {/* MENGELOLA Section with Toggle */}
            <button 
              className="w-full px-4 flex items-center justify-between cursor-pointer mb-2 hover:bg-gray-800 py-2 rounded transition-colors duration-200 focus:outline-none"
              onClick={toggleManageMenu}
              aria-expanded={showManageMenu}
            >
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                MENGELOLA
              </p>
              <div className="transition-transform duration-300">
                {showManageMenu ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
              </div>
            </button>
            
            {/* Collapsible MENGELOLA Menu with animation */}
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                showManageMenu ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <nav>
                {/* Modified Dashboard item with onClick handler */}
                <div 
                  onClick={navigateToDashboard} 
                  className={`flex items-center px-4 py-2 ${isActive('/dashboard') ? 'text-green-400 bg-gray-800' : 'text-gray-300'} hover:bg-gray-800 cursor-pointer transition-colors duration-200`}
                >
                  <DashboardIcon fontSize="small" />
                  <span className="ml-3">Dashboard</span>
                </div>
                <Link to="/rekening" className={`flex items-center px-4 py-2 ${isActive('/rekening') ? 'text-green-400 bg-gray-800' : 'text-gray-300'} hover:bg-gray-800 transition-colors duration-200`}>
                  <AccountBalanceIcon fontSize="small" />
                  <span className="ml-3">Rekening</span>
                </Link>
                <Link to="/transaksi" className={`flex items-center px-4 py-2 ${isActive('/transaksi') ? 'text-green-400 bg-gray-800' : 'text-gray-300'} hover:bg-gray-800 transition-colors duration-200`}>
                  <ReceiptIcon fontSize="small" />
                  <span className="ml-3">Transaksi</span>
                </Link>
                <Link to="/transaksi-terjadwal" className={`flex items-center px-4 py-2 ${isActive('/transaksi-terjadwal') ? 'text-green-400 bg-gray-800' : 'text-gray-300'} hover:bg-gray-800 transition-colors duration-200`}>
                  <EventRepeatIcon fontSize="small" />
                  <span className="ml-3">Transaksi Terjadwal</span>
                </Link>
                {/* Anggaran item with onClick handler */}
                <div 
                  onClick={navigateToAnggaran} 
                  className={`flex items-center px-4 py-2 ${isActive('/anggaran') ? 'text-green-400 bg-gray-800' : 'text-gray-300'} hover:bg-gray-800 cursor-pointer transition-colors duration-200`}
                >
                  <AccountBalanceWalletIcon fontSize="small" />
                  <span className="ml-3">Anggaran</span>
                </div>
                <Link to="/kalender" className={`flex items-center px-4 py-2 ${isActive('/kalender') ? 'text-green-400 bg-gray-800' : 'text-gray-300'} hover:bg-gray-800 transition-colors duration-200`}>
                  <CalendarTodayIcon fontSize="small" />
                  <span className="ml-3">Kalender</span>
                </Link>

                {/* New Diagram Menu */}
                <div className="ml-4">
                  <button 
                    className="w-full flex items-center justify-between cursor-pointer mb-1 hover:bg-gray-800 py-2 rounded transition-colors duration-200 focus:outline-none"
                    onClick={toggleDiagramMenu}
                    aria-expanded={showDiagramMenu}
                  >
                    <div className="flex items-center text-gray-300">
                      <InsertChartIcon fontSize="small" />
                      <span className="ml-3">Diagram</span>
                    </div>
                    <div className="transition-transform duration-300">
                      {showDiagramMenu ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                    </div>
                  </button>

                  {/* Collapsible Diagram Submenus */}
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ml-3 ${
                      showDiagramMenu ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div 
                      onClick={navigateToDiagramKategori} 
                      className={`flex items-center px-4 py-2 ${isActive('/diagram/kategori') ? 'text-green-400 bg-gray-800' : 'text-gray-300'} hover:bg-gray-800 cursor-pointer transition-colors duration-200 rounded`}
                    >
                      <CategoryIcon fontSize="small" />
                      <span className="ml-3">Kategori</span>
                    </div>
                    <div 
                      onClick={navigateToDiagramWaktu} 
                      className={`flex items-center px-4 py-2 ${isActive('/diagram/waktu') ? 'text-green-400 bg-gray-800' : 'text-gray-300'} hover:bg-gray-800 cursor-pointer transition-colors duration-200 rounded`}
                    >
                      <DateRangeIcon fontSize="small" />
                      <span className="ml-3">Waktu</span>
                    </div>
                  </div>
                </div>
              </nav>
            </div>
          </div>

          <div className="py-4">
            {/* PREFERENSI Section with Toggle */}
            <button 
              className="w-full px-4 flex items-center justify-between cursor-pointer mb-2 hover:bg-gray-800 py-2 rounded transition-colors duration-200 focus:outline-none"
              onClick={togglePreferenceMenu}
              aria-expanded={showPreferenceMenu}
            >
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                PREFERENSI
              </p>
              <div className="transition-transform duration-300">
                {showPreferenceMenu ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
              </div>
            </button>
            
            {/* Collapsible PREFERENSI Menu with animation */}
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                showPreferenceMenu ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <nav>
                <Link to="/export-pdf" className={`flex items-center px-4 py-2 ${isActive('/export-pdf') ? 'text-green-400 bg-gray-800' : 'text-gray-300'} hover:bg-gray-800 transition-colors duration-200`}>
                  <GetAppIcon fontSize="small" />
                  <span className="ml-3">Export PDF File</span>
                </Link>
                {/* Kategori item with onClick handler */}
                <div 
                  onClick={navigateToKategoriKelola} 
                  className={`flex items-center px-4 py-2 ${isActive('/kategori/kelola') || isActive('/kategori') ? 'text-green-400 bg-gray-800' : 'text-gray-300'} hover:bg-gray-800 cursor-pointer transition-colors duration-200`}
                >
                  <CategoryIcon fontSize="small" />
                  <span className="ml-3">Pengelolaan Kategori</span>
                </div>
                <Link to="/pengaturan" className={`flex items-center px-4 py-2 ${isActive('/pengaturan') ? 'text-green-400 bg-gray-800' : 'text-gray-300'} hover:bg-gray-800 transition-colors duration-200`}>
                  <SettingsIcon fontSize="small" />
                  <span className="ml-3">Pengaturan</span>
                </Link>
              </nav>
            </div>
          </div>
          
          {/* Spacer to push the user profile to the bottom when content is not enough */}
          <div className="flex-grow"></div>
          
          {/* User Profile and Logout */}
          <div className="border-t border-gray-800">
            <div className="p-4 flex items-center">
              <div className="h-10 w-10 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden">
                <img src={`https://ui-avatars.com/api/?name=${user && user.username}`} alt="User" className="h-full w-full object-cover" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{user && user.username}</p>
                <p className="text-xs text-gray-500">{user && user.email}</p>
              </div>
            </div>
            
            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 transition duration-150 border-t border-gray-800"
            >
              <LogoutIcon fontSize="small" />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
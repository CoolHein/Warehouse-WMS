import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Home, 
  PackageOpen, 
  ClipboardList,
  PackageCheck,
  Truck,
  Box,
  User,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Activity,
  Bell,
  Search,
  Calendar,
  DollarSign,
  ScanLine,
  MapPin,
  CheckCircle,
  AlertCircle,
  Clock,
  Target,
  Zap,
  Lock,
  Printer,
  BarChart3,
  Users,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// Import the WarehouseProvider and useWarehouse hook
import { WarehouseProvider, useWarehouse } from './hooks/useWarehouseContext';

// Import page components
import Dashboard from './pages/Dashboard';
import Picking from './pages/Picking';
import Packing from './pages/Packing';
import StockControl from './pages/StockControl';
import Inwards from './pages/Inwards';
import Profile from './pages/Profile';
import Products from './pages/Products';
import Login from './pages/Login';
import Shipping from './pages/Shipping';

// Create alias for compatibility with existing components
const useApp = useWarehouse;

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Update state with error details
    this.setState({
      error,
      errorInfo,
      errorCount: this.state.errorCount + 1
    });

    // Log to external service (e.g., Sentry, LogRocket, etc.)
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    // In production, you would send this to an error tracking service
    const errorData = {
      message: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Example: Send to your logging endpoint
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorData)
    // });

    console.log('Error logged:', errorData);
  };

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-900/50 backdrop-blur-xl p-8 rounded-2xl border border-gray-800">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={40} className="text-red-500" />
              </div>
              
              <h1 className="text-2xl font-bold text-white mb-2">Oops! Something went wrong</h1>
              <p className="text-gray-400 mb-6">
                We're sorry for the inconvenience. The error has been logged and we'll fix it soon.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-300">
                    Error Details (Development Only)
                  </summary>
                  <div className="mt-2 p-4 bg-gray-800/50 rounded-lg">
                    <p className="text-red-400 text-sm font-mono mb-2">
                      {this.state.error.toString()}
                    </p>
                    <pre className="text-xs text-gray-500 overflow-auto max-h-48">
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </div>
                </details>
              )}
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={this.handleReset}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <RefreshCw size={16} />
                  <span>Try Again</span>
                </button>
                
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Global Error Handler Hook
const useErrorHandler = () => {
  const navigate = useNavigate();

  const handleError = (error, errorInfo = {}) => {
    console.error('Error handled:', error, errorInfo);
    
    // Determine error type and severity
    const errorType = error.name || 'UnknownError';
    const isNetworkError = error.message?.includes('fetch') || error.message?.includes('network');
    const isAuthError = error.status === 401 || error.message?.includes('unauthorized');
    
    // Show appropriate toast message
    if (isNetworkError) {
      toast.error('Network error. Please check your connection.');
    } else if (isAuthError) {
      toast.error('Session expired. Please login again.');
      navigate('/login');
    } else {
      toast.error(error.message || 'An unexpected error occurred');
    }
    
    // Log to service
    logError(error, errorInfo);
  };

  return { handleError };
};

// Error logging function
const logError = (error, context = {}) => {
  const errorLog = {
    message: error.message,
    stack: error.stack,
    type: error.name,
    timestamp: new Date().toISOString(),
    context,
    browser: {
      userAgent: navigator.userAgent,
      url: window.location.href,
      referrer: document.referrer
    }
  };

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.group('🔴 Error Log');
    console.error('Error:', error);
    console.table(context);
    console.groupEnd();
  }

  // Send to logging service in production
  // Example: logToSentry(errorLog);
};

// Network Error Handler
const handleNetworkError = async (response) => {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // Response wasn't JSON
    }
    
    const error = new Error(errorMessage);
    error.status = response.status;
    error.response = response;
    
    throw error;
  }
  
  return response;
};

// Async Error Wrapper
const asyncHandler = (fn) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error, { function: fn.name, args });
      throw error;
    }
  };
};

// Protected Route Component with Error Handling - FIXED VERSION
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useWarehouse();
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Render children if authenticated
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
};

// Search Modal Component
const SearchModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const searchableItems = [
    { type: 'order', id: 'ORD-2025-001', description: 'Auckland Security - 5 items', path: '/picking' },
    { type: 'product', id: 'ARM-SENS-001', description: 'PIR Motion Sensor', path: '/products' },
    { type: 'po', id: 'PO-2025-001', description: 'TechSense Ltd - $14,000', path: '/inwards' },
  ];

  const filteredItems = searchableItems.filter(item => 
    item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (item) => {
    navigate(item.path);
    onClose();
    setSearchQuery('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="w-full max-w-2xl bg-gray-900 rounded-xl border border-gray-800 shadow-2xl overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Search size={24} className="text-gray-400" />
                </motion.div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search orders, products, or purchase orders..."
                  className="flex-1 bg-transparent text-white text-lg outline-none placeholder:text-gray-500"
                  autoFocus
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </motion.button>
              </div>
              
              <motion.div className="space-y-2">
                <AnimatePresence>
                  {filteredItems.map((item, index) => (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, x: 10 }}
                      onClick={() => handleSelect(item)}
                      className="w-full p-4 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-all duration-300 text-left flex items-center justify-between group"
                    >
                      <div>
                        <p className="font-medium text-white">{item.id}</p>
                        <p className="text-sm text-gray-400">{item.description}</p>
                      </div>
                      <motion.span 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-gray-500 group-hover:text-gray-300"
                      >
                        {item.type.toUpperCase()}
                      </motion.span>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Notifications Panel Component
const NotificationsPanel = ({ isOpen, onClose }) => {
  const { notifications, addNotification } = useWarehouse();

  if (!isOpen) return null;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertCircle className="text-yellow-400" size={20} />;
      case 'success': return <CheckCircle className="text-green-400" size={20} />;
      default: return <Bell className="text-blue-400" size={20} />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={onClose}
          />
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="fixed right-0 top-0 h-full w-96 bg-gray-900 border-l border-gray-800 shadow-2xl z-50"
          >
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Notifications</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              {(!notifications || notifications.length === 0) ? (
                <p className="text-center text-gray-500 py-8">No new notifications</p>
              ) : (
                notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="bg-gray-800/50 p-4 rounded-lg"
                  >
                    <div className="flex items-start space-x-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <h3 className="font-medium text-white">{notification.title}</h3>
                        <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">{notification.time || 'Just now'}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Navigation Component
const Navigation = () => {
  const { user, logout, notifications } = useApp();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const navItems = [
    { path: '/dashboard', name: 'Dashboard', icon: Home },
    { path: '/picking', name: 'Picking', icon: Package },
    { path: '/packing', name: 'Packing', icon: PackageCheck },
    { path: '/shipping', name: 'Shipped', icon: Truck },
    { path: '/inwards', name: 'Inwards', icon: PackageOpen },
    { path: '/stock-control', name: 'Stock Control', icon: ClipboardList },
    { path: '/products', name: 'Products', icon: Box },
    { path: '/profile', name: 'Profile', icon: User }
  ];
  
  const handleLogout = () => {
    logout();
  };
  
  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50"
      >
        <div className="px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <motion.div 
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div 
                  className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Package size={24} className="text-white" />
                </motion.div>
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">Arrowhead WMS</h1>
                </div>
              </motion.div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-1">
                {navItems.slice(0, 6).map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                          isActive 
                            ? 'text-white' 
                            : 'text-gray-400 hover:text-white'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <motion.div
                              layoutId="navbar-indicator"
                              className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/50 rounded-lg"
                              initial={false}
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                          )}
                          <span className="relative z-10">{item.name}</span>
                        </>
                      )}
                    </NavLink>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Search button */}
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowSearch(true)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-300"
              >
                <Search size={20} />
              </motion.button>
              
              {/* Notifications button */}
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowNotifications(true)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-300 relative"
              >
                <Bell size={20} />
                {notifications && notifications.length > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                    className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
                  />
                )}
              </motion.button>
              
              {/* User info */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden md:flex items-center space-x-3 pl-4 border-l border-gray-800"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate('/profile')}
                  className="flex items-center space-x-3 hover:bg-gray-800/50 rounded-lg p-2 transition-all duration-300"
                >
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">{user?.name}</p>
                    <p className="text-xs text-gray-500 font-medium">Level {user?.level} • {user?.role}</p>
                  </div>
                  <motion.div 
                    className="text-2xl"
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    {user?.avatar || '👤'}
                  </motion.div>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-300"
                >
                  <LogOut size={18} />
                </motion.button>
              </motion.div>
              
              {/* Mobile menu */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
              >
                <motion.div
                  animate={{ rotate: mobileMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </motion.div>
              </motion.button>
            </div>
          </div>
          
          {/* XP Bar */}
          {user && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="pb-3"
            >
              <div className="flex items-center justify-between text-xs font-medium mb-1">
                <motion.span 
                  className="text-gray-500"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  Level {user?.level}
                </motion.span>
                <motion.span 
                  className="text-gray-500"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  {user?.xp} / {user?.xpToNextLevel} XP
                </motion.span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(user?.xp / user?.xpToNextLevel) * 100}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 relative"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                  />
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-gray-800 bg-gray-900/95 backdrop-blur-xl overflow-hidden"
            >
              <div className="px-4 py-4 space-y-1">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <NavLink
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                          isActive 
                            ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white border border-blue-500/50' 
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        }`
                      }
                    >
                      <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                        <item.icon size={20} />
                      </motion.div>
                      <span className="font-medium">{item.name}</span>
                    </NavLink>
                  </motion.div>
                ))}
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navItems.length * 0.05 }}
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-300"
                >
                  <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                    <LogOut size={20} />
                  </motion.div>
                  <span className="font-medium">Logout</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
      
      {/* Search Modal */}
      <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
      
      {/* Notifications Panel */}
      <NotificationsPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </>
  );
};

// Layout wrapper
const Layout = ({ children }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-950"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <Navigation />
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-6 py-6 relative z-10"
      >
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
      </motion.main>
    </motion.div>
  );
};

// Main App with Error Handling
function App() {
  // Global unhandled promise rejection handler
  useEffect(() => {
    const handleUnhandledRejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      logError(event.reason, {
        type: 'unhandledRejection',
        promise: event.promise
      });
      
      toast.error('An unexpected error occurred. Please try again.');
      
      // Prevent default browser behavior
      event.preventDefault();
    };

    const handleGlobalError = (event) => {
      console.error('Global error:', event.error);
      
      logError(event.error, {
        type: 'globalError',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
      
      // Prevent default browser behavior for handled errors
      event.preventDefault();
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleGlobalError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleGlobalError);
    };
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <WarehouseProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#fff',
                border: '1px solid #374151',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
                style: {
                  background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                  border: '1px solid #10b981',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
                duration: 6000,
                style: {
                  background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                  border: '1px solid #ef4444',
                },
              },
              // Custom animation
              className: 'toast-animation',
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/inwards"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Inwards />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/stock-control"
              element={
                <ProtectedRoute>
                  <Layout>
                    <StockControl />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/picking"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Picking />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/packing"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Packing />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/shipping"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Shipping />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Products />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              }
            />
            {/* 404 Route */}
            <Route
              path="*"
              element={
                <Layout>
                  <NotFound />
                </Layout>
              }
            />
          </Routes>
        </WarehouseProvider>
      </Router>
    </ErrorBoundary>
  );
}

// 404 Not Found Component
const NotFound = () => {
  const navigate = useNavigate();
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[60vh] flex items-center justify-center"
    >
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="text-center"
      >
        <motion.div 
          className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6"
          animate={{ 
            rotate: [0, 10, -10, 10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
        >
          <AlertCircle size={48} className="text-gray-500" />
        </motion.div>
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold text-white mb-2"
        >
          404
        </motion.h1>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-gray-400 mb-8"
        >
          Page not found
        </motion.p>
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard')}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
        >
          Return to Dashboard
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default App;
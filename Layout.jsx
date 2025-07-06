import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  BarChart3, 
  Truck, 
  ClipboardList, 
  Users, 
  Search,
  Bell,
  LogOut,
  Menu,
  X,
  Home,
  PackageOpen,
  PackageCheck,
  RotateCcw,
  FileText,
  Box
} from 'lucide-react';
import { useWarehouse } from '../hooks/useWarehouseContext';
import SearchModal from './SearchModal';
import NotificationPanel from './NotificationPanel';
import XPProgressBar from './XPProgressBar';

const Layout = () => {
  const { user, logout, notifications } = useWarehouse();
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Inwards', href: '/inwards', icon: PackageOpen },
    { name: 'Stock Control', href: '/stock-control', icon: ClipboardList },
    { name: 'Picking', href: '/picking', icon: Package },
    { name: 'Packing', href: '/packing', icon: PackageCheck },
    { name: 'Returns', href: '/returns', icon: RotateCcw },
    { name: 'Products', href: '/products', icon: Box },
    ...(user?.role === 'Admin' ? [{ name: 'Reports', href: '/reports', icon: FileText }] : []),
    { name: 'Profile', href: '/profile', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-dark-300 text-white">
      {/* Top Navigation Bar */}
      <nav className="glass-card border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <Package size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Arrowhead WMS</h1>
                  <p className="text-xs text-gray-400">v6.0</p>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              {navigation.slice(0, 6).map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    `nav-tab ${isActive ? 'active' : ''}`
                  }
                >
                  <item.icon size={18} className="mr-2" />
                  {item.name}
                </NavLink>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <button
                onClick={() => setShowSearch(true)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <Search size={20} />
              </button>

              {/* Notifications */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-400">Level {user?.level}</p>
                </div>
                <div className="text-2xl">{user?.avatar}</div>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="px-4 pb-2">
          <XPProgressBar 
            current={user?.xp || 0} 
            max={user?.xpToNextLevel || 1000} 
            level={user?.level || 1} 
          />
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="lg:hidden fixed inset-y-0 left-0 w-64 bg-dark-200 z-50 shadow-xl"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-semibold">Menu</h2>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 rounded-lg hover:bg-white/5"
                >
                  <X size={20} />
                </button>
              </div>
              
              <nav className="space-y-2">
                {navigation.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    onClick={() => setShowMobileMenu(false)}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-primary/20 text-primary' 
                          : 'hover:bg-white/5'
                      }`
                    }
                  >
                    <item.icon size={20} />
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      {/* Search Modal */}
      <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />

      {/* Notifications Panel */}
      <AnimatePresence>
        {showNotifications && (
          <NotificationPanel 
            notifications={notifications}
            onClose={() => setShowNotifications(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Layout;
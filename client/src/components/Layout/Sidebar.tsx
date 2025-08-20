import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  CheckSquare,
  MessageCircle,
  Cloud,
  BarChart3,
  Settings,
  X,
  Sparkles
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const Sidebar: React.FC = () => {
  const { sidebarOpen, setSidebarOpen } = useAppContext();

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard', gradient: 'from-blue-500 to-purple-500' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks', gradient: 'from-green-500 to-emerald-500' },
    { path: '/chat', icon: MessageCircle, label: 'AI Chat', gradient: 'from-orange-500 to-red-500' },
    { path: '/weather', icon: Cloud, label: 'Weather', gradient: 'from-sky-500 to-blue-500' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics', gradient: 'from-purple-500 to-pink-500' },
    { path: '/settings', icon: Settings, label: 'Settings', gradient: 'from-gray-500 to-slate-500' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : -320,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 z-50 h-full w-80 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 shadow-2xl lg:relative lg:translate-x-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Smart Assistant</h1>
              <p className="text-sm text-purple-200">Your AI Companion</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-6 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-white/20 backdrop-blur-sm shadow-lg'
                    : 'hover:bg-white/10 hover:backdrop-blur-sm'
                }`
              }
              onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`p-2 rounded-lg bg-gradient-to-r ${item.gradient} ${
                      isActive ? 'shadow-lg scale-110' : 'group-hover:scale-105'
                    } transition-transform duration-300`}
                  >
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <span
                    className={`font-medium ${
                      isActive ? 'text-white' : 'text-purple-100 group-hover:text-white'
                    } transition-colors duration-300`}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-2 h-2 bg-white rounded-full"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Status Card */}
        <div className="absolute bottom-6 left-6 right-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-4 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">System Status</p>
                <p className="font-semibold">All Systems Operational</p>
              </div>
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            </div>
          </motion.div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
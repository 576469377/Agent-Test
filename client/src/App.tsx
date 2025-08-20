import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';

// Components
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import TaskManager from './components/Tasks/TaskManager';
import ChatInterface from './components/Chat/ChatInterface';
import WeatherWidget from './components/Weather/WeatherWidget';
import Analytics from './components/Analytics/Analytics';
import Settings from './components/Settings/Settings';

// Styles
import './App.css';

// Context
import { AppContext } from './context/AppContext';

const App: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Join user room for personalized updates
    newSocket.emit('join-room', 1); // Using user ID 1 for demo

    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }

    setLoading(false);

    return () => {
      newSocket.close();
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading Smart Assistant...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider 
      value={{ 
        socket, 
        theme, 
        toggleTheme, 
        sidebarOpen, 
        setSidebarOpen 
      }}
    >
      <Router>
        <div className={`app ${theme}`}>
          <Sidebar />
          <div className="main-content">
            <Header />
            <div className="content-area">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/tasks" element={<TaskManager />} />
                <Route path="/chat" element={<ChatInterface />} />
                <Route path="/weather" element={<WeatherWidget />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </div>
          </div>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: theme === 'dark' ? '#1f2937' : '#ffffff',
                color: theme === 'dark' ? '#ffffff' : '#1f2937',
                border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
              },
            }}
          />
        </div>
      </Router>
    </AppContext.Provider>
  );
};

export default App;

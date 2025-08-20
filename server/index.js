const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database setup
const db = require('./database/db');

// Routes
const weatherRoutes = require('./routes/weather');
const tasksRoutes = require('./routes/tasks');
const chatRoutes = require('./routes/chat');
const analyticsRoutes = require('./routes/analytics');

app.use('/api/weather', weatherRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analytics', analyticsRoutes);

// WebSocket handling for real-time features
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  // Join a room for personalized updates
  socket.on('join-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`👤 User ${userId} joined their room`);
  });

  // Handle real-time chat messages
  socket.on('chat-message', async (data) => {
    try {
      // Simulate AI response processing
      const aiResponse = await simulateAIResponse(data.message);
      
      // Emit response back to the user
      socket.emit('chat-response', {
        id: Date.now(),
        message: aiResponse,
        timestamp: new Date().toISOString(),
        type: 'ai'
      });
    } catch (error) {
      console.error('Chat error:', error);
      socket.emit('chat-error', { message: 'Sorry, I encountered an error.' });
    }
  });

  // Handle task updates
  socket.on('task-update', (data) => {
    // Broadcast task updates to all clients in the user's room
    socket.to(`user-${data.userId}`).emit('task-updated', data);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// AI Response Simulation
async function simulateAIResponse(message) {
  const responses = [
    `I understand you said: "${message}". How can I help you further?`,
    `That's interesting! "${message}" - would you like me to elaborate on that?`,
    `Thanks for sharing: "${message}". Is there anything specific you'd like me to do?`,
    `I've processed your message: "${message}". Here are some suggestions...`,
    `Based on "${message}", I think you might be interested in...`
  ];
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  return responses[Math.floor(Math.random() * responses.length)];
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler for other routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💡 WebSocket server ready for real-time connections`);
});

module.exports = { app, server, io };
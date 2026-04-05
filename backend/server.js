import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables - handle missing .env file gracefully
const envPath = path.resolve(__dirname, '.env');
console.log('Loading .env from:', envPath);

// Try to load .env file, but don't fail if it doesn't exist (for Render)
const result = dotenv.config({ path: envPath });

// Only log dotenv error if it's not the missing file error
if (result.error && result.error.code !== 'ENOENT') {
  console.error('Dotenv error:', result.error);
}

// Log which environment variables are loaded (don't log actual values for security)
console.log('Environment variables status:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Loaded' : 'Not found');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Loaded' : 'Not found');
console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'Loaded' : 'Not found');

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fs from 'fs';

// Import routes (except AI routes which will be imported dynamically)
import authRoutes from './routes/auth.js';
import progressRoutes from './routes/progress.js';
import leaderboardRoutes from './routes/leaderboard.js';
import achievementsRoutes from './routes/achievements.js';
import microLearningRoutes from './routes/microLearning.js';
// Import MicroLesson model to ensure it's registered - using explicit path
import MicroLesson from './models/MicroLesson.js';
import adminRoutes from './routes/admin.js';
import contactsRoutes from './routes/contacts.js';
import userRoutes from './routes/users.js';

import levelsRoutes from './routes/levels.js';
import learningLeaderboardRoutes from './routes/learningLeaderboard.js';

// Import AI routes separately to avoid early loading issues
let aiRoutes;
try {
  if (process.env.GROQ_API_KEY) {
    const aiModule = await import('./routes/ai.js');
    aiRoutes = aiModule.default;
    console.log('✅ AI routes loaded successfully');
  } else {
    console.log('⚠️ AI routes disabled due to missing GROQ_API_KEY');
  }
} catch (error) {
  console.warn('Failed to load AI routes:', error.message);
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "https://*.trycloudflare.com", "https://*.workers.dev", "*"],
    methods: ["GET", "POST"]
  }
});

// Middleware
// Configure CORS with more explicit settings
const corsOptions = {
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000', 
    'http://localhost:3001',
    'https://*.trycloudflare.com',
    'https://*.workers.dev',
    '*'
  ],
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Add CORS headers manually to all responses as a fallback
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173', 
    'http://localhost:3000', 
    'http://localhost:3001',
    'https://*.trycloudflare.com',
    'https://*.workers.dev'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || 
      origin?.endsWith('.trycloudflare.com') || 
      origin?.endsWith('.workers.dev')) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});

// MongoDB Connection
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));

  // Add connection event listeners for better debugging
  mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to DB');
  });

  mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
  });
} else {
  console.error('❌ MONGODB_URI is not defined in environment variables');
}

// Routes
app.use('/api/auth', authRoutes);
if (aiRoutes) {
  app.use('/api/ai', aiRoutes);
}
app.use('/api/progress', progressRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/micro-learning', microLearningRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/users', userRoutes);

app.use('/api/levels', levelsRoutes);
app.use('/api/leaderboard', learningLeaderboardRoutes);

// Serve static files from the React app build directory in production
// This is for when frontend and backend are deployed together on platforms like Cyclic.sh
if (process.env.NODE_ENV === 'production') {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const distPath = path.join(__dirname, '../dist');
  
  // Check if dist directory exists before serving static files
  if (fs.existsSync(distPath)) {
    console.log('Serving static files from:', distPath);
    app.use(express.static(distPath));
    
    // Catch-all handler for client-side routing
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      // Check if index.html exists before serving it
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        // If index.html doesn't exist, send a simple API response
        res.status(404).json({ 
          message: 'Frontend files not found. This is a backend API server.', 
          apiDocs: '/health',
          timestamp: new Date().toISOString()
        });
      }
    });
  } else {
    console.log('Dist directory not found, API-only mode.');
    // Add a simple catch-all for when there's no frontend
    app.get('*', (req, res) => {
      res.status(404).json({ 
        message: 'Frontend files not found. This is a backend API server.', 
        apiDocs: '/health',
        timestamp: new Date().toISOString()
      });
    });
  }
}

// Add a health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5002;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
httpServer.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Socket.IO for peer chat - Random matching system
let waitingUsers = [];
const activeRooms = new Map();
const onlineUsers = new Map();

// Function to broadcast online users count
function broadcastOnlineStats() {
  const stats = {
    totalOnline: onlineUsers.size,
    waiting: waitingUsers.length,
    inCall: activeRooms.size / 2, // Divide by 2 because each room has 2 users
    onlineUsersList: Array.from(onlineUsers.values()).map(user => ({
      userName: user.userName,
      status: activeRooms.has(user.socketId) ? 'in-chat' : waitingUsers.find(w => w.id === user.socketId) ? 'waiting' : 'idle'
    }))
  };
  io.emit('online-stats', stats);
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-chat', (data) => {
    const userName = data?.userName || 'Anonymous';
    socket.userName = userName;
    
    console.log(`User ${socket.id} (${userName}) joined chat`);
    
    // Add to online users
    onlineUsers.set(socket.id, { userName, socketId: socket.id });
    broadcastOnlineStats();

    // Try to match with a waiting user
    if (waitingUsers.length > 0) {
      const peer = waitingUsers.shift();
      const roomId = `room_${socket.id}_${peer.id}`;
      
      console.log(`Matching ${socket.id} (${userName}) with ${peer.id} (${peer.userName}) in room ${roomId}`);
      
      // Both users join the same room
      socket.join(roomId);
      peer.join(roomId);
      
      // Store room info
      activeRooms.set(socket.id, { roomId, peerId: peer.id, peerName: peer.userName });
      activeRooms.set(peer.id, { roomId, peerId: socket.id, peerName: userName });
      
      // Notify both users they are matched
      socket.emit('peer-matched', { peerName: peer.userName, roomId });
      peer.emit('peer-matched', { peerName: userName, roomId });
      
      console.log(`Matched ${socket.id} (${userName}) with ${peer.id} (${peer.userName}) in room ${roomId}`);
      broadcastOnlineStats();
    } else {
      // Add to waiting list
      waitingUsers.push(socket);
      socket.emit('waiting-for-peer');
      console.log(`User ${socket.id} (${userName}) is waiting for a peer`);
      broadcastOnlineStats();
    }
  });

  socket.on('message', (data) => {
    const roomInfo = activeRooms.get(socket.id);
    if (roomInfo) {
      console.log(`Message from ${socket.id} (${socket.userName}): ${data.message}`);
      socket.to(roomInfo.roomId).emit('message', {
        message: data.message,
        sender: socket.userName,
        timestamp: new Date()
      });
    } else {
      console.log(`Message from ${socket.id} (${socket.userName}) but no room info found`);
    }
  });

  // WebRTC signaling
  socket.on('voice-call-request', (data) => {
    console.log(`📞 Voice call request from ${socket.id} (${socket.userName}) to room`);
    const roomInfo = activeRooms.get(socket.id);
    if (roomInfo) {
      console.log(`Sending voice-call-request to room ${roomInfo.roomId} for user ${roomInfo.peerName}`);
      socket.to(roomInfo.roomId).emit('voice-call-request', { from: socket.userName });
      console.log(`Voice call request sent to ${roomInfo.peerName}`);
    } else {
      console.log('No room info found for this socket');
    }
  });

  socket.on('voice-call-accepted', () => {
    console.log(`✅ Voice call accepted by ${socket.id} (${socket.userName})`);
    const roomInfo = activeRooms.get(socket.id);
    if (roomInfo) {
      socket.to(roomInfo.roomId).emit('voice-call-accepted');
    }
  });

  socket.on('voice-call-rejected', () => {
    console.log(`❌ Voice call rejected by ${socket.id} (${socket.userName})`);
    const roomInfo = activeRooms.get(socket.id);
    if (roomInfo) {
      socket.to(roomInfo.roomId).emit('voice-call-rejected');
    }
  });

  socket.on('voice-call-offer', (data) => {
    console.log(`📡 Voice call offer from ${socket.id} (${socket.userName})`);
    const roomInfo = activeRooms.get(socket.id);
    if (roomInfo) {
      socket.to(roomInfo.roomId).emit('voice-call-offer', data);
    }
  });

  socket.on('voice-call-answer', (data) => {
    console.log(`📡 Voice call answer from ${socket.id} (${socket.userName})`);
    const roomInfo = activeRooms.get(socket.id);
    if (roomInfo) {
      socket.to(roomInfo.roomId).emit('voice-call-answer', data);
    }
  });

  socket.on('ice-candidate', (data) => {
    console.log(`🧊 ICE candidate from ${socket.id} (${socket.userName})`);
    const roomInfo = activeRooms.get(socket.id);
    if (roomInfo) {
      socket.to(roomInfo.roomId).emit('ice-candidate', data);
    }
  });

  socket.on('voice-call-ended', () => {
    console.log(`☎️ Voice call ended by ${socket.id} (${socket.userName})`);
    const roomInfo = activeRooms.get(socket.id);
    if (roomInfo) {
      socket.to(roomInfo.roomId).emit('voice-call-ended');
    }
  });

  socket.on('typing', () => {
    const roomInfo = activeRooms.get(socket.id);
    if (roomInfo) {
      socket.to(roomInfo.roomId).emit('peer-typing', { userName: socket.userName });
    }
  });

  socket.on('stop-typing', () => {
    const roomInfo = activeRooms.get(socket.id);
    if (roomInfo) {
      socket.to(roomInfo.roomId).emit('peer-stop-typing');
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove from online users
    onlineUsers.delete(socket.id);
    
    // Remove from waiting list if present
    waitingUsers = waitingUsers.filter(user => user.id !== socket.id);
    
    // Notify peer if in an active room
    const roomInfo = activeRooms.get(socket.id);
    if (roomInfo) {
      socket.to(roomInfo.roomId).emit('peer-disconnected', { peerName: socket.userName });
      activeRooms.delete(roomInfo.peerId);
      activeRooms.delete(socket.id);
    }
    
    // Broadcast updated stats
    broadcastOnlineStats();
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Import and schedule the leaderboard cache clearing job
import './jobs/clearLeaderboardCache.js';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.js';
import rideRoutes from './routes/ride.js';
import bookingRoutes from './routes/booking.js';
import reviewRoutes from './routes/review.js';
import chatRoutes from './routes/chat.js';

dotenv.config();
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Socket.IO connection handling
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('🔌 Socket connected:', socket.id);

  // User joins with their userId
  socket.on('join', (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.userId = userId;
    console.log(`👤 User ${userId} online`);
  });

  // Join a conversation room
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
  });

  // Leave a conversation room
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
  });

  // Send message — relay to conversation room
  socket.on('send_message', (data) => {
    const { conversationId, message } = data;
    socket.to(`conversation_${conversationId}`).emit('new_message', message);
  });

  // Typing indicator
  socket.on('typing', (data) => {
    socket.to(`conversation_${data.conversationId}`).emit('user_typing', {
      userId: socket.userId,
      conversationId: data.conversationId,
    });
  });

  socket.on('stop_typing', (data) => {
    socket.to(`conversation_${data.conversationId}`).emit('user_stop_typing', {
      userId: socket.userId,
      conversationId: data.conversationId,
    });
  });

  // Notification to specific user
  socket.on('send_notification', (data) => {
    const { recipientId, notification } = data;
    const recipientSocketId = onlineUsers.get(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('notification', notification);
    }
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
    }
    console.log('🔌 Socket disconnected:', socket.id);
  });
});

// Make io accessible in routes
app.set('io', io);

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ 
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
  ], 
  credentials: true 
}));
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again after 15 minutes' },
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/rides', rideRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/chat', chatRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ success: true, message: 'KaamatKaam API is running 🚗', version: '2.0.0' });
});

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO ready for connections`);
});

export { io };

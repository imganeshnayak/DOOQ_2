import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoutes from './routes/users.js';
import taskRoutes from './routes/tasks.js';
import offerRoutes from './routes/offers.js'
import Message from './models/message.js';  // Add this import
import notificationRoutes from './routes/notifications.js'; // ✅ Import notification routes
import messageRoutes from './routes/messages.js'; // ✅ Import message routes
import { getCurrentUser } from './controllers/userController.js'; // ✅ Import function
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
// ... other imports

import authMiddleware from './middleware/auth.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: ['http://localhost:19006', 'http://192.168.154.125:19006'],
    credentials: true
}));
app.use(express.json());

// Make io available to our app
app.set('io', io);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes); // ✅ Register notification API
app.use('/api/messages', authMiddleware, messageRoutes); // ✅ Register message API
app.get('/api/me', authMiddleware, getCurrentUser);

app.use('/api/offers', offerRoutes); // ✅ Ensure this line is present

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.userId);
  
  socket.on('joinChat', (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.userId} joined chat ${chatId}`);
  });

  socket.on('message', async (data, callback) => {
    try {
      const { receiverId, content, tempId } = data;
      
      const message = new Message({
        sender: socket.userId,
        receiver: receiverId,
        content: content.trim(),
        read: false
      });

      await message.save();

      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'name')
        .populate('receiver', 'name');

      // Send acknowledgement to sender
      if (callback) {
        callback({ 
          success: true, 
          messageId: message._id.toString() 
        });
      }

      // Emit to both sender and receiver
      io.to(receiverId).to(socket.userId).emit('newMessage', populatedMessage);
      io.to(receiverId).emit('conversationUpdate');

    } catch (error) {
      console.error('❌ Socket message error:', error);
      if (callback) {
        callback({ success: false, error: 'Failed to send message' });
      }
      socket.emit('messageError', { message: 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.userId);
  });
});

// Error handling middleware
app.use((err, _req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
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
    origin: ['http://localhost:19006', 'http://192.168.154.125:19006','http://192.168.1.126:5000'],
    credentials: true
}));
app.use(express.json());

// Make io available to our app
app.set('io', io);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes); // Register notification API
app.use('/api/messages', authMiddleware, messageRoutes); // ✅ Register message API
app.get('/api/me', authMiddleware, getCurrentUser);
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

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
        read: false,
        status: 'sent' // Initial status
      });

      await message.save();

      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'name')
        .populate('receiver', 'name');

      // Check if receiver is online
      const receiverSocket = [...io.sockets.sockets.values()]
        .find(s => s.userId === receiverId);

      if (receiverSocket) {
        // Update to delivered if receiver is online
        populatedMessage.status = 'delivered';
        await populatedMessage.save();
      }

      // Send acknowledgement to sender
      if (callback) {
        callback({ 
          success: true, 
          messageId: message._id,
          status: populatedMessage.status
        });
      }

      // Emit to both users
      io.to(socket.userId).to(receiverId).emit('newMessage', populatedMessage);
      io.to(receiverId).emit('conversationUpdate');

    } catch (error) {
      console.error('Socket message error:', error);
      if (callback) {
        callback({ success: false, error: 'Failed to send message' });
      }
    }
  });

  socket.on('messageReceived', async ({ messageId }) => {
    try {
      const message = await Message.findById(messageId);
      if (message) {
        message.status = 'delivered';
        await message.save();
        io.to(message.sender.toString()).emit('messageDelivered', messageId);
      }
    } catch (error) {
      console.error('Error marking message as delivered:', error);
    }
  });

  socket.on('messageRead', async ({ messageId }) => {
    try {
      const message = await Message.findById(messageId);
      if (message && message.receiver.toString() === socket.userId) {
        // Update message status
        message.status = 'read';
        message.read = true;
        await message.save();

        // Notify sender about read status
        io.to(message.sender.toString()).emit('messageRead', {
          messageId: message._id.toString(),
          status: 'read'
        });

        // Update unread count for the conversation
        const unreadCount = await Message.countDocuments({
          sender: message.sender,
          receiver: socket.userId,
          read: false
        });

        // Emit updated unread count
        io.to(socket.userId).emit('unreadCountUpdate', {
          senderId: message.sender.toString(),
          count: unreadCount
        });
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
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
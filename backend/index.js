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
import { sendPushNotification } from './services/notificationService.js'; // Import sendPushNotification
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
// In your socket.io connection handler
// io.on('connection', (socket) => {
//   console.log('✅ User connected:', socket.userId);

//   // Join user to their personal room
//   socket.join(socket.userId);

//   socket.on('message', async (data, callback) => {
//     try {
//       const { receiverId, content } = data;
      
//       // Create and save message
//       const message = new Message({
//         sender: socket.userId,
//         receiver: receiverId,
//         content: content.trim(),
//         status: 'delivered' // Mark as delivered immediately
//       });

//       await message.save();

//       // Populate sender info
//       const populated = await Message.populate(message, {
//         path: 'sender',
//         select: 'name avatar'
//       });

//       // Send back to sender (confirm delivery)
//       callback({ 
//         success: true,
//         message: populated.toObject() // Send full message data
//       });

//       // Send to receiver
//       io.to(receiverId).emit('newMessage', populated.toObject());

//       console.log(`Message ${message._id} sent to ${receiverId}`);

//     } catch (error) {
//       console.error('Message send error:', error);
//       callback({ success: false, error: 'Failed to send' });
//     }
//   });
// });



// Error handling middleware
app.use((err, _req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// io.on('connection', (socket) => {
//   console.log('✅ User connected:', socket.userId);

//   // Join user to their personal room
//   socket.join(socket.userId);

//   // Handle message sending
//   socket.on('message', async (data, callback) => {
//     try {
//       const { receiverId, content, tempId } = data;

//       // Create and save message with default status: "sent"
//       const message = new Message({
//         sender: socket.userId,
//         receiver: receiverId,
//         content: content.trim(),
//         status: 'sent'
//       });

//       await message.save();

//       // Populate sender info
//       const populated = await Message.populate(message, {
//         path: 'sender',
//         select: 'name avatar'
//       });

//       // Acknowledge message to sender (confirm sending success)
//       callback({ 
//         success: true,
//         messageId: message._id,
//         message: populated.toObject()
//       });

//       // Send message to receiver
//       io.to(receiverId).emit('newMessage', populated.toObject());

//       console.log(`📨 Message ${message._id} sent to ${receiverId}`);

//       // Check if receiver is online
//       const receiverSockets = await io.in(receiverId).fetchSockets();
      
//       if (receiverSockets.length > 0) {
//         // Mark as delivered instantly if the receiver is online
//         message.status = 'delivered';
//         await message.save();

//         // Notify sender that the message was delivered (double tick)
//         io.to(socket.userId).emit('messageDelivered', { messageId: message._id });

//         // Send updated message status to receiver
//         io.to(receiverId).emit('messageUpdated', { messageId: message._id, status: 'delivered' });
//       }

//     } catch (error) {
//       console.error('❌ Message send error:', error);
//       callback({ success: false, error: 'Failed to send message' });
//     }
//   });

//   // Handle message read event (Blue Tick)
//   socket.on('messageRead', async ({ messageId }) => {
//     try {
//       const message = await Message.findById(messageId);
//       if (!message) return;

//       message.status = 'read';
//       await message.save();

//       // Notify the sender that the message was read
//       io.to(message.sender.toString()).emit('messageRead', { messageId });

//       console.log(`✅ Message ${messageId} marked as read`);
//     } catch (error) {
//       console.error('❌ Read acknowledgement error:', error);
//     }
//   });

//   // Handle disconnection
//   socket.on('disconnect', () => {
//     console.log('❌ User disconnected:', socket.userId);
//   });
// });

// ... existing imports ...

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.userId);

  socket.join(socket.userId);

  socket.on('message', async (data, callback) => {
    try {
      const { receiverId, content, tempId } = data;

      // Create message with unread status
      const message = new Message({
        sender: socket.userId,
        receiver: receiverId,
        content: content.trim(),
        status: 'sent',
        read: false // Ensure message starts as unread
      });

      await message.save();

      const populated = await Message.populate(message, {
        path: 'sender',
        select: 'name avatar'
      });

      callback({ 
        success: true,
        messageId: message._id,
        message: populated.toObject()
      });

      io.to(receiverId).emit('newMessage', populated.toObject());

      // Update unread count for receiver
      const unreadCount = await Message.countDocuments({
        receiver: receiverId,
        read: false
      });

      io.to(receiverId).emit('unreadCountUpdate', { count: unreadCount });

    } catch (error) {
      console.error('❌ Message send error:', error);
      callback({ success: false, error: 'Failed to send message' });
    }
  });

  socket.on('messageRead', async ({ messageId }) => {
    try {
      const message = await Message.findByIdAndUpdate(
        messageId,
        { 
          $set: { 
            status: 'read',
            read: true 
          }
        },
        { new: true }
      );

      if (!message) return;

      // Notify sender that message was read
      io.to(message.sender.toString()).emit('messageRead', { messageId });

      // Update unread count for receiver
      const unreadCount = await Message.countDocuments({
        receiver: message.receiver,
        read: false
      });

      io.to(message.receiver.toString()).emit('unreadCountUpdate', { count: unreadCount });

      console.log(`✅ Message ${messageId} marked as read, unread count: ${unreadCount}`);
    } catch (error) {
      console.error('❌ Read acknowledgement error:', error);
    }
  });

  socket.on('markConversationRead', async ({ otherUserId }) => {
    try {
      // Mark all messages from other user as read
      await Message.updateMany(
        {
          sender: otherUserId,
          receiver: socket.userId,
          read: false
        },
        {
          $set: { 
            status: 'read',
            read: true 
          }
        }
      );

      // Get updated unread count
      const unreadCount = await Message.countDocuments({
        receiver: socket.userId,
        read: false
      });

      // Notify about read status
      io.to(socket.userId).emit('unreadCountUpdate', { count: unreadCount });
      io.to(otherUserId).emit('conversationRead', { userId: socket.userId });

      console.log(`✅ Conversation with ${otherUserId} marked as read`);
    } catch (error) {
      console.error('❌ Mark conversation read error:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.userId);
  });
});

// io.on('connection', (socket) => {
//   console.log('✅ User connected:', socket.userId);

//   socket.on('joinChat', (chatId) => {
//     socket.join(chatId);
//   });

//   socket.on('message', async (data, callback) => {
//     try {
//       const { receiverId, content, tempId } = data;
      
//       const message = new Message({
//         sender: socket.userId,
//         receiver: receiverId,
//         content: content.trim(),
//         status: 'sent'
//       });

//       await message.save();

//       // Populate sender info
//       const populated = await message.populate('sender', 'name avatar');

//       // Acknowledge to sender
//       callback({ 
//         success: true,
//         messageId: message._id,
//         message: populated.toObject()
//       });

//       // Check if receiver is online
//       const receiverSockets = await io.in(receiverId).fetchSockets();
      
//       if (receiverSockets.length > 0) {
//         // Immediate delivery
//         message.status = 'delivered';
//         await message.save();
        
//         // Notify sender of delivery
//         socket.emit('messageDelivered', { messageId: message._id });
        
//         // Send to receiver
//         io.to(receiverId).emit('newMessage', populated.toObject());
//       }
//     } catch (error) {
//       console.error('Message send error:', error);
//       callback({ success: false, error: 'Failed to send message' });
//     }
//   });

//   socket.on('messageDelivered', async ({ messageId }) => {
//     try {
//       await Message.updateOne(
//         { _id: messageId },
//         { status: 'delivered' }
//       );
//     } catch (error) {
//       console.error('Delivery acknowledgement error:', error);
//     }
//   });

//   socket.on('messageRead', async ({ messageId }) => {
//     try {
//       await Message.updateOne(
//         { _id: messageId },
//         { status: 'read', read: true }
//       );
      
//       // Notify sender
//       const message = await Message.findById(messageId);
//       if (message) {
//         io.to(message.sender.toString()).emit('messageRead', { messageId });
//       }
//     } catch (error) {
//       console.error('Read acknowledgement error:', error);
//     }
//   });
// });
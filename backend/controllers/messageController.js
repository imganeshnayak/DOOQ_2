import Message from '../models/message.js';
import Notification from '../models/notification.js';
import User from '../models/users.js';
import mongoose from 'mongoose';

export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.userId;

    if (!receiverId || !content.trim()) {
      return res.status(400).json({ message: 'Receiver ID and content are required' });
    }

    // Convert string IDs to ObjectId if needed
    const senderObjectId = mongoose.Types.ObjectId(senderId);
    const receiverObjectId = mongoose.Types.ObjectId(receiverId);

    const message = new Message({
      sender: senderObjectId,
      receiver: receiverObjectId,
      content: content.trim(),
      read: false
    });

    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name')
      .populate('receiver', 'name');

    // Socket.IO emission
    const io = req.app.get('io');
    if (io) {
      io.to(senderId).to(receiverId).emit('newMessage', populatedMessage);
      io.to(receiverId).emit('conversationUpdate');
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('❌ Error in sendMessage:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;

    // Get messages
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('sender', 'name')
    .populate('receiver', 'name');

    // Mark messages as read
    await Message.updateMany(
      {
        sender: userId,
        receiver: currentUserId,
        read: false
      },
      { $set: { read: true } }
    );

    res.json(messages);
  } catch (error) {
    console.error('Error in getMessages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find all messages grouped by conversation
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$sender", userId] },
              then: "$receiver",
              else: "$sender"
            }
          },
          lastMessage: { $first: "$content" },
          lastMessageTime: { $first: "$createdAt" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiver", userId] },
                    { $eq: ["$read", false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Populate user details
    const conversations = await Promise.all(
      messages.map(async (conv) => {
        const otherUser = await User.findById(conv._id);
        return {
          userId: otherUser._id,
          userName: otherUser.name,
          lastMessage: conv.lastMessage,
          lastMessageTime: conv.lastMessageTime,
          unreadCount: conv.unreadCount
        };
      })
    );

    console.log('Sending conversations with unread counts:', conversations);
    res.json(conversations);
  } catch (error) {
    console.error('Error in getConversations:', error);
    res.status(500).json({ message: 'Error fetching conversations' });
  }
};
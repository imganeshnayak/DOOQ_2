import { Schema, model } from 'mongoose';

const messageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  task: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['sending', 'sent', 'delivered', 'read', 'error'],
    default: 'sent'
  },
  read: {
    type: Boolean,
    default: false,
    index: true // Add this line for better query performance
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add compound index for faster conversation queries
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

export default model('Message', messageSchema);
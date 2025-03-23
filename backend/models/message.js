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
  read: {
    type: Boolean,
    default: false,
    index: true // Add this line for better query performance
  }
}, {
  timestamps: true
});

// Add compound index for faster conversation queries
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

export default model('Message', messageSchema);
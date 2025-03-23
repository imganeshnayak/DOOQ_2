import { Schema, model } from 'mongoose';

const notificationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['offer', 'message', 'offer_accepted', 'offer_rejected'],
    required: true
  },
  task: {
    type: Schema.Types.ObjectId,
    ref: 'Task'
  },
  offer: {
    type: Schema.Types.ObjectId,
    ref: 'Offer'
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  senderId: { // Add this field
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderName: { // Add this field
    type: String,
    required: true
  },
}, {
  timestamps: true
});

export default model('Notification', notificationSchema);
import { Schema, model } from 'mongoose';
import mongoose from 'mongoose';

const offerSchema = new Schema({
  task: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  tasker: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  estimatedTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Update middleware to also update task's lastOfferAt field
offerSchema.post('save', async function(doc) {
  try {
    const Task = mongoose.model('Task');
    await Task.findByIdAndUpdate(
      doc.task,
      { 
        $addToSet: { offers: doc._id },
        lastOfferAt: new Date() // Add this timestamp
      }
    );
  } catch (error) {
    console.error('Error updating task offers:', error);
  }
});

export default model('Offer', offerSchema);
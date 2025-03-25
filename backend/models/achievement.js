import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  level: {
    type: String,
    enum: ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'],
    default: 'BRONZE'
  },
  points: {
    type: Number,
    default: 0
  },
  completedTasks: {
    type: Number,
    default: 0
  },
  badges: [{
    name: String,
    description: String,
    unlockedAt: Date
  }],
  milestones: [{
    name: String,
    requirement: Number,
    achieved: Boolean,
    achievedAt: Date
  }]
}, { timestamps: true });

export default mongoose.model('Achievement', achievementSchema);
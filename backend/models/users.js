import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  location: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null }
  },
  zipcode: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  memberSince: {
    type: Date,
    default: Date.now,
  },
  rating: {
    type: Number,
    default: 0,
  },
  reviews: [{
    type: Schema.Types.ObjectId,
    ref: 'Review'
  }],
  completedTasks: {
    type: Number,
    default: 0,
  },
  onTimeRate: {
    type: Number,
    default: 100
  },
  repeatClients: {
    type: Number,
    default: 0
  },
  bio: {
    type: String,
    default: '',
  },
  resetToken: {
    type: String,
    default: null
  },
  resetTokenExpiry: {
    type: Date,
    default: null
  },
  otp: {
    code: {
      type: String,
      required: false
    },
    expiry: {
      type: Date,
      required: false
    },
    verified: {
      type: Boolean,
      default: false
    }
  },
  expoPushToken: {
    type: String,
    default: null
  },
  achievements: {
    type: Schema.Types.ObjectId,
    ref: 'Achievement'
  },
  level: {
    type: String,
    enum: ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'],
    default: 'BRONZE'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add the virtual field with a different name to avoid conflicts
userSchema.virtual('userReviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'targetUser'
});

// Add a method to get reviews
userSchema.methods.getReviews = async function() {
  await this.populate('userReviews');
  return this.userReviews;
};

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

export default model('User', userSchema);
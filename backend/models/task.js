import { Schema, model } from 'mongoose';

const taskSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  budget: {
    type: Number,
    required: true,
  },
  location: {
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    zipcode: {
      type: String,
      required: true,
    },
    coordinates: {
      latitude: Number,
      longitude: Number,
    }
  },
  image: {
    type: String, // This will store the image URL/path
    default: null // Optional field
  },
  category: {
    type: String,
    required: true,
    enum:  [
      'Moving', 'Cleaning', 'Delivery', 'Assembly', 'Gardening', 'Painting', 'Pet Care', 'Tech Help', 'Other',
      'Accounting & Tax Services',
      'Automobile Services',
      'Beauty & Personal Care',
      'Carpentry',
      'Catering Services',
      'Cooking & Home Chef',
      'Delivery & Pickup Services',
      'Documentation & Legal Help',
      'Electrical',
      'Event Help',
      'Fitness & Wellness',
      'Graphic Design & Video Editing',
      'Handyman Services',
      'Home Cleaning',
      'Home Improvement',
      'Home Renovation',
      'Home Repairs',
      'Language Translation & Content Writing',
      'Laundry & Dry Cleaning',
      'Marketing & Social Media',
      'Moving & Relocation Services',
      'Music & Dance Lessons',
      'Online Tutoring & Coaching',
      'Painting & Waterproofing',
      'Pest Control',
      'Personal Assistant',
      'Pet Care & Grooming',
      'Photography & Videography',
      'Plumbing',
      'Repair & Maintenance (Gadgets, AC, Fridge, TV, etc.)',
      'Security & Surveillance',
      'Tailoring & Alterations',
      'Tech Help & IT Support',
      'Other'
    ]
      },
  status: {
    type: String,
    enum: ['open', 'assigned', 'completed', 'cancelled'],
    default: 'open'
  },
  dueDate: {
    type: Date,
    required: true
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  offers: [{
    type: Schema.Types.ObjectId,
    ref: 'Offer'
  }],
  lastOfferAt: {
    type: Date,
    default: null
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Add a pre-find middleware to always populate offers
taskSchema.pre('find', function() {
  this.populate('offers');
});

// Add a method to update offers count
taskSchema.methods.updateOffersCount = async function() {
  const offersCount = await mongoose.model('Offer').countDocuments({ task: this._id });
  this.offersCount = offersCount;
  return this.save();
};

export default model('Task', taskSchema);
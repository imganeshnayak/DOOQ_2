import Offer from '../models/offer.js';
import Task from '../models/task.js';
import Notification from '../models/notification.js';
import Message from '../models/message.js';

export const createOffer = async (req, res) => {
  try {
    const { taskId, amount, message, estimatedTime } = req.body;
    
    console.log('Creating offer:', { taskId, amount, message, estimatedTime });

    // Validate required fields
    if (!taskId || !amount || !message || !estimatedTime) {
      return res.status(400).json({ 
        message: 'Missing required fields' 
      });
    }

    // Check if task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Create the offer
    const offer = new Offer({
      task: taskId,
      tasker: req.user.userId,
      amount,
      message,
      estimatedTime
    });

    await offer.save();

    // Create notification for task creator
    const notification = new Notification({
      user: task.creator, // Task creator (receiver of the notification)
      type: 'offer',
      task: taskId,
      offer: offer._id,
      senderId: req.user.userId, // ID of the user making the offer
      senderName: req.user.name, // Name of the user making the offer
      message: `New offer received for task: ${task.title}`
    });
    await notification.save();

    res.status(201).json(offer);
  } catch (error) {
    console.error('Offer creation error:', error);
    res.status(500).json({ 
      message: 'Error creating offer', 
      error: error.message 
    });
  }
};









export const updateOfferStatus = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { status } = req.body;

    const offer = await Offer.findById(offerId).populate('task');
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    // Verify that the current user is the task creator
    if (offer.task.creator.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    offer.status = status;
    await offer.save();

    // Create notification for the tasker
    const notification = new Notification({
      user: offer.tasker,
      type: `offer_${status}`,
      task: offer.task._id,
      offer: offer._id,
      message: `Your offer for task "${offer.task.title}" has been ${status}`
    });
    await notification.save();

    // If offer is accepted, create a message thread
    if (status === 'accepted') {
      const message = new Message({
        sender: req.user.userId,
        receiver: offer.tasker,
        task: offer.task._id,
        content: `Offer accepted! You can now start discussing the task details.`
      });
      await message.save();
    }

    res.json(offer);
  } catch (error) {
    res.status(500).json({ message: 'Error updating offer', error: error.message });
  }
};
export const getOffers = async (req, res) => {
  try {
    const offers = await Offer.find().populate('task tasker');
    res.status(200).json(offers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching offers', error: error.message });
  }
};

export const getOffersForTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const offers = await Offer.find({ task: taskId })
      .populate('tasker', 'name avatar rating completedTasks')
      .sort({ createdAt: -1 });

    res.status(200).json(offers);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching offers', 
      error: error.message 
    });
  }
};

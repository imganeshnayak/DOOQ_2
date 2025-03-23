import Task from '../models/task.js';

export const createTask = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      budget, 
      location,
      category,
      dueDate,
      image // New optional field
    } = req.body;

    // Validation
    if (!title || !description || !budget || !location.city || !location.zipcode || !location.address) {
      return res.status(400).json({ 
        message: 'Please provide all required fields' 
      });
    }

    const task = new Task({
      title,
      description,
      budget: Number(budget),
      location: {
        address: location.address,
        city: location.city,
        zipcode: location.zipcode,
        coordinates: location.coordinates
      },
      image: image || null, // Add the optional image field
      category,
      dueDate: new Date(dueDate),
      creator: req.user.userId // This comes from auth middleware
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error('Task creation error:', error);
    res.status(400).json({ 
      message: 'Error creating task', 
      error: error.message 
    });
  }
};

export const getTasks = async (_req, res) => {
  try {
    const tasks = await Task.find().populate('creator', 'name');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
};

export const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('creator', 'name');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task', error: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
};
export const getTasksByZipcode = async (req, res) => {
  try {
      if (!req.user || !req.user.location || !req.user.location.zipcode) {
          return res.status(400).json({ message: "User zipcode not found" });
      }

      const userZipcode = req.user.location.zipcode;

      // Fetch tasks where `location.zipcode` matches user `zipcode`
      const tasks = await Task.find({ "location.zipcode": userZipcode });

      if (tasks.length === 0) {
          return res.status(404).json({ message: "No tasks found in your area" });
      }

      res.json(tasks);
  } catch (error) {
      console.error("Error fetching tasks by zipcode:", error);
      res.status(500).json({ message: "Server error while fetching tasks" });
  }
};

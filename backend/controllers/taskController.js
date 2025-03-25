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

export const searchTasks = async (req, res) => {
  try {
    const { query, categories, budgetRanges } = req.query;
    console.log('Search params received:', { query, categories, budgetRanges });

    const searchCriteria = {};

    // Add category filter
    if (categories) {
      searchCriteria.category = { 
        $in: categories.split(',') 
      };
    }

    // Add budget filter
    if (budgetRanges) {
      const ranges = JSON.parse(budgetRanges);
      if (Array.isArray(ranges) && ranges.length > 0) {
        searchCriteria.$or = ranges.map(range => ({
          budget: {
            $gte: range.min,
            ...(range.max !== Infinity && { $lte: range.max })
          }
        }));
      }
    }

    // Add text search
    if (query) {
      searchCriteria.$and = [{
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      }];
    }

    console.log('Final search criteria:', JSON.stringify(searchCriteria, null, 2));

    const tasks = await Task.find(searchCriteria)
      .sort({ createdAt: -1 })
      .limit(50);

    console.log(`Found ${tasks.length} tasks`);
    return res.json(tasks);

  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({
      message: 'Error searching tasks',
      error: error.message
    });
  }
};

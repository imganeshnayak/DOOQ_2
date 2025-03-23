import { Router } from 'express';
import { createTask, getTasks, getTask, updateTask, deleteTask } from '../controllers/taskController.js';
import auth from '../middleware/auth.js';

const router = Router();

// Apply the auth middleware to all routes in this file
// router.use(auth);

// Define your task routes here
router.post('/', auth, createTask); // Correct path
router.get('/', getTasks);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
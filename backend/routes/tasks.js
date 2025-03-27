import { Router } from 'express';
import { 
    createTask, 
    getTasks, 
    getTask, 
    updateTask, 
    deleteTask,
    searchTasks, 
    getMyTasks, 
    updateTaskStatus
} from '../controllers/taskController.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

// Protected routes (require authentication)
router.get('/my-tasks', authMiddleware, getMyTasks);
router.get('/search', authMiddleware, searchTasks);
router.post('/', authMiddleware, createTask);
router.put('/:taskId/status', authMiddleware, updateTaskStatus);
router.delete('/:taskId', authMiddleware, deleteTask);

// Public routes
router.get('/', getTasks);
router.get('/:taskId', getTask);

export default router;
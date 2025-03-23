import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoutes from './routes/users.js';
import taskRoutes from './routes/tasks.js';
import offerRoutes from './routes/offers.js'
import notificationRoutes from './routes/notifications.js'; // ✅ Import notification routes
import messageRoutes from './routes/messages.js'; // ✅ Import message routes
import { getCurrentUser } from './controllers/userController.js'; // ✅ Import function

import authMiddleware from './middleware/auth.js';

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: ['http://localhost:19006', 'http://192.168.154.125:19006'],
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes); // ✅ Register notification API
app.use('/api/messages', authMiddleware, messageRoutes); // ✅ Register message API
app.get('/api/me', authMiddleware, getCurrentUser);

app.use('/api/offers', offerRoutes); // ✅ Ensure this line is present


// Error handling middleware
app.use((err, _req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
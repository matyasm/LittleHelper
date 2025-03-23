// backend/routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Placeholder for future controller functions
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  startTask,
  pauseTask,
  completeTask,
} = require('../controllers/taskController');

router.route('/').get(protect, getTasks).post(protect, createTask);
router.route('/:id').put(protect, updateTask).delete(protect, deleteTask);
router.put('/:id/start', protect, startTask);
router.put('/:id/pause', protect, pauseTask);
router.put('/:id/complete', protect, completeTask);

module.exports = router;
// backend/controllers/taskController.js (continued)
const asyncHandler = require('express-async-handler');
const Task = require('../models/taskModel');

// @desc    Get tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ user: req.user.id });
  res.status(200).json(tasks);
});

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
  if (!req.body.title) {
    res.status(400);
    throw new Error('Please add a title');
  }

  const task = await Task.create({
    title: req.body.title,
    description: req.body.description,
    user: req.user.id,
  });

  res.status(201).json(task);
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Check for user
  if (!req.user) {
    res.status(401);
    throw new Error('User not found');
  }

  // Make sure the logged in user matches the task user
  if (task.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json(updatedTask);
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Check for user
  if (!req.user) {
    res.status(401);
    throw new Error('User not found');
  }

  // Make sure the logged in user matches the task user
  if (task.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  await task.remove();

  res.status(200).json({ id: req.params.id });
});

// @desc    Start task
// @route   PUT /api/tasks/:id/start
// @access  Private
const startTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Check for user
  if (!req.user) {
    res.status(401);
    throw new Error('User not found');
  }

  // Make sure the logged in user matches the task user
  if (task.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  // Can only start tasks that are not in progress
  if (task.status === 'in_progress') {
    res.status(400);
    throw new Error('Task is already in progress');
  }

  // Add a new time entry
  task.timeEntries.push({
    startTime: new Date(),
  });

  task.status = 'in_progress';
  await task.save();

  res.status(200).json(task);
});

// @desc    Pause task
// @route   PUT /api/tasks/:id/pause
// @access  Private
const pauseTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Check for user
  if (!req.user) {
    res.status(401);
    throw new Error('User not found');
  }

  // Make sure the logged in user matches the task user
  if (task.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  // Can only pause tasks that are in progress
  if (task.status !== 'in_progress') {
    res.status(400);
    throw new Error('Task is not in progress');
  }

  // Find the last time entry and set end time
  const currentTimeEntry = task.timeEntries[task.timeEntries.length - 1];
  if (!currentTimeEntry.endTime) {
    currentTimeEntry.endTime = new Date();
    
    // Calculate elapsed time for this entry
    const elapsedTime = currentTimeEntry.endTime - currentTimeEntry.startTime;
    task.totalTime += elapsedTime;
  }

  task.status = 'paused';
  await task.save();

  res.status(200).json(task);
});

// @desc    Complete task
// @route   PUT /api/tasks/:id/complete
// @access  Private
const completeTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Check for user
  if (!req.user) {
    res.status(401);
    throw new Error('User not found');
  }

  // Make sure the logged in user matches the task user
  if (task.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  // If task is in progress, end the current time entry
  if (task.status === 'in_progress') {
    const currentTimeEntry = task.timeEntries[task.timeEntries.length - 1];
    if (!currentTimeEntry.endTime) {
      currentTimeEntry.endTime = new Date();
      
      // Calculate elapsed time for this entry
      const elapsedTime = currentTimeEntry.endTime - currentTimeEntry.startTime;
      task.totalTime += elapsedTime;
    }
  }

  task.status = 'completed';
  await task.save();

  res.status(200).json(task);
});

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  startTask,
  pauseTask,
  completeTask,
};
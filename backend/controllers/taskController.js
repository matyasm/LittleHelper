// backend/controllers/taskController.js
const asyncHandler = require('express-async-handler');
const Task = require('../models/taskModel');

// @desc    Get tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
  console.log('Getting tasks for user with id:', req.user.id);
  const tasks = await Task.find({ userId: req.user.id });
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

  console.log('Creating task for user with id:', req.user.id);
  const task = await Task.create({
    title: req.body.title,
    user: req.user.id, // Will be mapped to userId in the model
    completed: req.body.completed || false
  });

  res.status(201).json(task);
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
  console.log('Updating task with id:', req.params.id);
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
  if (task.userId != req.user.id) { // Use != instead of !== for type coercion
    res.status(401);
    throw new Error('User not authorized');
  }

  const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body);

  res.status(200).json(updatedTask);
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
  console.log('Deleting task with id:', req.params.id);
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
  if (task.userId != req.user.id) { // Use != instead of !== for type coercion
    res.status(401);
    throw new Error('User not authorized');
  }

  await Task.findByIdAndDelete(req.params.id);

  res.status(200).json({ id: req.params.id });
});

// @desc    Toggle task completion
// @route   PUT /api/tasks/:id/toggle
// @access  Private
const toggleTaskCompletion = asyncHandler(async (req, res) => {
  console.log('Toggling task completion for id:', req.params.id);
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
  if (task.userId != req.user.id) { // Use != instead of !== for type coercion
    res.status(401);
    throw new Error('User not authorized');
  }

  // Toggle the completed state
  const updatedTask = await Task.findByIdAndUpdate(req.params.id, { 
    completed: !task.completed 
  });

  res.status(200).json(updatedTask);
});

// Simplified handler for advanced task routes
const notImplemented = asyncHandler(async (req, res) => {
  res.status(501).json({ message: 'This feature is not implemented in the SQLite version' });
});

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  startTask: notImplemented,
  pauseTask: notImplemented,
  completeTask: toggleTaskCompletion,
};
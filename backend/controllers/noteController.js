// backend/controllers/noteController.js
const asyncHandler = require('express-async-handler');
const Note = require('../models/noteModel');
const User = require('../models/userModel');

// @desc    Get notes
// @route   GET /api/notes
// @access  Private
const getNotes = asyncHandler(async (req, res) => {
  console.log('Getting notes for user with id:', req.user.id);
  const notes = await Note.find({ userId: req.user.id });
  res.status(200).json(notes);
});

// @desc    Create note
// @route   POST /api/notes
// @access  Private
const createNote = asyncHandler(async (req, res) => {
  if (!req.body.title || !req.body.content) {
    res.status(400);
    throw new Error('Please add a title and content');
  }

  console.log('Creating note for user with id:', req.user.id);
  const note = await Note.create({
    title: req.body.title,
    content: req.body.content,
    user: req.user.id, // Will be mapped to userId in the model
  });

  res.status(201).json(note);
});

// @desc    Update note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = asyncHandler(async (req, res) => {
  console.log('Updating note with id:', req.params.id);
  const note = await Note.findById(req.params.id);

  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }

  // Check for user
  if (!req.user) {
    res.status(401);
    throw new Error('User not found');
  }

  // Make sure the logged in user matches the note user
  if (note.userId != req.user.id) { // Use != instead of !== for type coercion
    res.status(401);
    throw new Error('User not authorized');
  }

  const updatedNote = await Note.findByIdAndUpdate(req.params.id, req.body);

  res.status(200).json(updatedNote);
});

// @desc    Delete note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = asyncHandler(async (req, res) => {
  console.log('Deleting note with id:', req.params.id);
  const note = await Note.findById(req.params.id);

  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }

  // Check for user
  if (!req.user) {
    res.status(401);
    throw new Error('User not found');
  }

  // Make sure the logged in user matches the note user
  if (note.userId != req.user.id) { // Use != instead of !== for type coercion
    res.status(401);
    throw new Error('User not authorized');
  }

  await Note.findByIdAndDelete(req.params.id);

  res.status(200).json({ id: req.params.id });
});

// @desc    Share note with another user (simplified for SQLite)
// @route   POST /api/notes/:id/share
// @access  Private
const shareNote = asyncHandler(async (req, res) => {
  res.status(501).json({ message: 'Note sharing not implemented for SQLite version' });
});

module.exports = {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  shareNote,
};
// backend/controllers/noteController.js
const asyncHandler = require('express-async-handler');
const Note = require('../models/noteModel');
const User = require('../models/userModel');

// @desc    Get notes
// @route   GET /api/notes
// @access  Private
const getNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find({ user: req.user.id });
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

  const note = await Note.create({
    title: req.body.title,
    content: req.body.content,
    user: req.user.id,
    isPublic: req.body.isPublic || false,
  });

  res.status(201).json(note);
});

// @desc    Update note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = asyncHandler(async (req, res) => {
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
  if (note.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const updatedNote = await Note.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json(updatedNote);
});

// @desc    Delete note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = asyncHandler(async (req, res) => {
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
  if (note.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  await note.remove();

  res.status(200).json({ id: req.params.id });
});

// @desc    Share note with another user
// @route   POST /api/notes/:id/share
// @access  Private
const shareNote = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Please provide an email to share with');
  }

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
  if (note.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  // Find user to share with
  const userToShareWith = await User.findOne({ email });

  if (!userToShareWith) {
    res.status(404);
    throw new Error('User to share with not found');
  }

  // Check if already shared
  if (note.sharedWith.includes(userToShareWith._id)) {
    res.status(400);
    throw new Error('Note already shared with this user');
  }

  // Add user to sharedWith array
  note.sharedWith.push(userToShareWith._id);
  await note.save();

  res.status(200).json(note);
});

module.exports = {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  shareNote,
};
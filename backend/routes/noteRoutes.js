// backend/routes/noteRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Placeholder for future controller functions
const {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  shareNote,
} = require('../controllers/noteController');

router.route('/').get(protect, getNotes).post(protect, createNote);
router.route('/:id').put(protect, updateNote).delete(protect, deleteNote);
router.route('/:id/share').post(protect, shareNote);

module.exports = router;
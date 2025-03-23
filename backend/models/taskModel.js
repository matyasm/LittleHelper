// backend/models/taskModel.js
const mongoose = require('mongoose');

const timeEntrySchema = mongoose.Schema(
  {
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
    },
  },
  { _id: false }
);

const taskSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'paused', 'completed'],
      default: 'not_started',
    },
    timeEntries: [timeEntrySchema],
    totalTime: {
      type: Number, // Total time in milliseconds
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Task', taskSchema);
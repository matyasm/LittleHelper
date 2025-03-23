// backend/models/userModel.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
    },
    username: {
      type: String,
      required: [true, 'Please add a username'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it's been modified
  if (!this.isModified('password')) {
    return next();
  }
  
  // Check if the password is already hashed
  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
    console.log('Password is already hashed, skipping hashing');
    return next();
  }
  
  try {
    console.log('Hashing password in pre-save hook');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check if entered password matches stored hash
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
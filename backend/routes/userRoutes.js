// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Placeholder for future controller functions
const {
  registerUser,
  loginUser,
  getMe,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/userModel');

router.post('/', registerUser);
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt received:', {
      body: req.body,
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      console.log('Login failed: Missing email or password');
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    
    // Find user by email
    console.log(`Searching for user with email: ${email}`);
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`Login failed: No user found with email ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check if the stored password is a proper bcrypt hash
    const isPasswordHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
    
    console.log('DEBUG - Password check:');
    console.log(`- User found: ${user.username}`);
    console.log(`- Password is hashed: ${isPasswordHashed}`);
    
    let isMatch = false;
    
    if (isPasswordHashed) {
      // For hashed passwords
      console.log('- Using bcrypt.compare for hashed password');
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      // For plain text passwords (should only happen during development)
      console.log('- WARNING: Plain text password detected in database!');
      console.log('- Using direct comparison for unhashed password');
      isMatch = password === user.password;
      
      // Optional: Hash the password now to fix the database
      if (isMatch) {
        console.log('- Converting plain text password to hash');
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await User.findByIdAndUpdate(user.id, { password: user.password });
        console.log('- Password converted to hash');
      }
    }
    
    console.log(`Password match result: ${isMatch}`);
    
    if (!isMatch) {
      console.log('Login failed: Password does not match');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    console.log('Password matched, generating token');
    const token = jwt.sign(
      { id: user.id }, // Using user.id for SQLite
      process.env.JWT_SECRET || 'fallbacksecret', // Fallback for testing
      { expiresIn: '30d' }
    );
    
    console.log('Login successful for user:', user.email);
    res.json({
      id: user.id, // Using SQLite's id field
      name: user.name,
      email: user.email,
      username: user.username,
      colorProfile: user.colorProfile || 'blue', // Default to blue if not set
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, name } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }
    
    // Create user
    const user = await User.create({
      username,
      email,
      password, // Should be hashed via middleware or in the model
      name
    });
    
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update user color profile
router.patch('/update-color-profile', protect, async (req, res) => {
  try {
    console.log('Updating color profile for user:', req.user.id);
    console.log('New color profile:', req.body.colorProfile);
    
    const { colorProfile } = req.body;
    
    // Validate color profile
    const validProfiles = ['blue', 'purple', 'green', 'orange', 'red', 'teal', 'dark', 'light'];
    if (!validProfiles.includes(colorProfile)) {
      return res.status(400).json({ message: 'Invalid color profile' });
    }
    
    // Update user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      console.log('User not found:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('Found user:', user);
    const updatedUser = await User.findByIdAndUpdate(req.user.id, { colorProfile });
    console.log('Updated user:', updatedUser);
    
    res.json({
      message: 'Color profile updated successfully',
      colorProfile: colorProfile
    });
  } catch (error) {
    console.error('Error updating color profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password endpoint
router.patch('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Current password and new password are required' 
      });
    }
    
    // Get user from database with password
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Check if new password meets requirements
    if (newPassword.length < 8) {
      return res.status(400).json({ 
        message: 'New password must be at least 8 characters long' 
      });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update user with new password using the SQLite model method
    await User.findByIdAndUpdate(req.user.id, { password: hashedPassword });
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
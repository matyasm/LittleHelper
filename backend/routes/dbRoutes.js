const express = require('express');
const router = express.Router();
const listDBContents = require('../utils/listDBContents');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const { getDb } = require('../config/dbSqlite');

// Route to get database contents
router.get('/contents', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const dbContents = await listDBContents(limit);
    res.json(dbContents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a user from request body - with password hashing
router.post('/create-test-user', async (req, res) => {
  try {
    console.log('Create user request received:', req.body);
    
    const { username, email, password, name } = req.body;
    
    // Validate input
    if (!username || !email || !password || !name) {
      return res.status(400).json({ 
        message: 'Please provide username, email, password, and name' 
      });
    }

    // Check if user already exists by email
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({ 
        message: `User with email "${email}" already exists` 
      });
    }

    // Check if user already exists by username
    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      return res.status(400).json({ 
        message: `User with username "${username}" already exists` 
      });
    }

    // Create user using our User model
    try {
      const user = await User.create({
        username,
        email,
        password,
        name,
        colorProfile: 'blue'
      });
      
      console.log(`User created successfully: ${username} (${email})`);
      
      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username
        }
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: error.message });
    }
  } catch (error) {
    console.error('Error in create-test-user route:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get list of users
router.get('/users', async (req, res) => {
  try {
    const db = getDb();
    const users = await db.all('SELECT id, username, email, name FROM users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DANGEROUS: Delete all users endpoint (Admin only)
router.delete('/delete-all-users', async (req, res) => {
  try {
    // Debug environment variables
    console.log('Environment variables check:');
    console.log('- ADMIN_KEY set:', !!process.env.ADMIN_KEY);
    console.log('- Expected:', process.env.ADMIN_KEY);
    console.log('- Received:', req.headers['admin-key']);
    
    // Basic security check - require an admin key in the headers
    const adminKey = req.headers['admin-key'];
    
    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
      console.log('Unauthorized attempt to delete all users');
      return res.status(401).json({ 
        message: 'Unauthorized. Admin key required.' 
      });
    }
    
    // Double check with confirmation code in the body
    const { confirmationCode } = req.body;
    
    if (!confirmationCode || confirmationCode !== 'DELETE_ALL_USERS') {
      console.log('Missing or incorrect confirmation code');
      return res.status(400).json({ 
        message: 'Please provide the correct confirmation code in the request body' 
      });
    }
    
    console.log('⚠️ DELETING ALL USERS FROM DATABASE ⚠️');
    
    // Get database connection
    const db = getDb();
    
    // Get count before deletion for reporting
    const countBefore = await db.get('SELECT COUNT(*) as count FROM users');
    
    // Delete all users
    const result = await db.run('DELETE FROM users');
    
    console.log(`🗑️ Deleted all users from database`);
    
    res.json({
      message: `Successfully deleted all users`,
      details: {
        usersCountBefore: countBefore.count
      }
    });
  } catch (error) {
    console.error('Error deleting users:', error);
    res.status(500).json({ 
      message: 'Failed to delete users',
      error: error.message
    });
  }
});

module.exports = router; 
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/userModel');
const connectDB = require('../config/db');

// Load environment variables
dotenv.config();

// Function to create a user
const createUser = async () => {
  try {
    // Connect to the database
    await connectDB();
    console.log('Connected to the database');

    // Check if user already exists
    const existingUser = await User.findOne({ username: 'matyas' });
    if (existingUser) {
      console.log('User with username "matyas" already exists');
      process.exit(0);
    }

    // Create the user
    const user = await User.create({
      username: 'matyas',
      email: 'matyas@example.com',
      password: 'password123', // This will be hashed by the User model
      name: 'Matyas'
    });

    console.log(`User created: ${user.name} (${user.email})`);
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Run the function
createUser(); 
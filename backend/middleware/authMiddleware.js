// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

const protect = asyncHandler(async (req, res, next) => {
  console.log('Auth middleware called for path:', req.path);
  console.log('Headers:', req.headers);
  
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log('Token extracted from header:', token);

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded successfully:', decoded);

      // Get user from the token
      console.log('Looking for user with id:', decoded.id);
      req.user = await User.findById_select(decoded.id, '-password');
      
      if (!req.user) {
        console.log('User not found with id:', decoded.id);
        res.status(401);
        throw new Error('User not found');
      }
      
      console.log('User found:', req.user);

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(401);
      throw new Error('Not authorized');
    }
  } else {
    console.log('No authorization header or not Bearer format');
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

module.exports = { protect };   
// backend/models/userModel.js
const bcrypt = require('bcryptjs');
const { getDb } = require('../config/dbSqlite');

class User {
  /**
   * Find a user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object|null>} User object or null if not found
   */
  static async findById(id) {
    console.log(`findById called with id: ${id}`);
    const db = getDb();
    const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
    console.log(`User lookup result:`, user || 'No user found');
    return user;
  }
  
  /**
   * Find a user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null if not found
   */
  static async findOne(filter = {}) {
    const db = getDb();
    
    if (filter.email) {
      return db.get('SELECT * FROM users WHERE email = ?', [filter.email]);
    } else if (filter.username) {
      return db.get('SELECT * FROM users WHERE username = ?', [filter.username]);
    } else if (filter._id || filter.id) {
      const userId = filter._id || filter.id;
      return db.get('SELECT * FROM users WHERE id = ?', [userId]);
    }
    
    return null;
  }
  
  /**
   * Create a new user
   * @param {Object} userData - User data (username, email, password, name)
   * @returns {Promise<Object>} Created user object
   */
  static async create(userData) {
    const db = getDb();
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    // Set default color profile if not provided
    const colorProfile = userData.colorProfile || 'blue';
    
    // Current timestamp
    const now = new Date().toISOString();
    
    try {
      const result = await db.run(
        `INSERT INTO users (username, email, password, name, colorProfile, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userData.username, userData.email, hashedPassword, userData.name, colorProfile, now, now]
      );
      
      // Fetch the created user to return
      return this.findById(result.lastID);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
  
  /**
   * Update a user
   * @param {string} id - User ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated user object
   */
  static async findByIdAndUpdate(id, updateData) {
    const db = getDb();
    const now = new Date().toISOString();
    
    // Build SET clause and values array
    let setClauses = [];
    let values = [];
    
    // Add each field to update
    for (const [key, value] of Object.entries(updateData)) {
      if (key !== 'id' && key !== '_id' && key !== 'createdAt') {
        setClauses.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    // Add updatedAt timestamp
    setClauses.push('updatedAt = ?');
    values.push(now);
    
    // Add ID to values for WHERE clause
    values.push(id);
    
    // Execute update
    await db.run(
      `UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`,
      values
    );
    
    // Return updated user
    return this.findById(id);
  }
  
  /**
   * Delete a user
   * @param {string} id - User ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  static async findByIdAndDelete(id) {
    const db = getDb();
    const result = await db.run('DELETE FROM users WHERE id = ?', [id]);
    return result.changes > 0;
  }
  
  /**
   * Check if password matches
   * @param {string} enteredPassword - Password to check
   * @param {string} hashedPassword - Stored hashed password
   * @returns {Promise<boolean>} True if password matches
   */
  static async matchPassword(enteredPassword, hashedPassword) {
    return await bcrypt.compare(enteredPassword, hashedPassword);
  }
  
  /**
   * Select only specified fields from the user object
   * @param {string} id - User ID
   * @param {string} fields - Space-separated list of fields to include/exclude
   * @returns {Promise<Object>} User object with only the specified fields
   */
  static async findById_select(id, fields) {
    console.log(`findById_select called with id: ${id}, fields: ${fields}`);
    const db = getDb();
    
    // Parse fields string (e.g., 'name email -password')
    const fieldsList = fields.split(' ');
    const excludeFields = fieldsList.filter(f => f.startsWith('-')).map(f => f.substring(1));
    const includeFields = fieldsList.filter(f => !f.startsWith('-'));
    
    console.log(`Looking for user with id: ${id}`);
    console.log(`Include fields: ${includeFields.join(', ')}`);
    console.log(`Exclude fields: ${excludeFields.join(', ')}`);
    
    // Get the user
    const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
    
    if (!user) {
      console.log(`No user found with id: ${id}`);
      return null;
    }
    
    console.log(`User found with id ${id}:`, user);
    
    // Create a new object with only the specified fields
    if (includeFields.length > 0) {
      // Include only specified fields
      const result = {};
      includeFields.forEach(field => {
        if (user[field] !== undefined) {
          result[field] = user[field];
        }
      });
      return result;
    } else if (excludeFields.length > 0) {
      // Exclude specified fields
      const result = { ...user };
      excludeFields.forEach(field => {
        delete result[field];
      });
      return result;
    }
    
    return user;
  }
}

module.exports = User;
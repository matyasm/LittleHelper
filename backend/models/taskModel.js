// backend/models/taskModel.js
const { getDb } = require('../config/dbSqlite');

class Task {
  /**
   * Find a task by ID
   * @param {string} id - Task ID
   * @returns {Promise<Object|null>} Task object or null if not found
   */
  static async findById(id) {
    const db = getDb();
    return db.get('SELECT * FROM tasks WHERE id = ?', [id]);
  }
  
  /**
   * Find all tasks by a user
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of tasks
   */
  static async find(filter = {}, options = {}) {
    const db = getDb();
    const { sort = {} } = options;
    
    let query = 'SELECT * FROM tasks';
    const params = [];
    
    // Add user filter if provided
    if (filter.user || filter.userId) {
      const userId = filter.user || filter.userId;
      query += ' WHERE userId = ?';
      params.push(userId);
    }
    
    // Add status filter if provided
    if (filter.status) {
      if (params.length === 0) {
        query += ' WHERE status = ?';
      } else {
        query += ' AND status = ?';
      }
      params.push(filter.status);
    }
    
    // Add completed filter if provided
    if (filter.completed !== undefined) {
      if (params.length === 0) {
        query += ' WHERE completed = ?';
      } else {
        query += ' AND completed = ?';
      }
      params.push(filter.completed ? 1 : 0);
    }
    
    // Add sorting
    if (sort.createdAt === -1) {
      query += ' ORDER BY createdAt DESC';
    } else if (sort.createdAt === 1) {
      query += ' ORDER BY createdAt ASC';
    } else if (sort.updatedAt === -1) {
      query += ' ORDER BY updatedAt DESC';
    } else if (sort.updatedAt === 1) {
      query += ' ORDER BY updatedAt ASC';
    } else if (sort.title === 1) {
      query += ' ORDER BY title ASC';
    } else if (sort.title === -1) {
      query += ' ORDER BY title DESC';
    } else {
      // Default sort by created date descending
      query += ' ORDER BY createdAt DESC';
    }
    
    return db.all(query, params);
  }
  
  /**
   * Create a new task
   * @param {Object} taskData - Task data
   * @returns {Promise<Object>} Created task object
   */
  static async create(taskData) {
    const db = getDb();
    const now = new Date().toISOString();
    const completed = taskData.completed ? 1 : 0;
    
    try {
      const result = await db.run(
        `INSERT INTO tasks (userId, title, completed, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?)`,
        [taskData.user, taskData.title, completed, now, now]
      );
      
      // Fetch the created task to return
      return this.findById(result.lastID);
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }
  
  /**
   * Update a task
   * @param {string} id - Task ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated task object
   */
  static async findByIdAndUpdate(id, updateData) {
    const db = getDb();
    const now = new Date().toISOString();
    
    // Build SET clause and values array
    let setClauses = [];
    let values = [];
    
    // Add each field to update
    for (const [key, value] of Object.entries(updateData)) {
      if (key !== 'id' && key !== '_id' && key !== 'createdAt' && key !== 'userId') {
        if (key === 'completed') {
          setClauses.push(`${key} = ?`);
          values.push(value ? 1 : 0);
        } else {
          setClauses.push(`${key} = ?`);
          values.push(value);
        }
      }
    }
    
    // Add updatedAt timestamp
    setClauses.push('updatedAt = ?');
    values.push(now);
    
    // Add ID to values for WHERE clause
    values.push(id);
    
    // Execute update
    await db.run(
      `UPDATE tasks SET ${setClauses.join(', ')} WHERE id = ?`,
      values
    );
    
    // Return updated task
    return this.findById(id);
  }
  
  /**
   * Delete a task
   * @param {string} id - Task ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  static async findByIdAndDelete(id) {
    const db = getDb();
    const result = await db.run('DELETE FROM tasks WHERE id = ?', [id]);
    return result.changes > 0;
  }
}

module.exports = Task;
// backend/models/noteModel.js
const { getDb } = require('../config/dbSqlite');

class Note {
  /**
   * Find a note by ID
   * @param {string} id - Note ID
   * @returns {Promise<Object|null>} Note object or null if not found
   */
  static async findById(id) {
    const db = getDb();
    return db.get('SELECT * FROM notes WHERE id = ?', [id]);
  }
  
  /**
   * Find all notes by a user
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of notes
   */
  static async find(filter = {}, options = {}) {
    const db = getDb();
    const { sort = {} } = options;
    
    let query = 'SELECT * FROM notes';
    const params = [];
    
    // Add user filter if provided
    if (filter.user || filter.userId) {
      const userId = filter.user || filter.userId;
      query += ' WHERE userId = ?';
      params.push(userId);
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
      // Default sort by updated date descending
      query += ' ORDER BY updatedAt DESC';
    }
    
    return db.all(query, params);
  }
  
  /**
   * Search notes by title or content
   * @param {string} userId - User ID
   * @param {string} searchQuery - Search query
   * @returns {Promise<Array>} Array of matching notes
   */
  static async search(userId, searchQuery) {
    const db = getDb();
    const searchParam = `%${searchQuery}%`;
    
    return db.all(
      `SELECT * FROM notes 
       WHERE userId = ? AND (title LIKE ? OR content LIKE ?) 
       ORDER BY updatedAt DESC`,
      [userId, searchParam, searchParam]
    );
  }
  
  /**
   * Create a new note
   * @param {Object} noteData - Note data
   * @returns {Promise<Object>} Created note object
   */
  static async create(noteData) {
    const db = getDb();
    const now = new Date().toISOString();
    
    try {
      const result = await db.run(
        `INSERT INTO notes (userId, title, content, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?)`,
        [noteData.user, noteData.title, noteData.content, now, now]
      );
      
      // Fetch the created note to return
      return this.findById(result.lastID);
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  }
  
  /**
   * Update a note
   * @param {string} id - Note ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated note object
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
      `UPDATE notes SET ${setClauses.join(', ')} WHERE id = ?`,
      values
    );
    
    // Return updated note
    return this.findById(id);
  }
  
  /**
   * Delete a note
   * @param {string} id - Note ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  static async findByIdAndDelete(id) {
    const db = getDb();
    const result = await db.run('DELETE FROM notes WHERE id = ?', [id]);
    return result.changes > 0;
  }
}

module.exports = Note;
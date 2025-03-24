const { getDb } = require('../config/dbSqlite');

/**
 * Lists all tables and their contents in the connected SQLite database
 * @param {number} limit - Maximum number of rows to show per table
 * @returns {Promise<Object>} Object containing tables and their rows
 */
const listDBContents = async (limit = 10) => {
  try {
    const db = getDb();
    
    // First, get all table names
    const tablesResult = await db.all(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    );
    
    const tables = tablesResult.map(row => row.name);
    const dbContents = {};
    
    // For each table, get rows
    for (const tableName of tables) {
      const rows = await db.all(`SELECT * FROM ${tableName} LIMIT ${limit}`);
      dbContents[tableName] = rows;
    }
    
    return {
      databaseName: 'SQLite Database',
      tables: dbContents,
      connectionStatus: 'Connected',
      databasePath: db.config.filename
    };
  } catch (error) {
    console.error(`Error listing database contents: ${error.message}`);
    return {
      error: error.message,
      connectionStatus: 'Error'
    };
  }
};

module.exports = listDBContents; 
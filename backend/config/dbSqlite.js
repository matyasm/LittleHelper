const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

// Ensure the data directory exists
const dbDir = path.join(__dirname, '../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Path to SQLite database file
const dbPath = path.join(dbDir, 'littlehelper.db');

let db = null;

const connectDB = async () => {
  try {
    // Open the database
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    console.log(`SQLite Database Connected: ${dbPath}`);
    
    // Enable foreign keys support
    await db.run('PRAGMA foreign_keys = ON');
    
    return db;
  } catch (error) {
    console.error(`Error connecting to SQLite database: ${error.message}`);
    process.exit(1);
  }
};

const getDb = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
};

module.exports = { connectDB, getDb }; 
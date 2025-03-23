const mongoose = require('mongoose');

/**
 * Lists all collections and their documents in the connected MongoDB database
 * @param {number} limit - Maximum number of documents to show per collection
 * @returns {Promise<Object>} Object containing collections and their documents
 */
const listDBContents = async (limit = 10) => {
  try {
    // Check if connected to database
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database is not connected');
    }

    // Get all collection names
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    const dbContents = {};
    
    // For each collection, get documents
    for (const collection of collections) {
      const collectionName = collection.name;
      const documents = await mongoose.connection.db
        .collection(collectionName)
        .find({})
        .limit(limit)
        .toArray();
      
      dbContents[collectionName] = documents;
    }
    
    return {
      databaseName: mongoose.connection.db.databaseName,
      collections: dbContents,
      connectionStatus: 'Connected',
      host: mongoose.connection.host
    };
  } catch (error) {
    console.error(`Error listing database contents: ${error.message}`);
    return {
      error: error.message,
      connectionStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    };
  }
};

module.exports = listDBContents; 
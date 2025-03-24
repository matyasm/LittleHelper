// backend/server.js (updated)
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { errorHandler } = require('./middleware/errorMiddleware');
const { connectDB } = require('./config/dbSqlite');
const initializeDb = require('./utils/initializeDb');

// Load environment variables as early as possible
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database and initialize schema
(async () => {
  await connectDB();
  await initializeDb();
})().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

// Middleware
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.path} from ${req.ip}`);
  console.log('Request headers:', req.headers);
  next();
});

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    console.log('CORS origin check:', { origin });
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://localhost:5173', // Vite default port
      'http://127.0.0.1:5173',
      'http://localhost:8080'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      console.error('CORS blocked request from:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Define routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

// Import routes
const dbRoutes = require('./routes/dbRoutes');

// Use routes
app.use('/api/db', dbRoutes);

// Add a test route
app.get('/api/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({ message: 'API is working' });
});

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Notes & Tasks API' });
});

// Error handler middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
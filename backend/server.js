const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const setupSwagger = require('./config/swagger');

// Load environment variables
dotenv.config();

// Connect to MongoDB (skip during test suite if already connected)
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

const app = express();

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Cookie parser
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 min
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Dev-friendly fallback
    },
    credentials: true,
  })
);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger / OpenAPI documentation
setupSwagger(app);

// Mount API routes (versioned under /api/v1 and aliased to /api for client compatibility)
const authRoutes = require('./routes/authRoutes');
const petRoutes = require('./routes/petRoutes');
const adoptionRoutes = require('./routes/adoptionRoutes');
const orderRoutes = require('./routes/orderRoutes');
const rescueRoutes = require('./routes/rescueRoutes');
const shelterRoutes = require('./routes/shelterRoutes');
const medicalRoutes = require('./routes/medicalRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const statsRoutes = require('./routes/statsRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Mount under /api/v1
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/pets', petRoutes);
app.use('/api/v1/adoption-requests', adoptionRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/rescue-reports', rescueRoutes);
app.use('/api/v1/shelters', shelterRoutes);
app.use('/api/v1/medical-records', medicalRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/stats', statsRoutes);
app.use('/api/v1/upload', uploadRoutes);

// Alias under /api for seamless backward compatibility
app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/adoption-requests', adoptionRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/rescue-reports', rescueRoutes);
app.use('/api/shelters', shelterRoutes);
app.use('/api/medical-records', medicalRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/upload', uploadRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🐾 PawConnect API is running smoothly',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    message: '🐾 PawConnect API v1 is operational',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🐾 PawConnect API running on port ${PORT}`);
    console.log(`📚 Swagger Docs available at http://localhost:${PORT}/api/docs`);
  });
}

module.exports = app;

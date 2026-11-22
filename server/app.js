const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');
const referralRoutes = require('./routes/referralRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const simulationRoutes = require('./routes/simulationRoutes');
const trackingRoutes = require('./routes/trackingRoutes');
const patientRoutes = require('./routes/patientRoutes');
const { matchHospitals } = require('./controllers/referralController');

const app = express();

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow during local development testing
      }
    },
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request Logger in development
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    platform: 'AROGYASANGAM - Smart Healthcare Access & Referral Coordination Platform',
    status: 'Operational',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/facilities', hospitalRoutes); // Clean alias for healthcare facilities network
app.use('/api/referrals', referralRoutes);
app.post('/api/matching/hospitals', matchHospitals); // Direct matching endpoint
app.post('/api/matching/facilities', matchHospitals); // Direct matching alias
app.use('/api/patients', patientRoutes); // Basic patient continuity record
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/tracking', trackingRoutes);

// 404 handler for undefined API routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Endpoint not found`,
  });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;

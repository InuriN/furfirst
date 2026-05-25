const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const promBundle = require('express-prom-bundle');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const petRoutes = require('./routes/pets');
const appointmentRoutes = require('./routes/appointments');
const slotRoutes = require('./routes/slots');

const app = express();

const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  includeUp: true,
  customLabels: { app: 'furfirst-backend' },
  promClient: { collectDefaultMetrics: {} }
});

app.use(metricsMiddleware);
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/slots', slotRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    app: 'FurFirst',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to FurFirst API' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    if (process.env.NODE_ENV !== 'test') {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('MongoDB connected');
      const server = app.listen(PORT, () => {
        console.log('FurFirst server running on port ' + PORT);
      });
      return server;
    }
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
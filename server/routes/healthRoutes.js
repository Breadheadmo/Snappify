const express = require('express');
const router = express.Router();
const logger = require('../utils/productionLogger');

/**
 * @desc    Health check endpoint for monitoring
 * @route   GET /api/health
 * @access  Public
 */
router.get('/', (req, res) => {
  try {
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      }
    };

    res.status(200).json(healthData);
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Health check failed'
    });
  }
});

/**
 * @desc    Database health check
 * @route   GET /api/health/db
 * @access  Public
 */
router.get('/db', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const dbState = mongoose.connection.readyState;
    
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    if (dbState === 1) {
      res.status(200).json({
        status: 'ok',
        database: 'connected',
        state: states[dbState]
      });
    } else {
      res.status(503).json({
        status: 'error',
        database: 'not connected',
        state: states[dbState]
      });
    }
  } catch (error) {
    logger.error('Database health check failed', { error: error.message });
    res.status(500).json({
      status: 'error',
      database: 'check failed',
      message: error.message
    });
  }
});

module.exports = router;

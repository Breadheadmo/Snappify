const winston = require('winston');

// Create logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'snappy-backend' },
  transports: [
    // Write all logs to error.log 
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Write all logs to combined.log
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// If not in production, log to console too
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Production-safe logging functions
const productionLogger = {
  error: (message, meta = {}) => {
    logger.error(message, meta);
  },
  
  warn: (message, meta = {}) => {
    if (process.env.NODE_ENV !== 'production') {
      logger.warn(message, meta);
    }
  },
  
  info: (message, meta = {}) => {
    if (process.env.NODE_ENV !== 'production') {
      logger.info(message, meta);
    }
  },
  
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV !== 'production') {
      logger.debug(message, meta);
    }
  }
};

module.exports = productionLogger;

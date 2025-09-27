const winston = require('winston');
const path = require('path');

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'snappy-ecommerce' },
  transports: [
    // Error logs
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Combined logs
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Payment logs (separate for security)
    new winston.transports.File({
      filename: path.join(logsDir, 'payments.log'),
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    }),
  ],
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Payment-specific logger
const paymentLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'snappy-payments' },
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'payments.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 20,
    }),
  ],
});

// Security logger for auth attempts, etc.
const securityLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'snappy-security' },
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'security.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    }),
  ],
});

// Express middleware for request logging
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id,
    };

    if (res.statusCode >= 400) {
      logger.error('HTTP Error', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });

  next();
};

// Payment transaction logger
const logPaymentTransaction = (type, data, userId = null) => {
  paymentLogger.info(`Payment ${type}`, {
    type,
    userId,
    orderId: data.orderId,
    amount: data.amount,
    reference: data.reference,
    status: data.status,
    timestamp: new Date().toISOString(),
  });
};

// Security event logger
const logSecurityEvent = (event, data, userId = null, ip = null) => {
  securityLogger.warn(`Security Event: ${event}`, {
    event,
    userId,
    ip,
    userAgent: data.userAgent,
    timestamp: new Date().toISOString(),
    details: data,
  });
};

// Error logging utility
const logError = (error, context = {}) => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  logger,
  paymentLogger,
  securityLogger,
  requestLogger,
  logPaymentTransaction,
  logSecurityEvent,
  logError,
};

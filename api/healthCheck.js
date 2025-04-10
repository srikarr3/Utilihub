
const { errorHandler } = require('../middleware/errorHandling');
const logger = require('../utils/logger');

async function healthCheckHandler(req, res) {
  logger.info('Health check requested');
  
  // Check any crucial dependencies here
  // For example, database connections, external APIs, etc.
  
  return res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
}

module.exports = errorHandler(healthCheckHandler);
const logger = {
  info: (message, data = {}) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...data
    }));
  },
  
  error: (message, error, data = {}) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      errorMessage: error.message,
      stack: error.stack,
      ...data
    }));
  },
  
  debug: (message, data = {}) => {
    if (process.env.DEBUG) {
      console.log(JSON.stringify({
        level: 'debug',
        message,
        timestamp: new Date().toISOString(),
        ...data
      }));
    }
  }
};

module.exports = logger;

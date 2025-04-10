const errorHandler = (handler) => {
  return async (req, res) => {
    try {
      return await handler(req, res);
    } catch (error) {
      console.error('Server error:', error);
      
      // Send appropriate error response
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Internal Server Error';
      
      return res.status(statusCode).json({
        error: {
          message,
          id: res.locals?.requestId || 'unknown',
          code: error.code || 'INTERNAL_ERROR'
        }
      });
    }
  };
};

module.exports = { errorHandler };

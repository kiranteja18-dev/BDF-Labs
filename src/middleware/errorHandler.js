/**
 * Centralized Error Handling Middleware.
 * Ensures all error responses strictly follow the consistent format:
 * { "message": "..." }
 */

// 404 Handler for undefined routes
function notFoundHandler(req, res, next) {
  res.status(404).json({
    message: `Cannot ${req.method} ${req.originalUrl}. Route not found`,
  });
}

// Global error handler
function errorHandler(err, req, res, next) {
  console.error('[Error Logger]', err);

  // Catch invalid JSON syntax in request body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      message: 'Malformed JSON payload in request body',
    });
  }

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    message: message,
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};

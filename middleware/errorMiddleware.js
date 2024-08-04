import logger from "../logger.js";

const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
  };
  
  const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    if (err.name === "CastError" && err.kind === "ObjectId") {
      statusCode = 400;
      message = "Resource not found";
    }

    if (err.code === 11000) {
      statusCode = 400;
      message = "Duplicate field value entered";
    }

    // Log the error using your logger instance
    logger.error("Error caught by errorHandler:", {
      error: err.message,
      stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
    });

    // Send response with error details
    res.status(statusCode).json({
      success: false,
      status: statusCode,
      message: message,
      stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
    });
  };
  
  export { notFound, errorHandler };
  
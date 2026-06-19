const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.stack}`);

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(", ") });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ message: `${field} already exists.` });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || "Internal server error.",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

module.exports = { errorHandler };

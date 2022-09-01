const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;
  //Log to console for development purposes
  console.log(
    `name: ${err.name}, statusCode: ${err.statusCode}, message: ${err.message}, model: ${err.model}`
      .red
  );

  //mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = `No Resource found`;
    error = new ErrorResponse(message, 404);
  }

  //Mongoose Duplicate Key
  if (err.code === 11000) {
    const message = "Values must be unique";
    error = new ErrorResponse(message, 400);
  }

  //Mongoose Validation Error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((value) => value.message);
    error = new ErrorResponse(message, 400);
  }

  res
    .status(error.statusCode || 500)
    .json({ success: false, error: error.message || "Internal Server Error" });
};
module.exports = errorHandler;

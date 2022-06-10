const AppError = require('./../util/appError');

const handleCastErrorDb = err => {
  const message = `Invalid ${err.path}:${err.value}.`;
  return new AppError(message, 400);
};
const handlerDuplicateFieldsDb = err => {
  const message = `Duplicate `;
};
const sendErrorDev = (err, res) => {
  //Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.statusCode,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }
  // Programming or other unknown error: don't leak error details
  else {
    console.error('ERROR😭', err);

    res.status(500).json({
      //1)Log error
      status: 'error',
      message: 'Something went very wrong'
    });
  }
};
const sendErrorProd = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
};
module.exports = (err, req, res, next) => {
  console.log(err.stack);
  err.statusCode = err.statusCod || 500;
  err.status = err.status || 'error';

  // res.status(err.statusCode).json({
  //   status: err.status,
  //   message: err.message
  // });
  if (process.env.NODE_ENV === 'development') {
    return sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (error.name === 'CastError') error = handleCastErrorDb(error);
    if (error.code === 11000) error = handlerDuplicateFieldsDb(error);

    return sendErrorProd(error, res);
  }
};

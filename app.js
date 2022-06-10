const path = require('path');
const express = require('express');
const morgan = require('morgan');
const AppError = require('./util/appError.js');
const globalErrorHandler = require('./controllers/errorController.js');

// morgan is for logging purposes

const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRouter');

//1) Middleware function

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//serving static files
app.use(express.static(`${__dirname}/public`));

// establishing middleware
app.use(express.json()); // this is a body parser
if (process.env.NODE_N === 'development') app.use(morgan('dev'));

//our own middleware
// middleware on the top of all route handlers

// app.use((req, res, next) => {
//   console.log('Welcome from the middleware function');
//   next();
// });

app.use((req, res, next) => {
  // console.log(req.headers);
  req.requestTime = new Date().toISOString();
  next();
});

//2)Route handlers

// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);

// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);

// app.delete('/api/v1/tours/:id', deleteTour);
//3)Routes

// middleware executed sequentially. Here the router function of 'api/v1/tours' will execute first and end the request-response cycle
// therefore the below middleware is not executed
// app.use((req, res, next) => {
//   console.log('Hello from the middleware function');
//   next();
// });

//3)Routes

app.get('/', (req, res) => {
  res.status(200).render('base', {
    tour: 'The Forest Hiker',
    user: 'Jonas'
  });
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// if we reach here it means that it
// is a route not handled by us

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server`
  // });

  // if there is a parameter in next then express will know that error has occured and
  // and then it will stop all its middleware tour and go straight to
  //error middleware function
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});
//error middleware function
app.use(globalErrorHandler);
module.exports = app;

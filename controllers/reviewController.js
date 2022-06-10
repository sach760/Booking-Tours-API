const Review = require(`${__dirname}/../models/reviewModel.js`);
const User = require(`${__dirname}/../models/userModel.js`);
const Tour = require(`${__dirname}/../models/tourModel.js`);
const catchAsync = require(`${__dirname}/..//util/catchAsync.js`);
const handlerFactory = require(`${__dirname}/handlerFactory.js`);

exports.setUserTourIds = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  if (!req.body.tour) req.body.tour = req.params.tourId;
  next();
};
exports.getAllReviews = handlerFactory.getAll(Review);
// exports.getAllReviews = catchAsync(async (req, res, next) => {
//   const filter = {};
//   if (req.body.tourId) filter.tour = req.body.tourId;

//   const reviews = await Review.find(filter);

//   res.status(200).json({
//     status: 'success',
//     result: reviews.length,
//     data: {
//       reviews
//     }
//   });
// });

exports.getReview = handlerFactory.getOne(Review);

exports.createReviews = handlerFactory.createOne(Review);
exports.updateReview = handlerFactory.updateOne(Review);
exports.deleteReview = handlerFactory.deleteOne(Review);

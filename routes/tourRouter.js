const express = require('express');
const tourControl = require('../controllers/tourController');
const authControl = require(`${__dirname}/../controllers/authController.js`);
const reviewControl = require(`${__dirname}/../controllers/reviewController.js`);
const reviewRouter = require(`${__dirname}/reviewRouter.js`);

console.log('Hello from the tourRouter');

const router = express.Router();
// param
// router.param('id', tourControl.checkId);

// POST /tour/234fad4/reviews
// GET /tour/234fad4/reviews
router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(tourControl.aliasTopTours, tourControl.getAllTours);

router.route('/tour-stats').get(tourControl.getTourStats);
router
  .route('/monthly-plans/:year')
  .get(
    authControl.protect,
    authControl.restrictTo('admin', 'lead-guide'),
    tourControl.getMonthlyPlans
  );
router
  .route('/')
  .get(tourControl.getAllTours)
  .post(
    authControl.protect,
    authControl.restrictTo('admin', 'lead-guide'),
    tourControl.createTour
  );

router
  .route('/:id')
  .get(tourControl.getTour)
  .patch(
    authControl.protect,
    authControl.restrictTo('admin', 'lead-guide'),
    tourControl.updateTour
  )
  .delete(
    authControl.protect,
    authControl.restrictTo('admin', 'lead-guide'),
    tourControl.deleteTour
  );

//nested routes
// if don't use mergeParams
// router
//   .route('/:tourId/reviews')
//   .post(
//     authControl.protect,
//     authControl.restrictTo('user'),
//     reviewControl.createReviews
//   );

module.exports = router;

const express = require('express');
const reviewController = require(`${__dirname}/../controllers/reviewController.js`);
const authController = require(`${__dirname}/../controllers/authController.js`);

// mergeParams gives access to tourId in the previous tour route
const router = express.Router({ mergeParams: true });

router.use(authController.protect);
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setUserTourIds,
    reviewController.createReviews
  );

router
  .route('/:id')
  .get(authController.restrictTo('admin', 'user'), reviewController.getReview)
  .patch(
    authController.restrictTo('admin', 'user'),
    reviewController.updateReview
  )
  .delete(reviewController.deleteReview);

module.exports = router;

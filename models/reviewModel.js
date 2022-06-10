//review / rating/ createdAt/ref to tour/ref to user

const mongoose = require('mongoose');

const Tour = require(`${__dirname}/tourModel.js`);

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must be present']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  },
  {
    toJason: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reviewSchema.pre(/^find/, function(next) {
  //   this.populate({
  //     path: 'tour',
  //     select: 'name'
  //   }).populate({
  //     path: 'user',
  //     select: 'name photo'
  //   });

  this.populate({
    path: 'user',
    select: 'name photo'
  });

  next();
});

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

//we have used statics here because aggregate functions need Model to work and in statics this points to model
reviewSchema.statics.calcAverageRatings = async function(tourId) {
  const ratingStats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        numRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  console.log(ratingStats);
  if (ratingStats.length > 0)
    await Tour.findByIdAndUpdate(tourId, {
      ratingAverage: ratingStats[0].avgRating,
      ratingsQuantity: ratingStats[0].numRating
    });
  else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingAverage: 4.5,
      ratingsQuantity: 0
    });
  }
};

reviewSchema.post('save', function() {
  this.constructor.calcAverageRatings(this.tour);
});
reviewSchema.post(/^findOneAnd/, function(doc) {
  doc.constructor.calcAverageRatings(doc.tour);
});
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

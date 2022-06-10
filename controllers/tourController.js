const ApiFeatures = require(`${__dirname}/../util/apiFeatures.js`);
const AppError = require(`${__dirname}/../util/appError.js`);

const Tour = require(`${__dirname}/../models/tourModel.js`);
const catchAsync = require(`${__dirname}/../util/catchAsync.js`);
const handlerFactory = require(`${__dirname}/handlerFactory.js`);

exports.aliasTopTours = (req, res, next) => {
  req.query.page = '1';
  req.query.sort = '-ratingAverage,price';
  req.query.limit = '5';
  next();
};

exports.getAllTours = handlerFactory.getAll(Tour);
// exports.getAllTours = catchAsync(async (req, res, next) => {
//   //Build a query

//   // const tours = await Tour.find()
//   //   .where('duration')
//   //   .equals(5)
//   //   .where('difficulty')
//   //   .equals('easy');
//   //final query
//   //query.sort().select().skip().limit()

//   // Execute the query
//   console.log('Get all tours function');

//   const features = new ApiFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .fields()
//     .pagination();
//   console.log('End of these function');
//   console.log(features.query);
//   console.log('yaha');

//   const tours = await features.query;

//   //Send the response
//   res.status(200).json({
//     status: 'success',
//     result: tours.length,
//     data: {
//       tours: tours
//     }
//   });
// });

exports.createTour = handlerFactory.createOne(Tour);
// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour
//     }
//   });
// });

exports.getTour = handlerFactory.getOne(Tour, { path: 'reviews' });
// exports.getTour = catchAsync(async (req, res) => {
//   const tour = await Tour.findById(req.params.id).populate({
//     path: 'reviews'
//   });
//   console.log(tour);
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: tour
//     }
//   });
// });

exports.updateTour = handlerFactory.updateOne(Tour);

// exports.updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidator: true
//   });
//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: tour
//     }
//   });
// });
exports.deleteTour = handlerFactory.deleteOne(Tour);

// exports.deleteTour = (
//    catchAsync(async (req, res, next) => {
//     const doc = await Tour.findByIdAndDelete(req.params.id);
//     if (!doc) {
//       return next(new AppError('No Model found with that ID', 404));
//     }
//     return res.status(204).json({
//       status: 'success',
//       data: null
//     });
//   });

exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: `$difficulty`,
        avgRating: { $avg: '$ratingAverage' },
        avgPrice: { $avg: '$price' },
        minRating: { $min: '$ratingAverage' },
        maxRating: { $max: '$price' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
    // {
    //   $match: { _id: { $ne: 'easy' } }
    // }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats: stats
    }
  });
});
exports.getMonthlyPlans = catchAsync(async (req, res) => {
  console.log(req.params.year);
  const monthlyPlans = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date('2021-01-01'),
          $lte: new Date('2021-12-31')
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: { _id: 0 }
    },
    {
      $sort: { numTours: -1 }
    },
    {
      $limit: 6
    }
  ]);
  console.log(monthlyPlans);
  res.status(200).json({
    status: 'success',
    data: {
      monthlyPlans
    }
  });
});

const AppError = require(`${__dirname}/../util/appError.js`);
const catchAsync = require(`${__dirname}/../util/catchAsync.js`);
const ApiFeatures = require(`${__dirname}/../util/apiFeatures.js`);

exports.deleteOne = Model => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No Model found with that ID', 404));
    }
    return res.status(204).json({
      status: 'success',
      data: null
    });
  });
};

exports.updateOne = Model => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidator: true
    });
    if (!doc) {
      return next(new AppError('No  found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });
};
exports.createOne = Model => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });
};

exports.getOne = (Model, populateOptions) => {
  return catchAsync(async (req, res) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query;
    console.log(doc);
    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });
};
exports.getAll = Model => {
  return catchAsync(async (req, res, next) => {
    const filter = {};
    // this is just for reviews resource(hack)
    if (req.body.tourId) filter.tour = req.body.tourId;

    // Execute the query
    console.log('Get all tours function');

    const features = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .fields()
      .pagination();
    console.log('End of these function');
    console.log(features.query);
    console.log('yaha');

    // const doc = await features.query.explain();
    const doc = await features.query;

    //Send the response
    res.status(200).json({
      status: 'success',
      result: doc.length,
      data: {
        data: doc
      }
    });
  });
};

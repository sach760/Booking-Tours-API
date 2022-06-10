const ApiFeatures = require(`${__dirname}/../util/apiFeatures.js`);
const AppError = require(`${__dirname}/../util/appError.js`);
const catchAsync = require(`${__dirname}/../util/catchAsync.js`);
const handlerFactory = require(`${__dirname}/handlerFactory.js`);

const User = require(`${__dirname}/../models/userModel.js`);

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(ele => {
    if (allowedFields.includes(ele)) newObj[ele] = obj[ele];
  });
  return newObj;
};

exports.getAllUsers = handlerFactory.getAll(User);

// exports.getAllUsers = catchAsync(async (req, res) => {
//   const users = await User.find();

//   //Send the response
//   res.status(200).json({
//     status: 'success',
//     result: users.length,
//     data: {
//       users: users
//     }
//   });
// });
exports.getUser = handlerFactory.getOne(User);

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This router is not yet defined'
  });
};
exports.updateUser = handlerFactory.updateOne(User);

exports.deleteUser = handlerFactory.deleteOne(User);
exports.updateMe = async (req, res, next) => {
  // 1) Create error if user posts password data

  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password updates'));
  }

  //2)filter our fields in req.body which are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');

  //3)update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
};

exports.deleteMe = async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(201).json({
    status: 'success',
    data: null
  });
};

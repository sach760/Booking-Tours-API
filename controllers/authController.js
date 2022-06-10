const User = require(`${__dirname}/../models/userModel.js`);
const catchAsync = require(`${__dirname}/../util/catchAsync.js`);
const jwt = require('jsonwebtoken');
const AppError = require('../util/appError');
const { promisify } = require('util');
const sendEmail = require(`${__dirname}/../util/email.js`);
const crypto = require('crypto');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    status: statusCode,
    token: token,
    data: {
      user: user
    }
  });
};
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  const token = signToken(newUser._id);
  res.status(201).json({
    status: 'success',
    token: token,
    data: {
      user: newUser
    }
  });
});
exports.login = catchAsync(async (req, res, next) => {
  console.log('LOGIN');
  const { email, password } = req.body;

  //Check if email and password exists
  if (!password || !email) {
    return next(new AppError('Name or email or both empty', 400));
  }

  //Check if email is there in the database and the password is correct
  const user = await User.findOne({ email: email }).select('+password');

  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new AppError('Incorrect password or email', 401));
  }
  // Send a jwt token
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  console.log('Protect');

  //1)Getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('You are not logged in. Please login to access', 401)
    );
  }
  console.log(token);
  //2)Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log('decoded');
  //3)Check if user still exists

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to the token no longer exists')
    );
  }

  //4)Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password. Please log in again')
    );
  }
  //Grant access to the resource
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (roles.includes(req.user.role)) {
      console.log(req.user.role);
      return next();
    } else {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
  };
};
exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1)Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with that email'));
  }
  //2)Generate random reset Token
  const resetToken = user.createPasswordResetToken();
  await user.save({
    validateBeforeSave: false
  });
  //3)Send it to user's email

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    console.log(user);
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token(valid for 10 min)',
      message
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1)Get user based on the token

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  //2)If token has not expired

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });
  if (!user) {
    return next(new AppError('Token is invalid or password has expired', 400));
  }
  console.log(user);
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //3)Update changedPassword property for the user
  //4)Log the user in, send JWT token
  const token = signToken(user._id);
  res.status(201).json({
    status: 'success',
    token: token,
    data: {
      user: user
    }
  });
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  console.log('Update');

  //1) Get user from collection
  const currentUser = await User.findOne({ _id: req.user.id }).select(
    '+password'
  );

  //2) Check if POSTed current password is
  const correct = await currentUser.checkPassword(
    req.body.passwordCurrent,
    currentUser.password
  );
  console.log('CORRECT');
  if (!correct) {
    return next(new AppError('Your password is incorrect'));
  }
  //3)If so , update password
  currentUser.password = req.body.password;
  currentUser.passwordConfirm = req.body.passwordConfirm;
  await currentUser.save();
  //currentUser.findByIdAndUpdate won't work as intended

  //4) Log user in , send JWT token

  createSendToken(currentUser, 201, res);
});

const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../Model/userModel');
const AppError = require('../Utils/appError');
const catchAsync = require('../Utils/catchAsync');
const sendMail = require('../Utils/sendMail');

const signtoken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRETKEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });

const sendToken = (user, res, statusCode) => {
  const token = signtoken(user._id);
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES * 1000 * 60 * 60 * 24,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') options.secure = true;
  res.cookie('jwt', token, options);
  // eslint-disable-next-line no-param-reassign
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    data: {
      user,
    },
    token,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newAcc = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  sendToken(newAcc, res, 200);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError('Please type email and password', 401));
  const userAcc = await User.findOne({ email }).select('+password');
  if (!userAcc || !(await userAcc.correctPass(password, userAcc.password)))
    return next(new AppError('Wrong email or password', 401));
  sendToken(userAcc, res, 201);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'You are logged out', {
    expires: new Date(Date.now() + 5000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  )
    token = req.headers.authorization.split(' ')[1];
  if (req.cookies) token = req.cookies.jwt;
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401),
    );
  }
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRETKEY);
  const currentUser = await User.findById(decode.id);
  if (!currentUser) next(new AppError('This user does not exist!', 401));
  if (currentUser.changedPassword(decode.iat))
    return next(new AppError('Your password has been changed!', 400));
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.loggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decode = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRETKEY,
      );
      const currentUser = await User.findById(decode.id);
      if (!currentUser) return next();
      if (currentUser.changedPassword(decode.iat)) return next();
      req.user = currentUser;
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(new AppError(`Can't find your email address`, 404));
  const resetToken = user.createResetToken();
  user.save({ validateBeforeSave: false });
  const messageResetToken = `This is the URL for you to reset your password : ${
    req.protocol
  }//${req.get(
    'host',
  )}/api/v1/users/resetpassword/${resetToken} \nThis URL will expire in 10 minutes!`;
  const options = {
    email: user.email,
    subject: 'Reset password',
    message: messageResetToken,
  };
  try {
    sendMail(options);
  } catch (err) {
    user.resetToken = undefined;
    user.expireResetToken = undefined;
    next(new AppError(err.message, 404));
  }
  res.status(201).json({
    status: 'success',
    messageResetToken,
    resetToken,
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const reqToken = req.params.token;
  const resetToken = crypto.createHash('sha256').update(reqToken).digest('hex');
  const user = await User.findOne({
    resetToken,
    expireResetToken: { $gt: Date.now() },
  });
  if (!user) return next(new AppError('Your token is invalid or expired', 401));
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.resetToken = undefined;
  user.expireResetToken = undefined;
  await user.save();
  sendToken(user, res, 200);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.correctPass(req.body.password, user.password)))
    return next(new AppError('Your password is incorrect!', 401));
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;
  await user.save();
  sendToken(user, res, 200);
});

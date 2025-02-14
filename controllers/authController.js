const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsyncError');
const AppError = require('../utils/appError');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_TOKEN_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    otherName: req.body.otherName || null,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  // Create jwt and send it to user
  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  // 2? Check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePasswords(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) if everything ok, send token to client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});



exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get token and check if it exist
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('You are not logged in! Login to get access', 401),
    );
  }
  // 2) Token verification
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_TOKEN_SECRET,
  );

  // 3) Check if user still exists

  const currentUser =  await User.findById(decoded.id).select("-__v");

  if (!currentUser) {
    return next(
      new AppError('The user belonging to the token does no longer exist', 401),
    );
  }
  // 4) Check if user changed password after the Token was issued
  if (currentUser.changesPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again', 401),
    );
  }

  // Grant access to the protected route
  req.user = currentUser;
  next();
});

// Check if authenticated user is authorized to access the resource
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.userRole)) {

      return next(
        new AppError('You are not authorized to access this resource'),
      );
    }
    next();
  };

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsyncError');
const AppError = require('./../utils/appError');

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
  const token = jwt.sign({ id: newUser._id }, process.env.JWT_TOKEN_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

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

  // 3) if everything ok, send token to client
  const token = '';
  res.status(200).json({
    status: 'success',
    token,
  });
});

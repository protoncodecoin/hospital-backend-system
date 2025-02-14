const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsyncError');
const User = require('./../models/userModel');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const users = await features.query;

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      data: users,
    },
  });
});

/**
 * Get currently logged in user
 */
exports.getCurrentUser = catchAsync(async (req, res) => {
  const currentUserObj = req.user;

  res.status(200).json({
    status: 'success',
    data: {
      user: currentUserObj,
    },
  });
});

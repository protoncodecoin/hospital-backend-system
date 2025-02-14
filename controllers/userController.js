const catchAsync = require("./../utils/catchAsyncError");

exports.getAllUsers = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined' });
};



/**
 * Get currently logged in user
 */
exports.getCurrentUser = catchAsync(async (req, res) => {
  const currentUserObj = req.user;

  res.status(200).json({
    status: "success",
    data: {
      user: currentUserObj,
    }
  })
});
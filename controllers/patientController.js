const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsyncError');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

exports.getAllDoctors = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(User.find(), req.query).filter().sort().limitFields().paginate();

    const doctors = await features.query

    res.status(200).json({
        status: 'success',
        results: doctors.length,
        data: {
          data: doctors,
        },
      });
})
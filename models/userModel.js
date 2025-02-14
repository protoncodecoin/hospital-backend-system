const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/appError');
const Doctor = require('./doctorModel');
const Patient = require('./patientModel');
const asyncHookError = require('./../utils/catchAsyncHook');

// Scheman for Patient
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Your First name is required'],
  },
  lastName: {
    type: String,
    required: [true, 'Your Last name is required'],
  },
  otherName: String,
  email: {
    type: String,
    required: [true, 'Your email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'A valid email is required'],
  },
  password: {
    type: String,
    minLength: 8,
    required: [true, 'A strong password is required'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // validate on create and save
      validator: function (val) {
        return val === this.password;
      },
      message: 'Passwords do not match',
    },
  },
  passwordChangedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  userRole: {
    type: String,
    enum: {
      values: ['patient', 'doctor'],
      message:
        'Role is either: patient or doctor. Automatically defaults to patient',
    },
  },
  specialization: {
    type: String,
    required: false,
    enum: {
      values: ['Cardiology', 'Neurology', 'Dermatology', 'General Medicine'],
      message: 'Specialization is required',
    },
  },
});

userSchema.pre('save', async function (next) {
  // skip encryption to next middleware if the password field of the current document hasn't been modified
  if (!this.isModified('password')) return next();

  // Hash password
  this.password = await bcrypt.hash(this.password, 12);

  // delete passwordconfirm field because it is only needed for validation
  this.passwordConfirm = undefined;

  next();
});

// instance method to compare hashed password with user provided password
userSchema.methods.comparePasswords = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Enforce user to input a specialization value if role is doctor
userSchema.pre('save', async function (next) {
  if (this.userRole === 'doctor' && !this.specialization) {
    return next(
      new AppError('specialization is only required for doctors', 400),
    );
  }

  if (this.userRole === 'patient' && this.specialization) {
    return next(
      new AppError('Specialization is only required for doctors', 400),
    );
  }

  next();
});

// Automatically create a Doctor or Patient record base on userRole
// userSchema.post('save', async function (doc, next) {
//   try {
//     if (doc.userRole === 'doctor') {
//       await Doctor.create({
//         relatedUser: doc._id,
//         specialization: doc.specialization,
//       });
//     } else if (doc.userRole == 'patient') {
//       await Patient.create({ relatedUser: doc._id });
//       //
//     }
//   } catch (error) {
//     //
//   }

//   next();
// });

// Automatically create a Doctor or Patient record base on userRole
userSchema.post(
  'save',
  asyncHookError(async function (doc, next) {
    if (doc.userRole === 'doctor') {
      await Doctor.create({
        relDoctor: doc._id,
        specialization: doc.specialization,
      });
    } else if (doc.userRole == 'patient') {
      await Patient.create({ relPatient: doc._id });
      //
    }

    next();
  }),
);

// Remove other records when the user is removed
userSchema.pre(
  'remove',
  asyncHookError(async function (next) {
    if (this.userRole === 'doctor') {
      await Doctor.deleteOne({ relDoctor: this._id });
    } else if (this.userRole === 'patient') {
      await Patient.deleteOne({ relPatient: this._id });
    }
    next();
  }),
);

// check if user has changed password after token was issued
userSchema.methods.changesPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );

    return JWTTimestamp < changedTimestamp;
  }
  // Not changed
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;

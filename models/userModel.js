const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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

userSchema.method.comparePasswords = function (
  candidatePassword,
  userPassword,
) {
  //
};

const User = mongoose.model('User', userSchema);

module.exports = User;

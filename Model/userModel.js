const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const schema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User must have a name'],
  },
  email: {
    type: String,
    required: [true, 'User must have an email'],
    unique: [true, 'This email existed'],
    lowercase: true,
    validate: [validator.isEmail, 'Invalid email'],
  },
  photo: [String],
  password: {
    type: String,
    required: [true, 'User must have password'],
    minLength: [8, 'A password have at least 8 character'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please repeat your password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Your confirm password is wrong!',
    },
  },
  changedPasswordAt: Date,
  role: {
    type: String,
    enum: ['admin', 'user', 'lead-guide', 'guide'],
    default: 'user',
  },
  resetToken: String,
  expireResetToken: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

schema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

schema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.changedPasswordAt = Date.now() - 1000;
  next();
});

schema.pre('/^find/', async function (next) {
  this.find({ active: { $ne: false } });
  next();
});

schema.methods.correctPass = async function (candidatePass, userPass) {
  return await bcrypt.compare(candidatePass, userPass);
};

schema.methods.changedPassword = function (timeCreate) {
  if (this.changedPasswordAt) {
    const timeStamp = parseInt(this.changedPasswordAt.getTime(), 10) / 1000;
    console.log(timeStamp, timeCreate);
    return timeStamp > timeCreate;
  }
  return false;
};

schema.methods.createResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.expireResetToken = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', schema);
module.exports = User;

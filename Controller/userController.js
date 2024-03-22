const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../Model/userModel');
const catchAsync = require('../Utils/catchAsync');
const handleFactory = require('./handleFactory');

const filterField = (obj, ...keys) => {
  const newObj = {};
  Object.keys(obj).forEach((val) => {
    if (keys.includes(val)) newObj[val] = obj[val];
  });
  console.log(newObj);
  return newObj;
};

exports.getUsers = handleFactory.getAllData(User);
exports.getUserById = handleFactory.getDataById(User);
exports.createNewUser = handleFactory.createNewData(User);
exports.updateUser = handleFactory.updateDataById(User);
exports.deleteUser = handleFactory.deleteDataByID(User);

exports.updateUserData = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    filterField(req.body, 'name', 'email'),
    {
      runValidators: true,
      new: true,
    },
  );
  res.status(200).json({
    status: 'success',
    data: user,
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  const decode = await promisify(jwt.verify)(
    req.cookies.jwt,
    process.env.JWT_SECRETKEY,
  );
  const me = await User.findById(decode.id);
  res.status(200).json({
    status: 'success',
    data: me,
  });
});

exports.deleteUserData = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

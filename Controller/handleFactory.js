const catchAsync = require('../Utils/catchAsync');
const APIFeatures = require('../Utils/apiFeatures');
const AppError = require('../Utils/appError');

const filterFields = (body, ...fields) => {
  const filterObject = {};
  Object.keys(body).forEach((field) => {
    if (fields.includes(field)) filterObject[field] = body[field];
  });
  return filterObject;
};

exports.getAllData = (Model) =>
  catchAsync(async (req, res) => {
    let filter = {};
    if (req.params.tourID) filter = { tour: req.params.tourID };
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .fields()
      .pagination();
    const data = await features.query;
    res.status(200).json({
      status: 'success',
      results: data.length,
      data,
    });
  });

exports.getDataById = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    const curID = req.params.id;
    let data = Model.findById(curID);
    if (popOptions) data = data.populate(popOptions);
    data = await data;
    if (!data) next(new AppError('This tour does not exist!', 404));
    res.status(200).json({
      status: 'success',
      data,
    });
  });

exports.createNewData = (Model) =>
  catchAsync(async (req, res, next) => {
    const data = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data,
    });
  });

exports.updateDataById = (Model, ...trueFields) =>
  catchAsync(async (req, res, next) => {
    const curID = req.params.id;
    // const data = await Model.findByIdAndUpdate(curID, req.body, {
    //   new: true,
    //   runValidators: true,
    // });
    let data;
    if (trueFields && trueFields.length > 0) {
      data = await Model.findByIdAndUpdate(
        curID,
        filterFields(req.body, ...trueFields),
        {
          new: true,
          runValidators: true,
        },
      );
    } else {
      data = await Model.findByIdAndUpdate(curID, req.body, {
        new: true,
        runValidators: true,
      });
    }
    res.status(200).json({
      status: 'success',
      data,
    });
  });

exports.deleteDataByID = (Model) =>
  catchAsync(async (req, res) => {
    await Model.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

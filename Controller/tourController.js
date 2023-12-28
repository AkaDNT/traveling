const Tour = require('../Model/tourModel');
const catchAsync = require('../Utils/catchAsync');
const handleFactory = require('./handleFactory');
const AppError = require('../Utils/appError');

exports.getAllTours = handleFactory.getAllData(Tour);
exports.getTour = handleFactory.getDataById(Tour, { path: 'reviews' });
exports.createNewTour = handleFactory.createNewData(Tour);
exports.updateTour = handleFactory.updateDataById(Tour);
exports.deleteTour = handleFactory.deleteDataByID(Tour);

exports.aliasTopTour = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  next();
};
exports.getTourStats = catchAsync(async (req, res) => {
  let yearReq;
  const now = new Date();
  if (req.params.year) yearReq = req.params.year * 1;
  else yearReq = now.getFullYear();
  const stats = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${yearReq}-01-01`),
          $lte: new Date(`${yearReq}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        totalTour: { $sum: 1 },
        tours: { $push: { name: '$name' } },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $unset: '_id',
    },
    {
      $sort: { month: 1 },
    },
  ]);
  res.status(200).json({
    status: 'success',
    results: stats.length,
    data: {
      stats,
    },
  });
});

// /tours-within/:distance/center/:latlng/unit/:unit

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng) next(new AppError('Please type lat and lng', 400));
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius],
      },
    },
  });
  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      data: tours,
    },
  });
});

// /distance/:latlng/unit/:unit
exports.getToursDistance = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng) next(new AppError('Please type lat and lng', 400));
  const mutiplier = unit === 'mi' ? 0.000621371192 : 0.001;
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng * 1, lat * 1] },
        distanceField: 'distance',
        distanceMultiplier: mutiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
        _id: 0,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    result: distances.length,
    data: distances,
  });
});

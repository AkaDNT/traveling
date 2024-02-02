const Tour = require('../Model/tourModel');
const catchAsync = require('../Utils/catchAsync');

exports.getOverView = catchAsync(async (req, res) => {
  const tours = await Tour.find();
  res.status(200).render('overview', {
    title: 'Natours | Exciting tours for adventurous people',
    tours,
  });
});

exports.getTourSlug = catchAsync(async (req, res) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
});

exports.login = catchAsync(async (req, res) => {
  const tours = await Tour.find();
  res.status(200).render('login', {
    title: 'login',
    tours,
  });
});

const Review = require('../Model/reviewModel');
const handleFactory = require('./handleFactory');

exports.createBodyReview = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourID;
  req.body.user = req.user._id;
  next();
};

exports.getAllReview = handleFactory.getAllData(Review);
exports.getReviewById = handleFactory.getDataById(Review);
exports.createReview = handleFactory.createNewData(Review);
exports.updateReview = handleFactory.updateDataById(Review, 'review', 'rating');
exports.deleteReview = handleFactory.deleteDataByID(Review);

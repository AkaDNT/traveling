const mongoose = require('mongoose');
const Tour = require('./tourModel');
const AppError = require('../Utils/appError');

const schema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review must have a content'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Review must have a rating'],
    },
    createAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

schema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

schema.statics.calcAverageRating = async function (tourID) {
  const average = await this.aggregate([
    {
      $match: { tour: tourID },
    },
    {
      $group: {
        _id: '$tour',
        totalRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  await Tour.findByIdAndUpdate(tourID, {
    ratingsAverage: average[0].avgRating,
    ratingsQuantity: average[0].totalRating,
  });
};

schema.post('save', function () {
  this.constructor.calcAverageRating(this.tour);
});

schema.post(/^findOneAnd/, async (doc) => {
  if (!doc) throw new AppError('This ID is not exist', 404);
  doc.constructor.calcAverageRating(doc.tour);
});

const Review = mongoose.model('Review', schema);
module.exports = Review;

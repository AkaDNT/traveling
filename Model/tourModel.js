const mongoose = require('mongoose');
const slugify = require('slugify');

const schema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: ['easy', 'medium', 'difficult'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have summary'],
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A tour must have description '],
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have coverimage'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    startLocation: {
      type: {
        type: 'String',
        default: 'Point',
        enum: 'Point',
      },
      coordinates: [Number],
      description: String,
      address: String,
    },
    slug: String,
    locations: [
      {
        type: {
          type: 'String',
          default: 'Point',
          enum: 'Point',
        },
        coordinates: [Number],
        description: String,
        address: String,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

schema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

schema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

schema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangeAt',
  });
  next();
});

schema.index({ price: 1, ratingsAverage: -1 });
schema.index({ slug: 1 });
schema.index({ startLocation: '2dsphere' });

const Tour = mongoose.model('Tour', schema);
module.exports = Tour;

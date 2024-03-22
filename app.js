const express = require('express');
// const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const sanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const cookieParser = require('cookie-parser');
const AppError = require('./Utils/appError');
const globalErrorHandling = require('./Controller/errorController');
const tourRouter = require('./Routes/tourRoutes');
const userRouter = require('./Routes/userRoutes');
const reviewRouter = require('./Routes/reviewRoutes');
const viewRouter = require('./Routes/viewRoutes');

const app = express();

console.log(process.env.NODE_ENV);
// if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use(express.json());
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 100,
});

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(limiter);
const scriptSrcUrls = ['https://unpkg.com/', 'https://tile.openstreetmap.org'];
const styleSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://fonts.googleapis.com/',
];
const connectSrcUrls = ['https://unpkg.com', 'https://tile.openstreetmap.org'];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];
app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      fontSrc: ["'self'", 'https:', 'data:', ...fontSrcUrls],
      scriptSrc: [
        "'self'",
        'https://cdnjs.cloudflare.com/ajax/libs/axios/1.6.7/axios.min.js',
        ...scriptSrcUrls,
      ],
      objectSrc: ["'none'"],
      styleSrc: [
        "'self'",
        'https:',
        "'unsafe-inline'",
        ...styleSrcUrls,
        `ws://localhost:8080/`,
      ],
      upgradeInsecureRequests: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
    },
  }),
);
app.use(sanitize());
app.use(xss());
app.use(
  hpp({
    whitelist: [
      'ratingsAverage',
      'ratingsQuantity',
      'name',
      'duration',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.all('*', (req, res, next) => {
  next(new AppError(`Can not find this url: ${req.originalUrl}`, 404));
});
app.use(globalErrorHandling);
module.exports = app;

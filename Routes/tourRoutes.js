const express = require('express');
const controller = require('../Controller/tourController');
const authController = require('../Controller/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

router.use('/:tourID/reviews', reviewRouter);
router.route('/stats').get(controller.getTourStats);
router.route('/stats/:year?').get(controller.getTourStats);
router
  .route('/top-5-cheapest')
  .get(controller.aliasTopTour, controller.getAllTours);
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(controller.getToursWithin);
router.route('/distance/:latlng/unit/:unit').get(controller.getToursDistance);
router
  .route('/')
  .get(controller.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    controller.createNewTour,
  );
router
  .route('/:id')
  .get(authController.protect, controller.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    controller.updateTour,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    controller.deleteTour,
  );
module.exports = router;

const express = require('express');
const viewController = require('../Controller/viewController');
const authController = require('../Controller/authController');

const router = express.Router();

router.route('/me').get(authController.protect, viewController.getAccount);

router.use(authController.loggedIn);
router.route('/').get(viewController.getOverView);
router.route('/tour/:slug').get(viewController.getTourSlug);
router.route('/login').get(viewController.login);
module.exports = router;

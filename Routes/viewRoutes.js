const express = require('express');
const viewController = require('../Controller/viewController');

const router = express.Router();
router.route('/').get(viewController.getOverView);
router.route('/tour/:slug').get(viewController.getTourSlug);
router.route('/login').get(viewController.login);
module.exports = router;

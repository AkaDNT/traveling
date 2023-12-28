const express = require('express');
const controller = require('../Controller/userController');
const authController = require('../Controller/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotpassword', authController.forgotPassword);
router.patch('/resetpassword/:token', authController.resetPassword);

router.use(authController.protect);

router.patch('/updatepassword', authController.updatePassword);
router.patch('/updateUserData', controller.updateUserData);
router.delete('/deleteUserData', controller.deleteUserData);

router.use(authController.restrictTo('admin', 'lead-guide'));

router.route('/').get(controller.getUsers).post(controller.createNewUser);
router
  .route('/:id')
  .get(controller.getUserById)
  .patch(controller.updateUser)
  .delete(controller.deleteUser);

module.exports = router;

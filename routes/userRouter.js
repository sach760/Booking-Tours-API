const express = require('express');

const authControl = require(`${__dirname}/../controllers/authController.js`);
const userControl = require(`${__dirname}/../controllers/userController.js`);
const router = express.Router();

router.route('/signup').post(authControl.signUp);
router.route('/login').post(authControl.login);

router.post('/forgot-password', authControl.forgotPassword);
router.patch('/reset-password/:token', authControl.resetPassword);

router.use(authControl.protect);

router.patch('/update-me', userControl.updateMe);
router.delete('/delete-me', authControl.protect, userControl.deleteMe);
router.patch('/update-password', authControl.updatePassword);

router.use(authControl.restrictTo('admin'));
router
  .route('/')
  .get(userControl.getAllUsers)
  .post(userControl.createUser);
router
  .route('/:id')
  .get(userControl.getUser)
  .patch(userControl.updateUser)
  .delete(userControl.deleteUser);

module.exports = router;

const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictSpecificResource,
    userController.getAllUsers,
  );
router.route('/me').get(authController.protect, userController.getCurrentUser);

module.exports = router;

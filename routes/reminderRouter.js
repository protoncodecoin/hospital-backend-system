const express = require('express');
const authController = require('../controllers/authController');
const reminderController = require('../controllers/reminderController');

const router = express.Router();

router
  .route('/')
  .get(authController.protect, reminderController.getAllReminders);

module.exports = router;

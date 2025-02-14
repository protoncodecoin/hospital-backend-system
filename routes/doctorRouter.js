const express = require('express');
const doctorController = require('../controllers/doctorController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/patients/')
  .get(
    authController.protect,
    authController.restrictTo('doctor'),
    doctorController.getAllPatients,
  );

router
  .route('/patients/:id')
  .get(
    authController.protect,
    authController.restrictTo('doctor'),
    doctorController.getPatient,
  );
module.exports = router;

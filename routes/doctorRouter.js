const express = require('express');
const doctorController = require('../controllers/doctorController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('doctor'),
    doctorController.getAllPatients,
  );

// router.route('/:id').get(doctorController.getAssignedPatients);

router
  .route('/patients/:id')
  .get(
    authController.protect,
    authController.restrictTo('doctor'),
    doctorController.getPatient,
  );
module.exports = router;

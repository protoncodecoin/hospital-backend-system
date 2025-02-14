const express = require('express');
const doctorController = require('../controllers/doctorController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post(
  '/notes',
  authController.protect,
  authController.restrictTo('doctor'),
  doctorController.submitNote,
);

router.route('/').get(authController.protect, doctorController.getAllDoctors);
router
  .route('/my-patients/')
  .get(
    authController.protect,
    authController.restrictTo('doctor'),
    doctorController.getAssignedPatients,
  );

router
  .route('/patients/:id')
  .get(
    authController.protect,
    authController.restrictTo('doctor'),
    doctorController.getPatientNote,
  );
module.exports = router;

const express = require('express');
const patientController = require('../controllers/patientController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post(
  '/doctor-selection/:id',
  authController.protect,
  authController.restrictTo('patient'),
  patientController.selectDoctor,
);
router.post(
  '/check-in',
  authController.protect,
  authController.restrictTo('patient'),
  patientController.checkIn,
);

router.route('/').get(authController.protect, patientController.getAllPatients);
router
  .route('/notes')
  .get(
    authController.protect,
    authController.restrictTo('patient'),
    patientController.getNotes,
  );

module.exports = router;

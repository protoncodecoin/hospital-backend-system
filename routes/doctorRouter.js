const express = require('express');
const doctorController = require('./../controllers/doctorController');
const router = express.Router();

router.route('/').get(doctorController.getAllPatients);

// router.route('/:id').get(doctorController.getAssignedPatients);

router.route('/patients/:id').get(doctorController.getPatient);
module.exports = router;

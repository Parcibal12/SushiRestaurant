const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const optionalAuth = require('../middleware/optionalAuth');

router.post('/', optionalAuth, reservationController.createReservation);

module.exports = router;
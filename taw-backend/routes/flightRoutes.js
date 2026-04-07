const express = require('express');
const router = express.Router();

const { searchFlights, createFlight, getAirlineStats, getAircrafts } = require('../controllers/flightController');
const { protect, airlineOnly } = require('../middleware/authMiddleware');

router.get('/aircrafts', protect, airlineOnly, getAircrafts);
router.get('/statistics', protect, airlineOnly, getAirlineStats);
router.get('/', searchFlights);
router.post('/', protect, airlineOnly, createFlight);

module.exports = router;
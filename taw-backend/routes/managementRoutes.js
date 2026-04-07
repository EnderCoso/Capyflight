const express = require('express');
const router = express.Router();
const { createRoute, getRoutes, createAircraft, getAircrafts } = require('../controllers/routeController');
const { protect, airlineOnly } = require('../middleware/authMiddleware');

// Gestione Rotte
router.post('/routes', protect, airlineOnly, createRoute);
router.get('/routes', getRoutes);

// Gestione Aerei 
router.post('/aircrafts', protect, airlineOnly, createAircraft);
router.get('/aircrafts', protect, airlineOnly, getAircrafts);

module.exports = router;
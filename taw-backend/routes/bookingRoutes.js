const express = require('express');
const router = express.Router();
const { bookFlight, getMyTickets } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

//Rotte protette da autenticazione
router.post('/', protect, bookFlight);
router.get('/my-tickets', protect, getMyTickets);

module.exports = router;
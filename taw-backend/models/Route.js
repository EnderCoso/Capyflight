const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
    departureCity: { type: String, required: true },
    departureAirport: { type: String, required: true }, 
    arrivalCity: { type: String, required: true },
    arrivalAirport: { type: String, required: true }, 

    durationMinutes: { type: Number, required: true } 
});

routeSchema.index({ departureAirport: 1, arrivalAirport: 1 }, { unique: true });

module.exports = mongoose.model('Route', routeSchema);
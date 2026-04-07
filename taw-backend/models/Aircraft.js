const mongoose = require('mongoose');

const aircraftSchema = new mongoose.Schema({
    model: { type: String, required: true },
    
    rows: { type: Number, required: true },       
    seatsPerRow: { type: Number, required: true }, 
    
    airline: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    
    capacityFirst: { type: Number, default: 0 },
    capacityBusiness: { type: Number, default: 0 },
    capacityEconomy: { type: Number, required: true } 
});

aircraftSchema.virtual('totalSeats').get(function() {
    return this.capacityFirst + this.capacityBusiness + this.capacityEconomy;
});

module.exports = mongoose.model('Aircraft', aircraftSchema);
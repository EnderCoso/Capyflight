const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    passenger: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    flight: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Flight', 
        required: true 
    },
    seatNumber: { type: String, required: true },
    
    extras: {
        extraBaggage: { type: Boolean, default: false },
        priorityBoarding: { type: Boolean, default: false },
        extraLegroom: { type: Boolean, default: false }
    },

    totalPrice: { type: Number, required: true },
    purchaseDate: { type: Date, default: Date.now },
    
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' }
});

module.exports = mongoose.model('Ticket', ticketSchema);
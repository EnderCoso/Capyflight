const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
    number: { type: String, required: true },
    type: { 
        type: String, 
        enum: ['economy', 'business', 'first'], 
        default: 'economy' 
    },
    price: { type: Number, required: true },
    isOccupied: { type: Boolean, default: false },
    occupiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
});

const flightSchema = new mongoose.Schema({
    flightCode: { type: String, required: true, unique: true },
    
    airline: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    
    aircraft: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Aircraft', 
        required: false 
    },

    route: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Route', 
        required: true 
    },

    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    duration: { type: Number }, 

    basePrices: {
        economy: Number,
        business: Number,
        first: Number
    },

    seats: [seatSchema],

    status: { 
        type: String, 
        enum: ['scheduled', 'delayed', 'cancelled', 'landed'], 
        default: 'scheduled' 
    }
});

flightSchema.index({ departureCity: 1, arrivalCity: 1, departureTime: 1 });

module.exports = mongoose.model('Flight', flightSchema);
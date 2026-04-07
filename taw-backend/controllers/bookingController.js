const Flight = require('../models/Flight');
const Ticket = require('../models/Ticket');
const User = require('../models/User');

const Route = require('../models/Route');
const Aircraft = require('../models/Aircraft');

//Acquista un biglietto
//POST /api/bookings
exports.bookFlight = async (req, res) => {
    try {
        const { flightId, seatNumber, extras } = req.body;
        const passengerId = req.user._id;

        const flight = await Flight.findById(flightId);
        if (!flight) {
            return res.status(404).json({ message: 'Volo non trovato' });
        }

        const seatIndex = flight.seats.findIndex(s => s.number === seatNumber);
        
        if (seatIndex === -1) {
            return res.status(404).json({ message: 'Posto non esistente su questo aereo' });
        }

        if (flight.seats[seatIndex].isOccupied) {
            return res.status(400).json({ message: 'Posto già occupato! Scegline un altro.' });
        }

        let finalPrice = flight.seats[seatIndex].price;
        
        if (extras) {
            if (extras.extraBaggage) finalPrice += 50;
            if (extras.priorityBoarding) finalPrice += 30;
            if (extras.extraLegroom) finalPrice += 40;
        }

        flight.seats[seatIndex].isOccupied = true;
        flight.seats[seatIndex].occupiedBy = passengerId;
        
        await flight.save(); 

        const ticket = await Ticket.create({
            passenger: passengerId,
            flight: flightId,
            seatNumber: seatNumber,
            extras: extras || {},
            totalPrice: finalPrice,
            status: 'confirmed'
        });

        res.status(201).json({ 
            message: 'Prenotazione confermata!', 
            ticket: ticket 
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

//Ottieni i biglietti dell'utente loggato
//GET /api/bookings/my-tickets
exports.getMyTickets = async (req, res) => {
    try {
        console.log(`Cerco biglietti per utente: ${req.user._id}`);

        const tickets = await Ticket.find({ passenger: req.user._id })
            .populate({
                path: 'flight',
                populate: [
                    { path: 'route' },  
                    { path: 'airline' } 
                ]
            })
            .sort({ createdAt: -1 });

        console.log(`Trovati ${tickets.length} biglietti nel DB.`);

        res.json(tickets);

    } catch (error) {
        console.error("Errore getMyTickets:", error);
        res.status(500).json({ message: error.message });
    }
};
const Route = require('../models/Route');
const Aircraft = require('../models/Aircraft');

// @desc    Crea una nuova rotta (Solo Compagnie)
// @route   POST /api/routes
exports.createRoute = async (req, res) => {
    try {
        const { departureCity, departureAirport, arrivalCity, arrivalAirport, durationMinutes } = req.body;

        if (departureAirport === arrivalAirport) {
            return res.status(400).json({ message: "L'aeroporto di partenza e arrivo non possono coincidere" });
        }

        const newRoute = await Route.create({
            departureCity, departureAirport, arrivalCity, arrivalAirport, durationMinutes
        });

        res.status(201).json(newRoute);
    } catch (error) {
        
        if (error.code === 11000) {
            return res.status(400).json({ message: "Questa rotta esiste già" });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Ottieni tutte le rotte 
// @route   GET /api/routes
exports.getRoutes = async (req, res) => {
    try {
        const routes = await Route.find();
        res.json(routes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Creazione nuovo aereo
//POST /api/aircrafts
exports.createAircraft = async (req, res) => {
    try {
    
        const aircraft = await Aircraft.create({
            ...req.body,       
            airline: req.user._id 
        });

        res.status(201).json(aircraft);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Ottieni aerei della compagnia
//GET /api/aircrafts
exports.getAircrafts = async (req, res) => {
    try {
    
        const aircrafts = await Aircraft.find({ airline: req.user._id });
        
        res.json(aircrafts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const Flight = require('../models/Flight');
const Aircraft = require('../models/Aircraft');
const Ticket = require('../models/Ticket');
const Route = require('../models/Route');
const { User } = require('../models/User');

//Cerca voli (Diretti + Scalo) con range di 7 giorni
// GET /api/flights
exports.searchFlights = async (req, res) => {
    try {
        const { from, to, date } = req.query;

        console.log(`Ricerca Voli avviata. Parametri:`, req.query);

        if ((!from || from === '') && (!to || to === '') && (!date || date === '')) {
            console.log("Modalità Vetrina: Cerco i prossimi voli futuri...");
            
            const upcomingFlights = await Flight.find({
                departureTime: { $gte: new Date() }
            })
            .sort({ departureTime: 1 }) 
            .limit(20)
            .populate('route')
            .populate('airline', 'airlineName');

            const formatted = upcomingFlights
                .filter(f => f.route) 
                .map(f => ({
                    type: 'direct',
                    ...f.toObject(),
                    arrivalTime: new Date(f.departureTime.getTime() + f.route.durationMinutes * 60000)
                }));

            console.log(`Trovati ${formatted.length} voli per la vetrina.`);
            return res.json(formatted);
        }

        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 7); 

        console.log(`Range ricerca: ${startDate.toISOString()} -> ${endDate.toISOString()}`);

        const directRoutes = await Route.find({
            departureCity: { $regex: from, $options: 'i' },
            arrivalCity: { $regex: to, $options: 'i' }
        });
        
        const directFlights = await Flight.find({
            route: { $in: directRoutes.map(r => r._id) },
            departureTime: { $gte: startDate, $lt: endDate }
        }).populate('route').populate('airline', 'airlineName');

        //VOLI CON SCALO
        const startRoutes = await Route.find({ departureCity: { $regex: from, $options: 'i' } });
        const endRoutes = await Route.find({ arrivalCity: { $regex: to, $options: 'i' } });
        
        const firstLegFlights = await Flight.find({
            route: { $in: startRoutes.map(r => r._id) },
            departureTime: { $gte: startDate, $lt: endDate }
        }).populate('route').populate('airline', 'airlineName');

        const secondLegFlights = await Flight.find({
            route: { $in: endRoutes.map(r => r._id) },
            departureTime: { $gte: startDate } 
        }).populate('route').populate('airline', 'airlineName');

        const stopoverFlights = [];

        firstLegFlights.forEach(leg1 => {
            if (!leg1.route) return;

            const arrivalTimeLeg1 = new Date(leg1.departureTime.getTime() + leg1.route.durationMinutes * 60000);

            secondLegFlights.forEach(leg2 => {
                if (!leg2.route) return;

                if (leg1.route.arrivalCity === leg2.route.departureCity) {
                    const diffMs = leg2.departureTime - arrivalTimeLeg1;
                    const diffHours = diffMs / (1000 * 60 * 60);

                    if (diffHours >= 2 && diffHours <= 24) {
                        stopoverFlights.push({
                            type: 'stopover',
                            _id: `${leg1._id}-${leg2._id}`,
                            legs: [leg1, leg2],
                            airline: leg1.airline, 
                            flightCode: `${leg1.flightCode} + ${leg2.flightCode}`,
                            departureCity: leg1.route.departureCity,
                            arrivalCity: leg2.route.arrivalCity,
                            departureTime: leg1.departureTime,
                            arrivalTime: new Date(leg2.departureTime.getTime() + leg2.route.durationMinutes * 60000),
                            stopoverCity: leg1.route.arrivalCity,
                            totalPrice: leg1.priceEconomy + leg2.priceEconomy,
                            stopoverDuration: Math.round(diffHours) + 'h'
                        });
                    }
                }
            });
        });

        const formattedDirect = directFlights
            .filter(f => f.route)
            .map(f => ({
                type: 'direct',
                ...f.toObject(),
                arrivalTime: new Date(f.departureTime.getTime() + f.route.durationMinutes * 60000)
            }));

        const finalResults = [...formattedDirect, ...stopoverFlights];
        console.log(`Risultati trovati: ${formattedDirect.length} diretti, ${stopoverFlights.length} con scalo.`);
        
        res.json(finalResults);

    } catch (error) {
        console.error("ERRORE CRITICO RICERCA:", error);
        res.status(500).json({ message: error.message });
    }
};
//Crea volo
//POST /api/flights
exports.createFlight = async (req, res) => {

    console.log("INIZIO CREAZIONE VOLO (Configurazione Reale)");
    try {
        if (!req.user) return res.status(401).json({ message: "Non autorizzato" });

        const { 
            aircraftId, 
            routeId,
            departureTime,
            priceEconomy, priceBusiness, priceFirst,
        } = req.body;

        const aircraft = await Aircraft.findById(aircraftId);
        if (!aircraft) return res.status(404).json({ message: "Aereo non trovato" });

        const route = await Route.findById(routeId);
        if (!route) return res.status(404).json({ message: "Rotta non trovata" });

        const depTime = new Date(departureTime);
        const arrTime = new Date(depTime.getTime() + route.durationMinutes * 60000);

        let finalSeats = [];
        const colLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].slice(0, aircraft.seatsPerRow);

        let seatsLeftFirst = aircraft.capacityFirst;
        let seatsLeftBusiness = aircraft.capacityBusiness;

        console.log(`Genero mappa per ${aircraft.model}: F:${seatsLeftFirst} | B:${seatsLeftBusiness} | E:Resto`);

        for (let r = 1; r <= aircraft.rows; r++) {
            for (let letter of colLetters) {
                let seatType = 'economy';
                let seatPrice = parseFloat(priceEconomy);

                if (seatsLeftFirst > 0) {
                    seatType = 'first';
                    seatPrice = parseFloat(priceFirst);
                    seatsLeftFirst--;
                } 
        
                else if (seatsLeftBusiness > 0) {
                    seatType = 'business';
                    seatPrice = parseFloat(priceBusiness);
                    seatsLeftBusiness--; 
                }

                finalSeats.push({ 
                    number: `${r}${letter}`, 
                    type: seatType, 
                    price: seatPrice, 
                    isOccupied: false 
                });
            }
        }

        const flight = new Flight({
            flightCode: req.body.flightCode, 
            airline: req.user._id,
            aircraft: aircraft._id,
            route: route._id,
            departureTime: depTime,
            arrivalTime: arrTime, 
            seats: finalSeats,
            basePrices: { economy: parseFloat(priceEconomy), business: parseFloat(priceBusiness), first: parseFloat(priceFirst) }
        });

        const createdFlight = await flight.save();
        console.log("Volo creato con configurazione aereo corretta:", createdFlight.flightCode);
        res.status(201).json(createdFlight);

    } catch (error) {
        console.error("ERRORE:", error);
        res.status(500).json({ message: error.message });
    }
};

//Statistiche per la Compagnia
//GET /api/flights/stats
exports.getAirlineStats = async (req, res) => {
    try {
        
        const myFlights = await Flight.find({ airline: req.user._id }).populate('route');
        
        if (!myFlights.length) {
            return res.json({ 
                totalRevenue: 0, 
                totalPassengers: 0, 
                flightCount: 0, 
                mostFrequentRoute: 'Nessun Volo', 
                flights: [] 
            });
        }

        const flightIds = myFlights.map(f => f._id);
        const tickets = await Ticket.find({ flight: { $in: flightIds } });

        const totalRevenue = tickets.reduce((acc, ticket) => acc + ticket.totalPrice, 0);
        const totalPassengers = tickets.length;

        const routeCounts = {};
        let maxCount = 0;
        let bestRouteObj = null;

        console.log(`Analizzando ${myFlights.length} voli per trovare la rotta top...`);

        myFlights.forEach(f => {
            
            if (f.route && f.route._id) {
                const routeId = f.route._id.toString();
                
                routeCounts[routeId] = (routeCounts[routeId] || 0) + 1;

                if (routeCounts[routeId] > maxCount) {
                    maxCount = routeCounts[routeId];
                    bestRouteObj = f.route;
                }
            } else {
                console.log(`Volo ${f.flightCode} ignorato: Rotta non trovata (Probabilmente cancellata)`);
            }
        });

        let mostFrequentRouteText = 'Dati insuff.';
        
        if (bestRouteObj) {
            mostFrequentRouteText = `${bestRouteObj.departureCity} ➝ ${bestRouteObj.arrivalCity}`;
            console.log(`Vincitore: ${mostFrequentRouteText} con ${maxCount} voli.`);
        } else {
            console.log("Nessuna rotta valida trovata tra i voli esistenti.");
        }

        const statsData = myFlights.map(f => {
            const flightTickets = tickets.filter(t => t.flight.toString() === f._id.toString());
            const revenue = flightTickets.reduce((acc, t) => acc + t.totalPrice, 0);
            
            const routeString = f.route 
                ? `${f.route.departureCity} (${f.route.departureAirport}) ➝ ${f.route.arrivalCity} (${f.route.arrivalAirport})`
                : 'Rotta Cancellata';

            return {
                flightCode: f.flightCode,
                route: routeString,
                revenue,
                passengers: flightTickets.length,
                occupancy: f.seats ? Math.round((flightTickets.length / f.seats.length) * 100) + '%' : 'N/A'
            };
        });

        res.json({
            flightCount: myFlights.length,
            totalPassengers,
            totalRevenue,
            mostFrequentRoute: mostFrequentRouteText,
            flights: statsData
        });

    } catch (error) {
        console.error("Errore Stats Backend:", error);
        res.status(500).json({ message: error.message });
    }
};
//Lista aerei
exports.getAircrafts = async (req, res) => {
    try {
        
        let query = {};
        if (req.user && req.user.role === 'airline') {
            query = { airline: req.user._id };
        }

        const aircrafts = await Aircraft.find(query);
        res.json(aircrafts);
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
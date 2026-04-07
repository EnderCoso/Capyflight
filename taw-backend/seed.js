/*const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { User, Passenger, Airline, Admin } = require('./models/User');
const Aircraft = require('./models/Aircraft');
const Route = require('./models/Route');
const Flight = require('./models/Flight');
const Ticket = require('./models/Ticket');

// Funzione helper per generare i posti
const generateSeats = (aircraft, prices) => {
    let seats = [];
    const colLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].slice(0, aircraft.seatsPerRow);
    let seatsLeftFirst = aircraft.capacityFirst;
    let seatsLeftBusiness = aircraft.capacityBusiness;

    for (let r = 1; r <= aircraft.rows; r++) {
        for (let letter of colLetters) {
            let type = 'economy';
            let price = prices.economy;

            if (seatsLeftFirst > 0) {
                type = 'first';
                price = prices.first;
                seatsLeftFirst--;
            } else if (seatsLeftBusiness > 0) {
                type = 'business';
                price = prices.business;
                seatsLeftBusiness--;
            }

            seats.push({
                number: `${r}${letter}`,
                type: type,
                price: price,
                isOccupied: false,
                occupiedBy: null
            });
        }
    }
    return seats;
};

const seedData = async () => {
    try {
        console.log('--- INIZIO SEEDING ---');

        console.log('Pulizia Database in corso...');
        await Ticket.deleteMany({});
        await Flight.deleteMany({});
        await Aircraft.deleteMany({});
        await Route.deleteMany({});
        await User.deleteMany({});
        console.log('Database pulito.');

        // 1. CREAZIONE UTENTI
        console.log('Creazione Utenti...');
        
        // Admin
        await Admin.create({
            email: 'admin@skytaw.com',
            password: 'password123',
            role: 'admin'
        });

        // Compagnie Aeree
        const airline1 = await Airline.create({
            email: 'info@lufthansa.com',
            password: 'password123',
            airlineName: 'Lufthansa',
            iataCode: 'LH',
            mustChangePassword: false
        });

        const airline2 = await Airline.create({
            email: 'info@ryanair.com',
            password: 'password123',
            airlineName: 'Ryanair',
            iataCode: 'FR',
            mustChangePassword: false
        });

        // Passeggeri
        const passengers = await Passenger.create([
            { email: 'mario.rossi@test.com', password: 'password123', name: 'Mario', surname: 'Rossi', birthDate: new Date('1990-01-01') },
            { email: 'luigi.verdi@test.com', password: 'password123', name: 'Luigi', surname: 'Verdi', birthDate: new Date('1985-05-20') },
            { email: 'anna.bianchi@test.com', password: 'password123', name: 'Anna', surname: 'Bianchi', birthDate: new Date('1995-12-12') },
        ]);

        // 2. CREAZIONE AEREI
        console.log('Creazione Flotta...');
        
        const ac1 = await Aircraft.create({
            model: 'Boeing 747',
            rows: 30, seatsPerRow: 6,
            capacityFirst: 12, capacityBusiness: 24, capacityEconomy: 144,
            airline: airline1._id
        });

        const ac2 = await Aircraft.create({
            model: 'Airbus A320',
            rows: 20, seatsPerRow: 6,
            capacityFirst: 0, capacityBusiness: 0, capacityEconomy: 120,
            airline: airline1._id
        });

        const ac3 = await Aircraft.create({
            model: 'Boeing 737',
            rows: 25, seatsPerRow: 6,
            capacityFirst: 0, capacityBusiness: 10, capacityEconomy: 140,
            airline: airline2._id 
        });

        // 3. CREAZIONE ROTTE
        console.log('Creazione Rotte...');
        
        const route1 = await Route.create({ departureCity: 'Roma', departureAirport: 'FCO', arrivalCity: 'New York', arrivalAirport: 'JFK', durationMinutes: 540 });
        const route2 = await Route.create({ departureCity: 'Milano', departureAirport: 'MXP', arrivalCity: 'Roma', arrivalAirport: 'FCO', durationMinutes: 60 });
        const route3 = await Route.create({ departureCity: 'Roma', departureAirport: 'FCO', arrivalCity: 'Palermo', arrivalAirport: 'PMO', durationMinutes: 70 });

        // 4. CREAZIONE VOLI
        console.log('Creazione Voli...');
        
        const flights = [];
        const today = new Date();

        for (let i = 0; i < 7; i++) {
            const flightDate = new Date(today);
            flightDate.setDate(today.getDate() + i);
            flightDate.setHours(10 + i, 0, 0, 0);

            const prices1 = { economy: 400, business: 1200, first: 3000 };
            flights.push(new Flight({
                flightCode: `LH${100 + i}`,
                airline: airline1._id,
                aircraft: ac1._id,
                route: route1._id,
                departureTime: flightDate,
                arrivalTime: new Date(flightDate.getTime() + route1.durationMinutes * 60000),
                basePrices: prices1,
                seats: generateSeats(ac1, prices1)
            }));
        }

        const savedFlights = await Flight.insertMany(flights);
        
        // 5. EMISSIONE BIGLIETTI TEST
        console.log('Emissione Biglietti test...');
        const targetFlight = savedFlights[0];
        const targetPassenger = passengers[0];
        const seatToBook = targetFlight.seats[0]; 

        // Aggiorna posto occupato
        await Flight.updateOne(
            { _id: targetFlight._id, "seats.number": seatToBook.number },
            { 
                $set: { 
                    "seats.$.isOccupied": true, 
                    "seats.$.occupiedBy": targetPassenger._id 
                } 
            }
        );

        // Crea biglietto
        await Ticket.create({
            passenger: targetPassenger._id,
            flight: targetFlight._id,
            seatNumber: seatToBook.number,
            totalPrice: seatToBook.price,
            extras: { extraBaggage: true },
            status: 'confirmed'
        });

        console.log('--- SEEDING COMPLETATO ---');
    } catch (error) {
        console.error('ERRORE SEED:', error);
    }
};

module.exports = seedData;*/
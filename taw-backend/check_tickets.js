require('dotenv').config();
const mongoose = require('mongoose');

// --- IMPORTIAMO TUTTI I MODELLI NECESSARI ---
const { User, Passenger } = require('./models/User');
const Ticket = require('./models/Ticket');
const Flight = require('./models/Flight');
const Route = require('./models/Route');     // <--- AGGIUNTO (Era questo che mancava)
const Aircraft = require('./models/Aircraft'); // <--- AGGIUNTO (Per sicurezza)

// Configurazione Database
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/taw-db';

const checkTickets = async () => {
    try {
        console.log('🔌 Connessione al Database...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connesso.');

        // 1. Trova tutti i passeggeri
        const passengers = await Passenger.find({});
        console.log(`\n👥 Trovati ${passengers.length} passeggeri nel sistema.\n`);

        // 2. Per ogni passeggero, cerca i biglietti
        for (const p of passengers) {
            const tickets = await Ticket.find({ passenger: p._id })
                .populate({
                    path: 'flight',
                    populate: { path: 'route' } 
                });

            console.log(`--------------------------------------------------`);
            console.log(`👤 PASSEGGERO: ${p.name} ${p.surname} (${p.email})`);
            console.log(`   ID: ${p._id}`);
            console.log(`🎫 Biglietti Trovati: ${tickets.length}`);

            if (tickets.length > 0) {
                tickets.forEach((t, index) => {
                    // Controllo se il volo esiste ancora o è stato cancellato
                    if (t.flight && t.flight.route) {
                        console.log(`   ${index + 1}. [${t.status.toUpperCase()}] Volo ${t.flight.flightCode}: ${t.flight.route.departureCity} -> ${t.flight.route.arrivalCity} (Posto: ${t.seatNumber})`);
                    } else {
                        console.log(`   ${index + 1}. ⚠️ BIGLIETTO CORROTTO (Volo o Rotta cancellati). ID Volo: ${t.flight}`);
                    }
                });
            } else {
                console.log(`   (Nessuna prenotazione attiva)`);
            }
        }
        
        console.log(`\n--------------------------------------------------`);
        console.log('✅ Controllo terminato.');
        process.exit();

    } catch (error) {
        console.error('❌ ERRORE:', error);
        process.exit(1);
    }
};

checkTickets();
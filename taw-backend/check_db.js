const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Aircraft = require('./models/Aircraft');

dotenv.config(); // Carica variabili d'ambiente

// IMPORTANTE: Stampa dove sta provando a connettersi
const dbUrl = process.env.MONGO_URI || 'mongodb://mongo:27017/taw-db'; 
console.log("🕵️  URL Database rilevato:", dbUrl);

mongoose.connect(dbUrl)
    .then(async () => {
        console.log("✅ Connesso! Controllo i dati...");
        
        const userCount = await User.countDocuments();
        const users = await User.find({}, 'email role'); // Mostra solo email e ruolo
        
        const aircraftCount = await Aircraft.countDocuments();
        
        console.log("------------------------------------------------");
        console.log(`👥 Utenti trovati: ${userCount}`);
        users.forEach(u => console.log(`   - ${u.email} (${u.role})`));
        console.log("------------------------------------------------");
        console.log(`✈️  Aerei trovati: ${aircraftCount}`);
        console.log("------------------------------------------------");
        
        process.exit();
    })
    .catch(err => {
        console.error("❌ Errore connessione:", err);
        process.exit(1);
    });
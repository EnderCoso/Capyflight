const express = require('express');
const cors = require('cors');
const connectDB = require('./database');
const seedData = require('./seed');
const flightRoutes = require('./routes/flightRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const managementRoutes = require('./routes/managementRoutes');

require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/airlines', managementRoutes); //api/admin

app.get('/api/', (req, res) => {
    res.json({ 
        version: '1.5.7', 
        message: 'Versione API' 
    });
});

const startServer = async () => {
    try {
        await connectDB();

        //await seedData(); 

        app.listen(PORT, '0.0.0.0',() => {
            console.log(`Server attivo sulla porta ${PORT}`);
        });
    } catch (error) {
        console.error("Errore critico all'avvio:", error);
    }
};

startServer();

app.get('/api/test', async (req, res) => {
    const User = require('./models/User');
    const users = await User.find({}, 'email role'); 
    res.json({ message: "Backend funzionante!", usersFound: users });
});
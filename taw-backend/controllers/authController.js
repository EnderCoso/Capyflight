const { User, Passenger, Airline } = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const Aircraft = require('../models/Aircraft'); 
const Route = require('../models/Route');
const Flight = require('../models/Flight');

// Genera il Token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Il login dura 30 giorni
    });
};

//Registra un nuovo passeggero
//POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { email, password, name, surname, birthDate } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Utente già esistente' });
        }

        const user = await Passenger.create({
            email,
            password,
            name,
            surname,
            birthDate,
            mustChangePassword: false
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role)
            });
        } else {
            res.status(400).json({ message: 'Dati utente non validi' });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Creazione account compagnia aerea
exports.createAirline = async (req, res) => {
    try {
        const { email, tempPassword } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'Email già in uso' });

        const user = await Airline.create({
            email,
            password: tempPassword, 
            mustChangePassword: true 
        });

        res.status(201).json({
            message: 'Compagnia invitata con successo. Comunica la password temporanea.',
            email: user.email,
            tempPassword: tempPassword 
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
//Login utente & ottieni token
//POST /api/auth/login
exports.login = async (req, res) => {

    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name || user.airlineName,
                email: user.email,
                role: user.role,
                mustChangePassword: user.mustChangePassword,
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(401).json({ message: 'Credenziali non valide' });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Completa setup compagnia aerea
exports.completeSetup = async (req, res) => {
    try {
        
        const { newPassword, airlineName, iataCode } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) return res.status(404).json({ message: 'Utente non trovato' });

        user.password = newPassword; 
        user.airlineName = airlineName;
        user.iataCode = iataCode;
        user.mustChangePassword = false; 

        await user.save();

        res.json({ 
            message: 'Account configurato con successo!',
            user: {
                _id: user._id,
                email: user.email,
                role: user.role,
                airlineName: user.airlineName
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Cancellazione utente
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Utente non trovato' });

        if (user.role === 'admin') {
            return res.status(400).json({ message: 'Non puoi cancellare un admin' });
        }

        if (user.role === 'airline') {
            
            await Aircraft.deleteMany({ airline: user._id });
            
        }

        await user.deleteOne(); 
        
        res.json({ message: 'Utente e dati associati eliminati con successo' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Vedere lista utenti
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
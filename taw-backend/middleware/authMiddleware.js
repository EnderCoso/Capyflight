const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {

            token = req.headers.authorization.split(' ')[1];
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            res.status(401).json({ message: 'Non autorizzato, token fallito' });
        }
    } else {
        res.status(401).json({ message: 'Non autorizzato, nessun token' });
    }
};

const adminOnly = (req, res, next) => {

    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Accesso negato: Solo Admin Supremo' });
    }
};

const airlineOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'airline' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Accesso negato: Solo Compagnie Aeree' });
    }
};

module.exports = { protect, airlineOnly, adminOnly };
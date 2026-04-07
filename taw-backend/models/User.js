const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const options = { discriminatorKey: 'role', timestamps: true };

const userSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true, 
        trim: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    mustChangePassword: { type: Boolean, default: false },

    role: { 
        type: String, 
        enum: ['admin', 'airline', 'passenger'], 
        required: true 
    }
}, options);

//Metodi e Middleware comuni (Hashing password)
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

//Sottoclasse PASSENGER
const Passenger = User.discriminator('passenger', 
    new mongoose.Schema({
        name: { type: String, required: true },
        surname: { type: String, required: true },
        birthDate: { type: Date, required: true }
    })
);

//Sottoclasse AIRLINE
const Airline = User.discriminator('airline', 
    new mongoose.Schema({
        airlineName: { type: String},
        iataCode: { type: String, uppercase: true}
    })
);

//Sottoclasse ADMIN 
const Admin = User.discriminator('admin', new mongoose.Schema({}));

module.exports = { User, Passenger, Airline, Admin };
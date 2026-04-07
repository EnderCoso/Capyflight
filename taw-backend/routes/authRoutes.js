const express = require('express');
const router = express.Router();
const { register, login, createAirline, completeSetup, deleteUser, getAllUsers } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/users', register);    //register
router.post('/sessions', login);    //login

router.put('/airlines', protect, completeSetup); //complete-setup

router.post('/airlines', protect, adminOnly, createAirline);  //create-airline
router.delete('/users/:id', protect, adminOnly, deleteUser);
router.get('/users', protect, adminOnly, getAllUsers); 

module.exports = router;
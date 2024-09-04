const express = require('express');
const ReservationService = require('../service/ReservationService')

const ReservationController = express.Router();

ReservationController.post('/create', (req, res)=>{

})

ReservationController.post('/update', (req, res)=>{

})

ReservationController.post('/get', (req, res)=>{

})

ReservationController.post('/getActive', async (req, res)=>{
    try { 
        const reservations = await ReservationService.getAllReservations();
        res.status(200).json(reservations);
    } catch (error) {
        console.error('Error getting reservations:', error);
        res.status(500).json({ error: error.message });
    }
})

ReservationController.post('/delete', (req, res)=>{

})

module.exports = ReservationController
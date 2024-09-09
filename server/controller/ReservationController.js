const express = require('express');
const ReservationService = require('../service/ReservationService')
const ReservationController = express.Router();

ReservationController.post('/create', async (req, res)=>{
    try { 
        const reservations = await ReservationService.addUserReservation(req.body.date, req.body.time, req.body.email);
        res.status(200).json(reservations);
    } catch (error) {
        console.error('Error getting reservations:', error);
        res.status(500).json({ error: error.message });
    }
})


ReservationController.get('/getActive', async (req, res)=>{
    try { 
        const reservation = await ReservationService.getAllReservations();
        res.status(200).json(reservation);
    } catch (error) {
        console.error('Error adding reservation for user:', error);
        res.status(500).json({ error: error.message });
    }
})

ReservationController.post('/delete', async (req, res)=>{
    try { 
        const reservation = await ReservationService.cancelReservation(req.body.date, req.body.time, req.body.email);
        res.status(200).json(reservation);
    } catch (error) {
        console.error('Error adding reservation for user:', error);
        res.status(500).json({ error: error.message });
    }
})

module.exports = ReservationController
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const ReservationController = require('./controller/ReservationController');
const UserController = require('./controller/UserController');
const ReservationService = require('./service/ReservationService');

const reservationService = new ReservationService();
reservationService.startAutoReservationManagement();

app.use('/users', UserController);
app.use('/reservations', ReservationController);

app.listen(port, () => {
  console.log(`Express server running on port ${port}`);
});
